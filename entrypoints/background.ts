import { getSheetId } from "../utils/parseUrl";
import { getSheetNames, readSheet } from "@/utils/googleSheets";
import { googleSheetUrl } from "@/utils/storage";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === "FETCH_SHEET") {
      const url = await googleSheetUrl.getValue();
      const sheetId = getSheetId(url);
      const sheetNames = await getSheetNames(sheetId);
      const data = await readSheet(sheetId, sheetNames);
    }
    if (message.type === "AUTHENTICATE") {
      return;
    }
  });
});

async function fetchSheetData(url: string) {
  try {
    const response = await fetch(url);
    console.log("Response status:", response.status);
    const csvText = await response.text();

    const rows = csvText
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.replace(/^"|"$/g, "")));

    console.log("Parsed rows:", rows);
    return rows;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
