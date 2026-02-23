import { create } from "zustand";
import { persist } from "zustand/middleware";

type FieldRole = "match" | "fill";

type FieldMapping = {
  selector: string;
  role: FieldRole;
  preview: string;
};

type SelectorStore = {
  fields: Record<string, FieldMapping>;
  hidden: string[];
  _pickingFor: string | null;
  setSelector: (column: string, selector: string, preview: string) => void;
  setRole: (column: string, role: FieldRole) => void;
  hideColumn: (column: string) => void;
  showColumn: (column: string) => void;
  startPick: (column?: string) => void;
  checkForPick: () => void;
};

export const useSelectors = create<SelectorStore>()(
  persist(
    (set, get) => ({
      fields: {},
      hidden: [],
      _pickingFor: null,

      setSelector: (column, selector, preview) =>
        set((state) => ({
          fields: {
            ...state.fields,
            [column]: {
              selector,
              preview,
              role: state.fields[column]?.role ?? "fill",
            },
          },
          _pickingFor: null,
        })),

      setRole: (column, role) =>
        set((state) => ({
          fields: {
            ...state.fields,
            [column]: {
              ...state.fields[column],
              selector: state.fields[column]?.selector ?? "",
              preview: state.fields[column]?.preview ?? "",
              role,
            },
          },
        })),

      hideColumn: (column) =>
        set((state) => {
          const { [column]: _, ...rest } = state.fields;
          return {
            fields: rest,
            hidden: [...state.hidden, column],
          };
        }),

      showColumn: (column) =>
        set((state) => ({
          hidden: state.hidden.filter((c) => c !== column),
        })),

      startPick: (column?: string) => {
        if (!column) return;
        set({ _pickingFor: column });
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            if (tabs[0]?.id) {
              browser.tabs.sendMessage(tabs[0].id, {
                type: "START_PICK",
                column,
              });
            }
          });
      },

      checkForPick: () => {
        const check = async () => {
          const result = await browser.storage.local.get("pickResult");
          if (result.pickResult) {
            const { column, selector, preview } = result.pickResult as {
              column: string;
              selector: string;
              preview: string;
            };
            get().setSelector(column, selector, preview);
            await browser.storage.local.remove("pickResult");
          }
        };

        check();

        browser.storage.onChanged.addListener((changes, area) => {
          if (area === "local" && changes.pickResult?.newValue) {
            check();
          }
        });
      },
    }),
    {
      name: "selectors-storage",
      partialize: (state) => ({
        fields: state.fields,
        hidden: state.hidden,
      }),
    },
  ),
);
