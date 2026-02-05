import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getSheetId } from "@/utils/googleSheets";

type GoogleSheetStore = {
  url: string;
  id: string;
  sheets: string[];
  selectedSheet: string;
  data: any[];
  loading: boolean;
  setSheetUrl: (url: string) => void;
  setSelectedSheet: (name: string) => void;
  initFromDefault: () => void;
};

export const useGoogleSheet = create<GoogleSheetStore>()(
  persist(
    (set, get) => ({
      url: "https://docs.google.com/spreadsheets/d/1aSm4nwINqe_GxEDEjNlBy21mJzHi9Ort5iZJtpGBCyQ/edit?pli=1&gid=0#gid=0",
      id: "",
      sheets: [],
      selectedSheet: "",
      data: [],
      loading: false,
      setSheetUrl: async (url) => {
        const id = getSheetId(url);
        const sheets = await getSheetNames(id);
        set({ url, id, sheets });
      },
      setSelectedSheet: async (name) => {
        set(() => ({ selectedSheet: name }));

        const { id } = get();

        const data = await readSheet(id, name);
        set({ data });
      },
      initFromDefault: async () => {
        const { url, selectedSheet } = get();

        if (!url) {
          return;
        }

        const id = await getSheetId(url);
        const sheets = await getSheetNames(id);

        set({ id, sheets });

        if (selectedSheet && sheets.includes(selectedSheet)) {
          const data = await readSheet(id, selectedSheet);
          set({ data });
        }
      },
    }),
    {
      name: "google-storage",
    },
  ),
);
