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

function readField(selector: string): string | null {
  const el = document.querySelector(selector);
  if (!el) return null;

  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    return el.value;
  }

  return el.textContent?.trim() ?? null;
}

function writeField(selector: string, value: string): boolean {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return false;

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const proto =
      el instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;

    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(el, value);

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

export function executeFill(request: FillRequest): FillResult {
  const errors: string[] = [];

  const formName = readField(request.matchSelector);
  if (!formName) {
    return {
      success: false,
      filled: 0,
      errors: ["Could not read match field"],
    };
  }

  const matchColIndex = request.headers.indexOf(request.matchColumn);
  if (matchColIndex === -1) {
    return {
      success: false,
      formName,
      filled: 0,
      errors: [`Column "${request.matchColumn}" not found in sheet`],
    };
  }

  const sheetNames = request.rows.map((row) => row[matchColIndex] ?? "");
  const match = findMatch(formName, sheetNames);

  if (match.confidence === "none") {
    return {
      success: false,
      formName,
      filled: 0,
      errors: [`No match found for "${formName}"`],
    };
  }

  const matchedRow = request.rows[match.rowIndex];
  let filled = 0;

  for (const fill of request.fills) {
    const colIndex = request.headers.indexOf(fill.column);
    if (colIndex === -1) {
      errors.push(`Column "${fill.column}" not found`);
      continue;
    }

    const value = String(matchedRow[colIndex] ?? "");
    if (writeField(fill.selector, value)) {
      filled++;
    } else {
      errors.push(`Failed to fill "${fill.column}" at ${fill.selector}`);
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
