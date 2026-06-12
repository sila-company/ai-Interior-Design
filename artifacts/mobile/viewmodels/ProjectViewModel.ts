import { useState, useCallback } from "react";
import { DatabaseService } from "@/services/DatabaseService";
import { MockAIService } from "@/services/MockAIService";
import type { Project } from "@workspace/api-client-react";

export interface ProjectViewModelState {
  photoUri: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  project: Project | null;
}

export function useProjectViewModel() {
  const [state, setState] = useState<ProjectViewModelState>({
    photoUri: null,
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
    project: null,
  });

  const setPhotoUri = useCallback((uri: string) => {
    setState((prev) => ({ ...prev, photoUri: uri, uploadError: null }));
  }, []);

  const uploadAndAnalyze = useCallback(async (): Promise<Project | null> => {
    if (!state.photoUri) return null;

    setState((prev) => ({ ...prev, isUploading: true, uploadProgress: 0, uploadError: null }));

    try {
      setState((prev) => ({ ...prev, uploadProgress: 20 }));
      const analysis = await MockAIService.analyzeRoomPhoto(state.photoUri!);

      setState((prev) => ({ ...prev, uploadProgress: 60 }));
      const project = await DatabaseService.createProject({
        photoUri: state.photoUri!,
        roomType: analysis.roomType,
      });

      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        project,
      }));

      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        uploadError: message,
      }));
      return null;
    }
  }, [state.photoUri]);

  const reset = useCallback(() => {
    setState({
      photoUri: null,
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
      project: null,
    });
  }, []);

  return { state, setPhotoUri, uploadAndAnalyze, reset };
}
