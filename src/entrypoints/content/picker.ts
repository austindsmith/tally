import ElementPicker from "html-element-picker";
import { finder } from "@medv/finder";

let picker: ElementPicker | null = null;

export default function startPicker(): Promise<string> {
  return new Promise<string>((resolve) => {
    if (picker) {
      resolve("");
      return;
    }

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
          const selector = finder(target);
          resolve(selector);

          if (picker) {
            picker.actions = {};
            picker?.hoverBox?.remove();
          }

          picker = null;
        },
      },
    });
  });
}
