// @ts-ignore
import ElementPicker from "html-element-picker";
export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
        chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "START_SELECTING") {
      const newPicker = new ElementPicker({
        container: document.body,
        selectors: "button",
        background: "#000000",
        borderWidth: 2,
        trainsition: "all 150ms ease",
      });
      }}

  },
});
