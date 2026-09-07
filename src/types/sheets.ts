/** A single cell as returned by the Sheets API (values arrive as strings). */
export type CellValue = string

/** One row of a sheet, positionally aligned with the header row. */
export type SheetRow = CellValue[]

/** Raw sheet contents: the header row followed by data rows. */
export type SheetValues = SheetRow[]

/** A data row keyed by its column header. */
export type SheetRecord = Record<string, CellValue>

/** Metadata for one tab within a spreadsheet. */
export type SheetTab = {
  title: string
  sheetId: number
  index: number
}

export type SheetsErrorReason =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "network"
  | "unknown"

export class SheetsError extends Error {
  readonly reason: SheetsErrorReason
  readonly status: number

  constructor(reason: SheetsErrorReason, status: number, message: string) {
    super(message)
    this.name = "SheetsError"
    this.reason = reason
    this.status = status
  }
}
