import { useCallback, useEffect, useRef } from "react";

import { usePlayerStore } from "@/stores/player/store";
import { useVocabCollectorStore } from "@/stores/vocabCollector";

interface VocabTooltipProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function VocabTooltip({ onConfirm, onCancel }: VocabTooltipProps) {
  const tooltipPosition = useVocabCollectorStore((s) => s.tooltipPosition);
  const pendingSelection = useVocabCollectorStore((s) => s.pendingSelection);

  if (!pendingSelection) return null;

  return (
    <div
      className="fixed z-[9999] flex items-center gap-2 bg-video-context-background/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-video-context-border animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: "translate(-50%, -120%)",
      }}
    >
      <span className="text-sm text-video-context-type-main max-w-[200px] truncate font-medium">
        &ldquo;{pendingSelection.word}&rdquo;
      </span>
      <button
        type="button"
        onClick={onConfirm}
        className="flex items-center justify-center w-7 h-7 rounded-md bg-video-context-type-accent hover:bg-video-context-type-accent/80 text-white transition-colors"
        title="Add to vocab list"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center w-7 h-7 rounded-md bg-video-context-light/50 hover:bg-video-context-light text-video-context-type-main transition-colors"
        title="Cancel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function VocabSelectionHandler() {
  const isCollecting = useVocabCollectorStore((s) => s.isCollecting);
  const showTooltip = useVocabCollectorStore((s) => s.showTooltip);
  const setPendingSelection = useVocabCollectorStore(
    (s) => s.setPendingSelection,
  );
  const confirmPendingSelection = useVocabCollectorStore(
    (s) => s.confirmPendingSelection,
  );
  const cancelPendingSelection = useVocabCollectorStore(
    (s) => s.cancelPendingSelection,
  );

  const meta = usePlayerStore((s) => s.meta);
  const videoTime = usePlayerStore((s) => s.progress.time);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isCollecting) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.length === 0) {
        return;
      }

      // Get the parent element to extract context
      const anchorNode = selection.anchorNode;
      if (!anchorNode) return;

      const parentElement =
        anchorNode.nodeType === 3
          ? anchorNode.parentElement
          : (anchorNode as HTMLElement);

      if (!parentElement) return;

      // Find the subtitle container to get the full context
      const subtitleContainer = parentElement.closest(
        '[data-vocab-subtitle="true"]',
      );
      const fullContext = subtitleContainer
        ? subtitleContainer.textContent?.replace(/\s+/g, " ").trim() || ""
        : parentElement.textContent?.replace(/\s+/g, " ").trim() || "";

      // Position tooltip near the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top,
      };

      setPendingSelection(
        { word: selectedText, context: fullContext },
        position,
      );

      // Clear the selection after capturing
      selection.removeAllRanges();
    },
    [isCollecting, setPendingSelection],
  );

  const handleConfirm = useCallback(() => {
    if (!meta) return;

    confirmPendingSelection({
      mediaTitle: meta.title,
      mediaType: meta.type,
      episode: meta.episode?.number?.toString(),
      season: meta.season?.number?.toString(),
      timestamp: formatTimestamp(videoTime),
    });
  }, [meta, videoTime, confirmPendingSelection]);

  const handleCancel = useCallback(() => {
    cancelPendingSelection();
  }, [cancelPendingSelection]);

  // Listen for mouseup events on the document
  useEffect(() => {
    if (!isCollecting) return;

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isCollecting, handleMouseUp]);

  // Close tooltip on click outside
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-vocab-tooltip="true"]')) {
        // Small delay to allow confirm button to work
        setTimeout(() => {
          cancelPendingSelection();
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip, cancelPendingSelection]);

  // Inject CSS to make subtitles selectable when collecting
  useEffect(() => {
    if (!isCollecting) return;

    const style = document.createElement("style");
    style.id = "vocab-collector-styles";
    style.textContent = `
      [data-vocab-subtitle="true"],
      [data-vocab-subtitle="true"] * {
        user-select: text !important;
        -webkit-user-select: text !important;
        cursor: text !important;
      }
      [data-vocab-subtitle="true"]::selection,
      [data-vocab-subtitle="true"] *::selection {
        background-color: rgba(var(--colors-video-context-type-accent), 0.4) !important;
        color: inherit !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById("vocab-collector-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isCollecting]);

  if (!isCollecting) return null;

  return (
    <div ref={containerRef} data-vocab-tooltip="true">
      {showTooltip && (
        <VocabTooltip onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
}
