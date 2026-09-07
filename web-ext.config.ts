import { resolve } from "path";
import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  // Google refuses OAuth in browsers launched under automation flags
  // ("Couldn't sign you in / This browser or app may not be secure"), and
  // web-ext starts Firefox under Marionette. Set NO_BROWSER=1 to skip the
  // auto-launch and load the extension into a normal browser by hand.
  disabled: process.env.NO_BROWSER === "1",
  // Only Chromium is installed on this machine; WXT looks for `chrome` by default.
  binaries: {
    chrome: "/usr/bin/chromium",
  },
  chromiumArgs: ["--user-data-dir=./.chrome-profile"],
  startUrls: [
    `file://${resolve("test-form.html")}`,
    `file://${resolve("test-form-batch.html")}`,
  ],
});
