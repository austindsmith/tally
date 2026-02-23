import type { FillResult } from "./automation";

type FieldMapping = {
  selector: string;
  role: "match" | "fill";
  preview: string;
};

export async function triggerFill(
  fields: Record<string, FieldMapping>,
  sheetData: string[][],
): Promise<FillResult> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) throw new Error("No active tab");

  const headers = sheetData[0];
  const rows = sheetData.slice(1);

  const matchEntry = Object.entries(fields).find(
    ([_, f]) => f.role === "match" && f.selector,
  );
  if (!matchEntry) throw new Error("No match field configured");

  const [matchColumn, matchField] = matchEntry;

  const fills = Object.entries(fields)
    .filter(([_, f]) => f.role === "fill" && f.selector)
    .map(([column, field]) => ({ column, selector: field.selector }));

  if (fills.length === 0) throw new Error("No fill fields configured");

  return browser.tabs.sendMessage(tabId, {
    type: "FILL",
    request: {
      matchColumn,
      matchSelector: matchField.selector,
      fills,
      headers,
      rows,
    },
  });
}
