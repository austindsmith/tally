import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  manifest: ({ browser }) => ({
    name: "Tally",
    description: "Automated data entry from Google Sheets",
    icons: {
      16: "icons/16.png",
      32: "icons/32.png",
      48: "icons/48.png",
      128: "icons/128.png",
    },

    permissions: ["activeTab", "scripting", "storage", "identity"],
    // Sheets is called directly; the Worker only brokers the token exchange.
    host_permissions: [
      "https://sheets.googleapis.com/*",
      "https://tally-oauth.austin-smith-d0e.workers.dev/*",
    ],
    ...(browser === "chrome" && {
      // Pins the extension ID to hldbbppbkneiemgpjaaplhbbpldgakmc, which is the
      // ID registered against the Google OAuth client.
      key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQ/RmiZI17gla6sSTkyrgiOaqOiY1qrk2Utr3Q5rQbvY9hw/SyzIcFs+VaPneuaVtucPscI3jOGO8YVc9J+Yb8/enjfdE5VCFFu64arv7dI5lQnwmijbdF0UNAmFB8Lao6W/2kfCyShaSgaBYkN0rMiivJplc/Vbdmo+/tkVBi8hHRidyY6b9VNw3PHvE8hSuAcviRh1hEF3dxOaMe8PltjX70oUycKEZXr+tuMg1BdWHQTWXep41MeMxIOqF+T0IbLXzelXNkOmi7JA/9vHt+EUOOkUOYML6IAIVwS5U4O4U7Ch2tXKByvEQhMJurGOyVbl7RmLTgFCM5Ir+IR8xQIDAQAB",
      // No `oauth2` block: that key only feeds chrome.identity.getAuthToken,
      // which this extension no longer uses. See src/utils/auth.ts.
    }),
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "tally@austinsmith.org",
          // browser.storage.session, used to cache access tokens, needs 115.
          strict_min_version: "115.0",
          data_collection_permissions: { required: ["none"], optional: [] },
        },
      },
    }),
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  modules: [
    "@wxt-dev/module-react",
    "@wxt-dev/auto-icons",
    "wxt-module-console-forward",
  ],
  debug: true,
  srcDir: "src",
});
