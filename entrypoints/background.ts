export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  fetchSheetData();
});

async function fetchSheetData() {
  const sheetId = "1aSm4nwINqe_GxEDEjNlBy21mJzHi9Ort5iZJtpGBCyQ";
  const sheetName = "Sheet1";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

  try {
    const response = await fetch(url);
    console.log("Response status:", response.status);

    const csvText = await response.text();
    console.log("Raw CSV:", csvText);

    const rows = csvText
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.replace(/^"|"$/g, "")));

    console.log("Parsed rows:", rows);
    return rows;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
