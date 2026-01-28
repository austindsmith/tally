import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Tally",
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqQ/RmiZI17gla6sSTkyrgiOaqOiY1qrk2Utr3Q5rQbvY9hw/SyzIcFs+VaPneuaVtucPscI3jOGO8YVc9J+Yb8/enjfdE5VCFFu64arv7dI5lQnwmijbdF0UNAmFB8Lao6W/2kfCyShaSgaBYkN0rMiivJplc/Vbdmo+/tkVBi8hHRidyY6b9VNw3PHvE8hSuAcviRh1hEF3dxOaMe8PltjX70oUycKEZXr+tuMg1BdWHQTWXep41MeMxIOqF+T0IbLXzelXNkOmi7JA/9vHt+EUOOkUOYML6IAIVwS5U4O4U7Ch2tXKByvEQhMJurGOyVbl7RmLTgFCM5Ir+IR8xQIDAQAB",
    description: "Automated data entry from Google Sheets",
    permissions: ["tabs", "activeTab", "scripting", "storage", "identity"],
    oauth2: {
      client_id:
        "94483234549-d804rllboarcjetek54ttfm3tolhoniq.apps.googleusercontent.com",
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  modules: ["@wxt-dev/module-react"],
});
