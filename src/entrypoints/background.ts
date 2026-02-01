import { getSheetId } from "../utils/parseUrl";
import { getSheetNames, readSheet } from "@/utils/googleSheets";
import { googleSheetUrl, sheetData } from "@/utils/storage";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === "FETCH_SHEET") {
      const url = await googleSheetUrl.getValue();
      const sheetId = getSheetId(url);
      const sheetNames = await getSheetNames(sheetId);
      const values = await readSheet(sheetId, sheetNames);
      await sheetData.setValue(values);
      return;
    }
    if (message.type === "AUTHENTICATE") {
      return;
    }
  });
});
