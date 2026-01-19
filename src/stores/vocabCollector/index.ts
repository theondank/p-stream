import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface VocabItem {
  id: string;
  word: string;
  context: string;
  timestamp: string;
  mediaTitle: string;
  mediaType: "movie" | "show";
  episode?: string;
  season?: string;
  createdAt: number;
}

export interface VocabCollectorStore {
  items: VocabItem[];
  isCollecting: boolean;
  showTooltip: boolean;
  tooltipPosition: { x: number; y: number };
  pendingSelection: { word: string; context: string } | null;

  // Actions
  addItem(item: Omit<VocabItem, "id" | "createdAt">): void;
  removeItem(id: string): void;
  clearAll(): void;
  toggleCollecting(): void;
  setCollecting(collecting: boolean): void;

  // Tooltip management
  setPendingSelection(
    selection: { word: string; context: string } | null,
    position?: { x: number; y: number },
  ): void;
  confirmPendingSelection(mediaInfo: {
    mediaTitle: string;
    mediaType: "movie" | "show";
    episode?: string;
    season?: string;
    timestamp: string;
  }): void;
  cancelPendingSelection(): void;

  // Export
  exportAsJson(): string;
  exportAsCsv(): string;
}

export const useVocabCollectorStore = create(
  persist(
    immer<VocabCollectorStore>((set, get) => ({
      items: [],
      isCollecting: false,
      showTooltip: false,
      tooltipPosition: { x: 0, y: 0 },
      pendingSelection: null,

      addItem(item) {
        set((s) => {
          // Avoid duplicates (same word + same context)
          const exists = s.items.some(
            (i) => i.word === item.word && i.context === item.context,
          );
          if (!exists) {
            s.items.unshift({
              ...item,
              id: nanoid(),
              createdAt: Date.now(),
            });
          }
        });
      },

      removeItem(id) {
        set((s) => {
          s.items = s.items.filter((i) => i.id !== id);
        });
      },

      clearAll() {
        set((s) => {
          s.items = [];
        });
      },

      toggleCollecting() {
        set((s) => {
          s.isCollecting = !s.isCollecting;
        });
      },

      setCollecting(collecting) {
        set((s) => {
          s.isCollecting = collecting;
        });
      },

      setPendingSelection(selection, position) {
        set((s) => {
          s.pendingSelection = selection;
          s.showTooltip = selection !== null;
          if (position) {
            s.tooltipPosition = position;
          }
        });
      },

      confirmPendingSelection(mediaInfo) {
        const state = get();
        if (state.pendingSelection) {
          set((s) => {
            const exists = s.items.some(
              (i) =>
                i.word === state.pendingSelection!.word &&
                i.context === state.pendingSelection!.context,
            );
            if (!exists) {
              s.items.unshift({
                id: nanoid(),
                word: state.pendingSelection!.word,
                context: state.pendingSelection!.context,
                ...mediaInfo,
                createdAt: Date.now(),
              });
            }
            s.pendingSelection = null;
            s.showTooltip = false;
          });
        }
      },

      cancelPendingSelection() {
        set((s) => {
          s.pendingSelection = null;
          s.showTooltip = false;
        });
      },

      exportAsJson() {
        const state = get();
        const exportData = state.items.map((item) => ({
          target_word: item.word,
          full_sentence: item.context,
          source: item.mediaTitle,
          episode: item.episode ? `S${item.season}E${item.episode}` : undefined,
          timestamp: item.timestamp,
        }));
        return JSON.stringify(exportData, null, 2);
      },

      exportAsCsv() {
        const state = get();
        const headers = [
          "Word",
          "Context",
          "Source",
          "Episode",
          "Timestamp",
          "Date Added",
        ];
        const rows = state.items.map((item) => [
          `"${item.word.replace(/"/g, '""')}"`,
          `"${item.context.replace(/"/g, '""')}"`,
          `"${item.mediaTitle.replace(/"/g, '""')}"`,
          item.episode ? `"S${item.season}E${item.episode}"` : '""',
          `"${item.timestamp}"`,
          `"${new Date(item.createdAt).toISOString()}"`,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      },
    })),
    {
      name: "__MW::vocabCollector",
    },
  ),
);
