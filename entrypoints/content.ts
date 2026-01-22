// entrypoints/content.ts
import { clickButton } from "@/utils/automation/clickButton";

export default defineContentScript({
  matches: ["*://*.tcgplayer.com/*"],
  main() {
    browser.runtime.onMessage.addListener(async (message) => {
      if (message.type === "CLICK_BUTTON") {
        return await clickButton();
      }
    });
  },
});
