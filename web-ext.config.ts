import { resolve } from "path";
import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  disabled: false,
  chromiumArgs: ["--user-data-dir=./.chrome-profile"],
  startUrls: [
    `file://${resolve("test-form.html")}`,
    `file://${resolve("test-form-batch.html")}`,
  ],
});
