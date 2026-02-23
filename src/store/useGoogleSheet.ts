import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import _ from "lodash";
import { getSheetId } from "@/utils/googleSheets";

type GoogleSheetStore = {
  url: string;
  id: string;
  sheets: string[];
  selectedSheet: string;
  data: any[];
  dataObjects: Record<string, any>;
  loading: boolean;
  setSheetUrl: (url: string) => void;
  setSelectedSheet: (name: string) => void;
  setDataObject: (data: any[]) => void;
  initFromDefault: () => void;
};

export const useGoogleSheet = create<GoogleSheetStore>()(
  persist(
    (set, get) => ({
      url: "",
      id: "",
      sheets: [],
      selectedSheet: "",
      data: [],
      dataObjects: {},
      loading: false,
      setSheetUrl: async (url) => {
        const id = getSheetId(url);
        set({ url, id, selectedSheet: "", data: [], dataObjects: {} });
        const sheets = await getSheetNames(id);
        set({ sheets });
      },
      setSelectedSheet: async (name) => {
        set(() => ({ selectedSheet: name }));

        const { id } = get();

        const data = await readSheet(id, name);
        set({ data });
      },
      setDataObject: async (arrayData) => {
        const [headers, ...rows] = arrayData;
        const objects = _.zipObject(headers, rows);

        //TODO: Make this return an array of objects rather than a column key and array value
        set({ dataObjects: objects });
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
