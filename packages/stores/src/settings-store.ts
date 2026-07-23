import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

type SettingsState = {
  theme: Theme;
  autoLockMinutes: number;
  setTheme: (theme: Theme) => void;
  setAutoLockMinutes: (minutes: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      autoLockMinutes: 5,
      setTheme: (theme) => set({ theme }),
      setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
    }),
    { name: "hd-wallet-settings" },
  ),
);
