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
import type { Room } from "@/lib/api";

interface AppFlowState {
  room: Room | null;
  selectedStyle: DesignStyle | null;
  redesignedImageUrl: string | null;
}

interface AppFlowContextValue extends AppFlowState {
  beginWithRoom: (room: Room) => void;
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
};

export function AppFlowProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppFlowState>(emptyState);

  const beginWithRoom = useCallback(
    (room: Room) => {
      setState({
        room,
        selectedStyle: null,
        redesignedImageUrl: null,
      });
      setLocation(`/rooms/${room.id}/style`);
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
