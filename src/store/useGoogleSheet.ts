import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getSheetId,
  getSheetNames,
  readSheet,
  toRecords,
  updateCell,
} from "@/utils/googleSheets";
import type { SheetRecord, SheetValues } from "@/types/sheets";

type GoogleSheetStore = {
  url: string;
  id: string;
  sheets: string[];
  selectedSheet: string;
  /** Raw rows including the header row. */
  data: SheetValues;
  /** Data rows keyed by column header, aligned with `data` minus its header. */
  records: SheetRecord[];
  loading: boolean;
  error: string | null;
  setSheetUrl: (url: string) => Promise<void>;
  setSelectedSheet: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
  writeCell: (rowIndex: number, column: string, value: string) => Promise<void>;
  initFromDefault: () => Promise<void>;
};

/** Column headers of the loaded sheet, or an empty list before one loads. */
export function selectHeaders(state: GoogleSheetStore): string[] {
  return state.data[0] ?? [];
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export const useGoogleSheet = create<GoogleSheetStore>()(
  persist(
    (set, get) => ({
      url: "",
      id: "",
      sheets: [],
      selectedSheet: "",
      data: [],
      records: [],
      loading: false,
      error: null,

      setSheetUrl: async (url) => {
        const id = getSheetId(url);
        set({ url, id, selectedSheet: "", data: [], records: [], error: null });

        if (!id) {
          set({ sheets: [], error: url ? "That is not a Google Sheets link." : null });
          return;
        }

        set({ loading: true });
        try {
          set({ sheets: await getSheetNames(id), loading: false });
        } catch (error) {
          set({ sheets: [], loading: false, error: message(error) });
        }
      },

      setSelectedSheet: async (name) => {
        set({ selectedSheet: name, loading: true, error: null });

        try {
          const data = await readSheet(get().id, name);
          set({ data, records: toRecords(data), loading: false });
        } catch (error) {
          set({ data: [], records: [], loading: false, error: message(error) });
        }
      },

      refresh: async () => {
        const { id, selectedSheet } = get();
        if (!id || !selectedSheet) return;
        await get().setSelectedSheet(selectedSheet);
      },

      writeCell: async (rowIndex, column, value) => {
        const { id, selectedSheet, data } = get();
        const headers = data[0];
        if (!id || !selectedSheet || !headers) return;

        set({ error: null });
        try {
          await updateCell(id, selectedSheet, headers, rowIndex, column, value);

          // Mirror the write locally so the table updates without a full reload.
          const columnIndex = headers.indexOf(column);
          const next = data.map((row) => [...row]);
          next[rowIndex + 1][columnIndex] = value;
          set({ data: next, records: toRecords(next) });
        } catch (error) {
          set({ error: message(error) });
          throw error;
        }
      },

      initFromDefault: async () => {
        const { url, selectedSheet } = get();
        if (!url) return;

        const id = getSheetId(url);
        set({ id, loading: true, error: null });

        try {
          const sheets = await getSheetNames(id);
          set({ sheets });

          if (selectedSheet && sheets.includes(selectedSheet)) {
            const data = await readSheet(id, selectedSheet);
            set({ data, records: toRecords(data) });
          }
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: message(error) });
        }
      },
    }),
    {
      name: "google-storage",
      storage: createJSONStorage(() => localStorage),
      // Sheet contents are re-fetched on open, so only the user's selections
      // are worth persisting.
      partialize: (state) => ({
        url: state.url,
        id: state.id,
        selectedSheet: state.selectedSheet,
      }),
    },
  ),
);
