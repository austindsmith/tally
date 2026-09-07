import { create } from "zustand";
import { persist } from "zustand/middleware";
import { activeTabId, sendToTab } from "@/utils/messaging";

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
  /** Why the last pick attempt failed, so the UI can say so. */
  pickError: string | null;
  setSelector: (column: string, selector: string, preview: string) => void;
  setRole: (column: string, role: FieldRole) => void;
  hideColumn: (column: string) => void;
  showColumn: (column: string) => void;
  startPick: (column?: string) => Promise<void>;
  checkForPick: () => void;
};

export const useSelectors = create<SelectorStore>()(
  persist(
    (set, get) => ({
      fields: {},
      hidden: [],
      _pickingFor: null,
      pickError: null,

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

      startPick: async (column?: string) => {
        if (!column) return;
        set({ _pickingFor: column, pickError: null });

        try {
          await sendToTab(await activeTabId(), { type: "START_PICK", column });
        } catch (error) {
          // Without this the rejection is swallowed and the picker simply never
          // appears, which is indistinguishable from the extension hanging.
          set({
            _pickingFor: null,
            pickError:
              error instanceof Error
                ? error.message
                : "Could not start the picker on this page.",
          });
        }
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
