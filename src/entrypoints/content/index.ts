import startPicker from "./picker";
import { executeFill, type FillRequest } from "@/utils/automation";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === "START_PICK") {
        startPicker(message.column);
        return false;
      }

      if (message.type === "FILL") {
        const result = executeFill(message.request as FillRequest);
        return Promise.resolve(result);
      }

      if (message.type === "READ_FIELD") {
        const el = document.querySelector(message.selector);
        if (!el) return Promise.resolve({ value: null });

        const value =
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
            ? el.value
            : (el.textContent?.trim() ?? null);

        return Promise.resolve({ value });
      }

      return false;
    });
  },
});
