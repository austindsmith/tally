export async function getSheetNames(sheetId: string) {
  // Add dropdown field to let user select which sheet to use
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const options = {
    method: "GET",
    headers: { "x-goog-api-key": import.meta.env.WXT_GOOGLE_API_KEY },
  };

  const sheetNames = [];

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const sheets = data.sheets;

    for (let sheet in sheets) {
      sheetNames.push(sheets[sheet].properties.title);
    }
  } catch (error) {
    console.error(error);
  }
  return sheetNames[0];
}
export async function readSheet(sheetId: string, sheetName: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}`;
  const options = {
    method: "GET",
    headers: { "x-goog-api-key": import.meta.env.WXT_GOOGLE_API_KEY },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.values;
  } catch (error) {
    console.error(error);
    return;
  }
}
