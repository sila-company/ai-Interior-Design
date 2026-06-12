import { useState, useCallback } from "react";
import { DatabaseService } from "@/services/DatabaseService";
import type { UserProfile } from "@workspace/api-client-react";

export type StylePreference =
  | "Modern"
  | "Scandinavian"
  | "Industrial"
  | "Bohemian"
  | "Traditional"
  | "Minimalist";

export type ColorPalette =
  | "Neutral"
  | "Warm"
  | "Cool"
  | "Bold"
  | "Earth"
  | "Monochrome";

export type BudgetRange =
  | "Under $2,000"
  | "$2,000 – $5,000"
  | "$5,000 – $10,000"
  | "$10,000+";

export const BUDGET_VALUES: Record<BudgetRange, number> = {
  "Under $2,000": 1999,
  "$2,000 – $5,000": 5000,
  "$5,000 – $10,000": 10000,
  "$10,000+": 25000,
};

export interface QuizViewModelState {
  stylePreference: StylePreference | null;
  colorPalette: ColorPalette | null;
  budgetRange: BudgetRange | null;
  isSaving: boolean;
  saveError: string | null;
  savedProfile: UserProfile | null;
}

export function useQuizViewModel(projectId: string) {
  const [state, setState] = useState<QuizViewModelState>({
    stylePreference: null,
    colorPalette: null,
    budgetRange: null,
    isSaving: false,
    saveError: null,
    savedProfile: null,
  });

  const setStylePreference = useCallback((style: StylePreference) => {
    setState((prev) => ({ ...prev, stylePreference: style }));
  }, []);

  const setColorPalette = useCallback((palette: ColorPalette) => {
    setState((prev) => ({ ...prev, colorPalette: palette }));
  }, []);

  const setBudgetRange = useCallback((budget: BudgetRange) => {
    setState((prev) => ({ ...prev, budgetRange: budget }));
  }, []);

  const isComplete =
    state.stylePreference !== null &&
    state.colorPalette !== null &&
    state.budgetRange !== null;

  const saveProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!isComplete) return null;

    setState((prev) => ({ ...prev, isSaving: true, saveError: null }));

    try {
      const profile = await DatabaseService.saveUserProfile({
        stylePreference: state.stylePreference!,
        colorPalette: state.colorPalette!,
        budget: BUDGET_VALUES[state.budgetRange!],
        projectId,
      });

      setState((prev) => ({ ...prev, isSaving: false, savedProfile: profile }));
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setState((prev) => ({ ...prev, isSaving: false, saveError: message }));
      return null;
    }
  }, [isComplete, state, projectId]);

  return {
    state,
    isComplete,
    setStylePreference,
    setColorPalette,
    setBudgetRange,
    saveProfile,
  };
}
