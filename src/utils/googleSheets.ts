import { getAuthToken, removeAuthToken } from "./auth";

export function getSheetId(url: string) {
  const match = url.match(/\/d\/(.+?)\//)?.[1];
  return match || "";
}

async function fetchWithAuth(url: string): Promise<Response> {
  const token = await getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    await removeAuthToken(token);
    const freshToken = await getAuthToken();
    return fetch(url, {
      headers: { Authorization: `Bearer ${freshToken}` },
    });
  }

  return response;
}

export async function getSheetNames(sheetId: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;

  try {
    const response = await fetchWithAuth(url);
    const data = await response.json();
    return data.sheets.map((sheet: any) => sheet.properties.title as string);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function readSheet(sheetId: string, sheetName: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}`;

  try {
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[TALLY] Sheet read error:", errorData);
      return [];
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
