/**
 * Content scripts are not always present in a tab when the popup wants to talk
 * to one: WXT registers them dynamically in development, so tabs that were
 * already open when the extension loaded never received one, and Chrome does
 * not inject into file:// pages unless "Allow access to file URLs" is on.
 *
 * Injecting on demand keeps `tabs.sendMessage` from failing with "Receiving end
 * does not exist" in those cases, without stacking a duplicate listener in the
 * common case where the script is already running.
 */
const CONTENT_SCRIPT = "content-scripts/content.js";

function isMissingReceiver(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error);
  return (
    text.includes("Receiving end does not exist") ||
    text.includes("Could not establish connection")
  );
}

export async function sendToTab<T>(tabId: number, message: unknown): Promise<T> {
  try {
    return (await browser.tabs.sendMessage(tabId, message)) as T;
  } catch (error) {
    if (!isMissingReceiver(error)) throw error;

    await browser.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT],
    });

    return (await browser.tabs.sendMessage(tabId, message)) as T;
  }
}

/** Resolves the tab the popup is acting on. */
export async function activeTabId(): Promise<number> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab.");
  return tab.id;
}
