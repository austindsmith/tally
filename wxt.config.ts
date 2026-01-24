import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  binaries: {
    chrome: "/usr/bin/chromium",
  },
  manifest: {
    name: "Tally",
    description: "Automated data entry from Google Sheets",
    permissions: ["tabs", "activeTab", "scripting", "storage"],
  },
  modules: ["@wxt-dev/module-react"],
});
