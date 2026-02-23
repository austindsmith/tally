import { findMatch } from "./matching";

export type FillRequest = {
  matchColumn: string;
  matchSelector: string;
  fills: Array<{ column: string; selector: string }>;
  headers: string[];
  rows: string[][];
};

export type FillResult = {
  success: boolean;
  formName?: string;
  matched?: string;
  confidence?: string;
  filled: number;
  errors: string[];
};

function readElement(el: Element): string {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    return el.value;
  }
  return el.textContent?.trim() ?? "";
}

function writeElement(el: HTMLElement, value: string): boolean {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const proto =
      el instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;

    Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  if (el instanceof HTMLSelectElement) {
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  return false;
}

function getColumnIndex(el: Element): number {
  const td = el.closest("td, th");
  const row = el.closest("tr");
  if (!td || !row) return -1;
  return Array.from(row.children).indexOf(td);
}

function findInputInCell(cell: Element): HTMLElement | null {
  return cell.querySelector("input, select, textarea") as HTMLElement | null;
}

function executeSingleFill(request: FillRequest): FillResult {
  const errors: string[] = [];

  const matchEl = document.querySelector(request.matchSelector);
  if (!matchEl) {
    return {
      success: false,
      filled: 0,
      errors: ["Match element not found on page"],
    };
  }

  const formName = readElement(matchEl);
  if (!formName) {
    return { success: false, filled: 0, errors: ["Match field is empty"] };
  }

  const matchColIndex = request.headers.indexOf(request.matchColumn);
  if (matchColIndex === -1) {
    return {
      success: false,
      formName,
      filled: 0,
      errors: [`"${request.matchColumn}" not in sheet`],
    };
  }

  const sheetNames = request.rows.map((row) => row[matchColIndex] ?? "");
  const match = findMatch(formName, sheetNames);

  if (match.confidence === "none") {
    return {
      success: false,
      formName,
      filled: 0,
      errors: [`No match for "${formName}"`],
    };
  }

  const matchedRow = request.rows[match.rowIndex];
  let filled = 0;

  for (const fill of request.fills) {
    const el = document.querySelector(fill.selector) as HTMLElement | null;
    if (!el) {
      errors.push(`Element not found: ${fill.selector}`);
      continue;
    }

    const colIndex = request.headers.indexOf(fill.column);
    if (colIndex === -1) continue;

    if (writeElement(el, String(matchedRow[colIndex] ?? ""))) {
      filled++;
    } else {
      errors.push(`Couldn't write to "${fill.column}"`);
    }
  }

  return {
    success: true,
    formName,
    matched: match.sheetName,
    confidence: match.confidence,
    filled,
    errors,
  };
}

function executeBatchFill(request: FillRequest): FillResult {
  const errors: string[] = [];

  const matchEl = document.querySelector(request.matchSelector);
  if (!matchEl) {
    return {
      success: false,
      filled: 0,
      errors: ["Match element not found on page"],
    };
  }

  const table = matchEl.closest("table");
  if (!table) {
    return executeSingleFill(request);
  }

  const matchColIdx = getColumnIndex(matchEl);
  if (matchColIdx === -1) {
    return executeSingleFill(request);
  }

  const fillColPositions = request.fills
    .map((fill) => {
      const el = document.querySelector(fill.selector);
      if (!el) return null;
      return { column: fill.column, colIdx: getColumnIndex(el) };
    })
    .filter(Boolean) as Array<{ column: string; colIdx: number }>;

  if (fillColPositions.length === 0) {
    return {
      success: false,
      filled: 0,
      errors: ["No fill elements found on page"],
    };
  }

  const sheetMatchCol = request.headers.indexOf(request.matchColumn);
  if (sheetMatchCol === -1) {
    return {
      success: false,
      filled: 0,
      errors: [`"${request.matchColumn}" not in sheet`],
    };
  }

  const sheetNames = request.rows.map((row) => row[sheetMatchCol] ?? "");

  const dataRows = Array.from(table.querySelectorAll("tr")).filter(
    (row) => !row.querySelector("th"),
  );

  let filled = 0;
  let matched = 0;

  for (const row of dataRows) {
    const cells = Array.from(row.children);
    const nameCell = cells[matchColIdx];
    if (!nameCell) continue;

    const formName = readElement(nameCell);
    if (!formName) continue;

    const match = findMatch(formName, sheetNames);
    if (match.confidence === "none") {
      errors.push(`No match for "${formName}"`);
      continue;
    }

    matched++;
    const sheetRow = request.rows[match.rowIndex];

    for (const fp of fillColPositions) {
      const cell = cells[fp.colIdx];
      if (!cell) continue;

      const input = findInputInCell(cell);
      if (!input) continue;

      const sheetColIdx = request.headers.indexOf(fp.column);
      if (sheetColIdx === -1) continue;

      const value = String(sheetRow[sheetColIdx] ?? "");
      if (writeElement(input, value)) {
        filled++;
      }
    }
  }

  return {
    success: filled > 0,
    filled,
    matched: `${matched} students`,
    confidence: "batch",
    errors,
  };
}

export function executeFill(request: FillRequest): FillResult {
  const matchEl = document.querySelector(request.matchSelector);
  if (!matchEl) {
    return {
      success: false,
      filled: 0,
      errors: ["Match element not found on page"],
    };
  }

  const table = matchEl.closest("table");
  if (!table) {
    return executeSingleFill(request);
  }

  const dataRows = Array.from(table.querySelectorAll("tr")).filter(
    (row) => !row.querySelector("th"),
  );

  if (dataRows.length > 1) {
    return executeBatchFill(request);
  }

  return executeSingleFill(request);
}
