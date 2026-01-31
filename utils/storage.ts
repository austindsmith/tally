import { storage } from "#imports";

export const googleSheetUrl = storage.defineItem<string>(
  "local:googleSheetUrl",
  {
    fallback:
      "https://docs.google.com/spreadsheets/d/1aSm4nwINqe_GxEDEjNlBy21mJzHi9Ort5iZJtpGBCyQ/edit?usp=sharing",
  },
);
export const sheetData = storage.defineItem<any[]>("local:sheetData", {
  fallback: [],
});
