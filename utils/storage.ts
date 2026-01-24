import { storage } from "#imports";

export const googleSheetUrl = storage.defineItem<string>(
  "local:googleSheetUrl",
  {
    fallback: "",
  },
);
