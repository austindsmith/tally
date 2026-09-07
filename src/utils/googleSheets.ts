import { getAuthToken, signOut } from "@/utils/auth"
import {
  SheetsError,
  type SheetRecord,
  type SheetTab,
  type SheetValues,
} from "@/types/sheets"

/**
 * Every request here is authorised with the signed-in user's OAuth token.
 *
 * The previous implementation sent an `x-goog-api-key` instead. An API key
 * identifies the project rather than a person, so it could only ever read
 * link-shared spreadsheets and could never write at all -- which is why
 * connecting a private sheet silently returned nothing.
 */

const API_ROOT = "https://sheets.googleapis.com/v4/spreadsheets"

/** Extracts the spreadsheet ID from a Google Sheets URL. */
export function getSheetId(url: string): string {
  return url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? ""
}

function describe(status: number, body: string): SheetsError {
  switch (status) {
    case 401:
      return new SheetsError("unauthorized", status, "Sign-in expired.")
    case 403:
      return new SheetsError(
        "forbidden",
        status,
        "This account cannot open that spreadsheet.",
      )
    case 404:
      return new SheetsError(
        "not_found",
        status,
        "Spreadsheet not found. Check the link.",
      )
    case 429:
      return new SheetsError(
        "rate_limited",
        status,
        "Google is rate limiting requests. Try again shortly.",
      )
    default:
      return new SheetsError("unknown", status, body || "Google Sheets request failed.")
  }
}

/**
 * Issues an authorised Sheets request, retrying once after a 401 so a token
 * that Google invalidated early does not surface as a user-facing failure.
 */
async function request<T>(
  path: string,
  init: RequestInit = {},
  retryOnAuthFailure = true,
): Promise<T> {
  const token = await getAuthToken()

  let response: Response
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  } catch (cause) {
    throw new SheetsError("network", 0, "Could not reach Google Sheets.")
  }

  if (response.status === 401 && retryOnAuthFailure) {
    await signOut()
    return request<T>(path, init, false)
  }

  if (!response.ok) {
    throw describe(response.status, await response.text())
  }

  return (await response.json()) as T
}

/** Lists the tabs in a spreadsheet. */
export async function getSheetNames(sheetId: string): Promise<string[]> {
  if (!sheetId) return []
  const tabs = await getSheetTabs(sheetId)
  return tabs.map((tab) => tab.title)
}

/** Lists the tabs in a spreadsheet with their IDs and positions. */
export async function getSheetTabs(sheetId: string): Promise<SheetTab[]> {
  if (!sheetId) return []

  const data = await request<{
    sheets?: { properties: { title: string; sheetId: number; index: number } }[]
  }>(`/${sheetId}?fields=sheets.properties`)

  return (data.sheets ?? []).map(({ properties }) => ({
    title: properties.title,
    sheetId: properties.sheetId,
    index: properties.index,
  }))
}

/** Reads a whole tab as rows, header row included. */
export async function readSheet(
  sheetId: string,
  sheetName: string,
): Promise<SheetValues> {
  if (!sheetId || !sheetName) return []

  const data = await request<{ values?: SheetValues }>(
    `/${sheetId}/values/${encodeURIComponent(sheetName)}`,
  )

  return data.values ?? []
}

/**
 * Converts raw rows into header-keyed records.
 *
 * Sheets truncates trailing empty cells, so short rows are padded to keep every
 * record the same shape as the header.
 */
export function toRecords(values: SheetValues): SheetRecord[] {
  const [headers, ...rows] = values
  if (!headers) return []

  return rows.map((row) =>
    Object.fromEntries(headers.map((header, i) => [header, row[i] ?? ""])),
  )
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * USER_ENTERED makes Google parse values the way typing them would -- dates
 * become dates and numbers become numbers, rather than text.
 */
type ValueInputOption = "USER_ENTERED" | "RAW"

/** Overwrites a range. `range` is A1 notation, e.g. "Sheet1!B2:D2". */
export async function writeRange(
  sheetId: string,
  range: string,
  values: SheetValues,
  valueInputOption: ValueInputOption = "USER_ENTERED",
): Promise<void> {
  await request(
    `/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`,
    { method: "PUT", body: JSON.stringify({ range, values }) },
  )
}

/** Appends rows after the last populated row of a tab. */
export async function appendRows(
  sheetId: string,
  sheetName: string,
  values: SheetValues,
  valueInputOption: ValueInputOption = "USER_ENTERED",
): Promise<void> {
  await request(
    `/${sheetId}/values/${encodeURIComponent(sheetName)}:append` +
      `?valueInputOption=${valueInputOption}&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values }) },
  )
}

/** Writes several disjoint ranges in one request. */
export async function writeRanges(
  sheetId: string,
  updates: { range: string; values: SheetValues }[],
  valueInputOption: ValueInputOption = "USER_ENTERED",
): Promise<void> {
  if (!updates.length) return

  await request(`/${sheetId}/values:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ valueInputOption, data: updates }),
  })
}

/** Converts a zero-based column index to its A1 letter ("A", "Z", "AA"). */
export function columnLetter(index: number): string {
  let letter = ""
  let n = index
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter
    n = Math.floor(n / 26) - 1
  }
  return letter
}

/**
 * Updates one cell addressed by header name and row index.
 *
 * `rowIndex` is zero-based over data rows, so 0 is the first row beneath the
 * header; the +2 converts that to a one-based A1 row that skips the header.
 */
export async function updateCell(
  sheetId: string,
  sheetName: string,
  headers: string[],
  rowIndex: number,
  column: string,
  value: string,
): Promise<void> {
  const columnIndex = headers.indexOf(column)
  if (columnIndex === -1) {
    throw new SheetsError("not_found", 0, `No column named "${column}".`)
  }

  const cell = `${columnLetter(columnIndex)}${rowIndex + 2}`
  await writeRange(sheetId, `${sheetName}!${cell}`, [[value]])
}
