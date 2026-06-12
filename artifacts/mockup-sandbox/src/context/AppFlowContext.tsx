import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";

import type { DesignStyle } from "@/lib/styles";

interface AppFlowState {
  roomImageUrl: string | null;
  roomImageFile: File | null;
  selectedStyle: DesignStyle | null;
  redesignedImageUrl: string | null;
}

interface AppFlowContextValue extends AppFlowState {
  beginWithRoom: (file: File, previewUrl: string) => void;
  selectStyle: (style: DesignStyle) => void;
  beginGeneration: () => void;
  completeGeneration: (imageUrl: string) => void;
  tryAnotherStyle: () => void;
  startOver: () => void;
}

const AppFlowContext = createContext<AppFlowContextValue | null>(null);

const emptyState: AppFlowState = {
  roomImageUrl: null,
  roomImageFile: null,
  selectedStyle: null,
  redesignedImageUrl: null,
};

export function AppFlowProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppFlowState>(emptyState);

  const beginWithRoom = useCallback(
    (file: File, previewUrl: string) => {
      setState({
        roomImageUrl: previewUrl,
        roomImageFile: file,
        selectedStyle: null,
        redesignedImageUrl: null,
      });
      setLocation("/style");
    },
    [setLocation],
  );

  const selectStyle = useCallback(
    (style: DesignStyle) => {
      setState((current) => ({
        ...current,
        selectedStyle: style,
      }));
      setLocation("/summary");
    },
    [setLocation],
  );

  const beginGeneration = useCallback(() => {
    setLocation("/generating");
  }, [setLocation]);

  const completeGeneration = useCallback(
    (imageUrl: string) => {
      setState((current) => ({
        ...current,
        redesignedImageUrl: imageUrl,
      }));
      setLocation("/results");
    },
    [setLocation],
  );

  const tryAnotherStyle = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedStyle: null,
      redesignedImageUrl: null,
    }));
    setLocation("/style");
  }, [setLocation]);

  const startOver = useCallback(() => {
    if (state.roomImageUrl) {
      URL.revokeObjectURL(state.roomImageUrl);
    }
    if (state.redesignedImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(state.redesignedImageUrl);
    }
    setState(emptyState);
    setLocation("/");
  }, [setLocation, state.redesignedImageUrl, state.roomImageUrl]);

  const value = useMemo(
    () => ({
      ...state,
      beginWithRoom,
      selectStyle,
      beginGeneration,
      completeGeneration,
      tryAnotherStyle,
      startOver,
    }),
    [
      state,
      beginWithRoom,
      selectStyle,
      beginGeneration,
      completeGeneration,
      tryAnotherStyle,
      startOver,
    ],
  );

  return (
    <AppFlowContext.Provider value={value}>{children}</AppFlowContext.Provider>
  );
}

export function useAppFlow(): AppFlowContextValue {
  const context = useContext(AppFlowContext);
  if (!context) {
    throw new Error("useAppFlow must be used within AppFlowProvider");
  }
  return context;
}
