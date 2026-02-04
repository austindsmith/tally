import { create } from "zustand";

import { getSheetId } from "@/utils/parseUrl";

type GoogleSheetStore = {
  url: string;
  id: string;
  sheets: string[];
  selectedSheet: string;
  data: any[];
  loading: boolean;
  setSheetUrl: (url: string) => void;
  setSelectedSheet: (name: string) => void;
};

export const useGoogleSheet = create<GoogleSheetStore>((set, get) => ({
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

    console.log(`Name: ${name}, ID: ${id}`);

    const data = await readSheet(id, name);
    set({ data });
    console.log(data);
  },
}));
