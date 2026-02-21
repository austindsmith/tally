import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import _ from "lodash";
import { getSheetId } from "@/utils/googleSheets";

type SelectorStore = {
  selector: string;
  setSelector: (selector: string) => void;
  startPick: () => Promise<void>;
  checkForPick: () => Promise<void>;
};

export const useSelectors = create<SelectorStore>()(
  persist(
    (set, get) => ({
      selector: "",

      setSelector: (selector) => set({ selector }),

      startPick: async () => {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab?.id) return;
        await browser.tabs.sendMessage(tab.id, { type: "start-picker" });
        window.close();
      },

      checkForPick: async () => {
        const { pickedSelector } =
          await browser.storage.local.get("pickedSelector");
        if (pickedSelector) {
          console.log(pickedSelector);
          await browser.storage.local.remove("pickedSelector");
          set({ selector: pickedSelector as string });
        }
      },
    }),
    {
      name: "selector-storage",
    },
  ),
);
