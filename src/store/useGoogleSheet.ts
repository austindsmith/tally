import { create } from "zustand";

import { getSheetId } from "@/utils/parseUrl";

type GoogleSheetStore = {
  url: string;
  id: string;
  sheets: string[];
  data: any[];
  loading: boolean;
  setSheetUrl: (url: string) => void;
};

export const useGoogleSheet = create<GoogleSheetStore>((set) => ({
  url: "https://docs.google.com/spreadsheets/d/1aSm4nwINqe_GxEDEjNlBy21mJzHi9Ort5iZJtpGBCyQ/edit?pli=1&gid=0#gid=0",
  id: "",
  sheets: [],
  data: [],
  loading: false,
  setSheetUrl: async (url) => {
    const id = getSheetId(url);
    const sheets = await getSheetNames(id);
    set({ url, id, sheets });
  },
}));
