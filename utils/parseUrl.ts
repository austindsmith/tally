export function getSheetId(url: string) {
  const match = url.match(/\/d\/(.+?)\//)?.[1];

  return match || "";
}
