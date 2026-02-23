import ElementPicker from "html-element-picker";
import { finder } from "@medv/finder";

let picker: ElementPicker | null = null;
let pickingFor: string | null = null;

function cleanup() {
  if (picker) {
    picker.actions = {};
    picker?.hoverBox?.remove();
    picker = null;
  }
}

export default function startPicker(column: string) {
  cleanup();
  pickingFor = column;

  picker = new ElementPicker({
    container: document.body,
    selectors: "*",
    background: "rgba(153, 235, 255, 0.5)",
    borderWidth: 5,
    transition: "all 150ms ease",
    ignoreElements: [document.body],
    action: {
      trigger: "click",
      callback: (target: HTMLElement) => {
        if (!pickingFor) return;

        const column = pickingFor;
        pickingFor = null;

        const selector = finder(target);
        const preview =
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement
            ? target.value
            : (target.textContent?.trim() ?? "");

        browser.storage.local.set({
          pickResult: { column, selector, preview },
        });

        cleanup();
      },
    },
  });
}
