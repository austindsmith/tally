import startPicker from "./picker";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "startPicker") {
        console.log("Starting picker from message");

        startPicker().then((selector) => {
          console.log("Picker resolved with:", selector);
          sendResponse({ selector });
        });

        return true;
      }
    });
  },
});
