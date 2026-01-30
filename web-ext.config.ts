import { defineWebExtConfig } from "wxt";
export default defineWebExtConfig({
  disabled: false,
  chromiumArgs: ["--user-data-dir=./.chrome-profile"],
});
