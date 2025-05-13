import { create } from "zustand";
import type { StateCreator } from "zustand";

import type { GoalXpSlice } from "~/stores/createGoalXpStore";
import { createGoalXpSlice } from "~/stores/createGoalXpStore";

import type { LanguageSlice } from "~/stores/createLanguageStore";
import { createLanguageSlice } from "~/stores/createLanguageStore";

import type { LessonSlice } from "~/stores/createLessonStore";
import { createLessonSlice } from "~/stores/createLessonStore";

import type { LingotSlice } from "~/stores/createLingotStore";
import { createLingotSlice } from "~/stores/createLingotStore";

import type { SoundSettingsSlice } from "~/stores/createSoundSettingsStore";
import { createSoundSettingsSlice } from "~/stores/createSoundSettingsStore";

import type { StreakSlice } from "~/stores/createStreakStore";
import { createStreakSlice } from "~/stores/createStreakStore";

import type { UserSlice } from "~/stores/createUserStore";
import { createUserSlice } from "~/stores/createUserStore";

import type { XpSlice } from "~/stores/createXpStore";
import { createXpSlice } from "~/stores/createXpStore";

// 💡 Junta todos los tipos de slices para formar el estado total
export type BoundState = GoalXpSlice &
  LanguageSlice &
  LessonSlice &
  LingotSlice &
  SoundSettingsSlice &
  StreakSlice &
  UserSlice &
  XpSlice & {
    setLessonsCompleted: (value: number) => void; // Nueva función para actualizar lessonsCompleted
    unitProgress: Record<number, number>; // unitNumber -> progreso
    setUnitProgress: (unit: number, value: number) => void;
    increaseUnitProgress: (unit: number, increment?: number) => void;
  };

//  Tipo para definir un slice dentro de BoundState
export type BoundStateCreator<SliceState> = StateCreator<
  BoundState,
  [],
  [],
  SliceState
>;

export const useBoundStore = create<BoundState>((set, get, api) => ({
  ...createGoalXpSlice(set, get, api),
  ...createLanguageSlice(set, get, api),
  ...createLessonSlice(set, get, api),
  ...createLingotSlice(set, get, api),
  ...createSoundSettingsSlice(set, get, api),
  ...createStreakSlice(set, get, api),
  ...createUserSlice(set, get, api),
  ...createXpSlice(set, get, api),
  setLessonsCompleted: (value: number) => {
    set({ lessonsCompleted: value });
  },
  increaseLessonsCompleted: (increment = 1) => {
    set((state: BoundState) => ({
      lessonsCompleted: state.lessonsCompleted + increment,
    }));
  },
  unitProgress: {},
  setUnitProgress: (unit, value) => {
    set((state) => ({
      unitProgress: { ...state.unitProgress, [unit]: value },
    }));
  },
  increaseUnitProgress: (unit, increment = 1) => {
    set((state) => ({
      unitProgress: {
        ...state.unitProgress,
        [unit]: (state.unitProgress[unit] || 0) + increment,
      },
    }));
  },
}));
