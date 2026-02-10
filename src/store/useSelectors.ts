import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import _ from "lodash";
import { getSheetId } from "@/utils/googleSheets";

type SelectorStore = {
  selector: string;
  setSelector: (selector: string) => void;
};

export const useSelectors = create<SelectorStore>()(
  persist(
    (set, get) => ({
      selector: "",

      setSelector: async (selector) => {
        set(() => ({ selector: selector }));
      },
    }),
    {
      name: "selector-storage",
    },
  ),
);
