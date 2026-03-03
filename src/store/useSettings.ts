import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  activeView: string;
  setActiveView: (view: string) => void;
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      activeView: "login",
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: "settings-storage",
    },
  ),
);
