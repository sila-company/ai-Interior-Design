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
import type { Redesign, Room } from "@/lib/api";
import { enrichStyle, getStyleName } from "@/lib/styles";

interface AppFlowState {
  room: Room | null;
  selectedStyle: DesignStyle | null;
  redesignedImageUrl: string | null;
  savedRedesignId: string | null;
}

interface AppFlowContextValue extends AppFlowState {
  openRoom: (room: Room) => void;
  beginNewRedesign: (room: Room) => void;
  viewSavedRedesign: (room: Room, redesign: Redesign) => void;
  selectStyle: (style: DesignStyle) => void;
  beginGeneration: () => void;
  completeGeneration: (imageUrl: string) => void;
  tryAnotherStyle: () => void;
  startOver: () => void;
}

const AppFlowContext = createContext<AppFlowContextValue | null>(null);

const emptyState: AppFlowState = {
  room: null,
  selectedStyle: null,
  redesignedImageUrl: null,
  savedRedesignId: null,
};

export function AppFlowProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppFlowState>(emptyState);

  const openRoom = useCallback(
    (room: Room) => {
      setState({
        room,
        selectedStyle: null,
        redesignedImageUrl: null,
        savedRedesignId: null,
      });
      setLocation(`/rooms/${room.id}`);
    },
    [setLocation],
  );

  const beginNewRedesign = useCallback(
    (room: Room) => {
      setState({
        room,
        selectedStyle: null,
        redesignedImageUrl: null,
        savedRedesignId: null,
      });
      setLocation(`/rooms/${room.id}/style`);
    },
    [setLocation],
  );

  const viewSavedRedesign = useCallback(
    (room: Room, redesign: Redesign) => {
      setState({
        room,
        selectedStyle: enrichStyle({
          id: redesign.styleId,
          name: getStyleName(redesign.styleId),
          description: "",
          icon: "sparkles",
        }),
        redesignedImageUrl: redesign.resultImageUrl,
        savedRedesignId: redesign.id,
      });
      setLocation(`/rooms/${room.id}/results`);
    },
    [setLocation],
  );

  const selectStyle = useCallback(
    (style: DesignStyle) => {
      setState((current) => {
        if (current.room) {
          setLocation(`/rooms/${current.room.id}/summary`);
        }
        return {
          ...current,
          selectedStyle: style,
          savedRedesignId: null,
        };
      });
    },
    [setLocation],
  );

  const beginGeneration = useCallback(() => {
    if (state.room) {
      setLocation(`/rooms/${state.room.id}/generating`);
    }
  }, [setLocation, state.room]);

  const completeGeneration = useCallback(
    (imageUrl: string) => {
      setState((current) => ({
        ...current,
        redesignedImageUrl: imageUrl,
        savedRedesignId: null,
      }));
      if (state.room) {
        setLocation(`/rooms/${state.room.id}/results`);
      }
    },
    [setLocation, state.room],
  );

  const tryAnotherStyle = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedStyle: null,
      redesignedImageUrl: null,
      savedRedesignId: null,
    }));
    if (state.room) {
      setLocation(`/rooms/${state.room.id}/style`);
    }
  }, [setLocation, state.room]);

  const startOver = useCallback(() => {
    setState(emptyState);
    setLocation("/rooms");
  }, [setLocation]);

  const value = useMemo(
    () => ({
      ...state,
      openRoom,
      beginNewRedesign,
      viewSavedRedesign,
      selectStyle,
      beginGeneration,
      completeGeneration,
      tryAnotherStyle,
      startOver,
    }),
    [
      state,
      openRoom,
      beginNewRedesign,
      viewSavedRedesign,
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
