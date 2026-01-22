import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Tally",
    description: "Automated data entry from Google Sheets",
    permissions: ["tabs", "activeTab", "scripting"],
  },
  modules: ["@wxt-dev/module-react"],
  runner: {
    disabled: true,
  },
});
