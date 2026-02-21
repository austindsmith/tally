import startPicker from "./picker";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "start-picker") {
        startPicker();
      }
    });
  },
});
