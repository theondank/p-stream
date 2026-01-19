import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon, Icons } from "@/components/Icon";
import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { VocabItem, useVocabCollectorStore } from "@/stores/vocabCollector";

function VocabItemRow({
  item,
  onRemove,
}: {
  item: VocabItem;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg bg-video-context-light/30 hover:bg-video-context-light/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-video-context-type-main">
            {item.word}
          </span>
          <span className="text-xs text-video-context-type-secondary">
            {item.timestamp}
          </span>
        </div>
        <p className="text-sm text-video-context-type-secondary line-clamp-2">
          {item.context}
        </p>
        <p className="text-xs text-video-context-type-secondary/70 mt-1">
          {item.mediaTitle}
          {item.episode && ` • S${item.season}E${item.episode}`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-md hover:bg-video-context-error/20 text-video-context-type-secondary hover:text-video-context-error transition-all"
        title="Remove"
      >
        <Icon icon={Icons.X} className="text-sm" />
      </button>
    </div>
  );
}

export function VocabCollectorView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);

  const items = useVocabCollectorStore((s) => s.items);
  const isCollecting = useVocabCollectorStore((s) => s.isCollecting);
  const toggleCollecting = useVocabCollectorStore((s) => s.toggleCollecting);
  const removeItem = useVocabCollectorStore((s) => s.removeItem);
  const clearAll = useVocabCollectorStore((s) => s.clearAll);
  const exportAsJson = useVocabCollectorStore((s) => s.exportAsJson);
  const exportAsCsv = useVocabCollectorStore((s) => s.exportAsCsv);

  const [copied, setCopied] = useState<"json" | "csv" | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(exportAsJson());
    setCopied("json");
    setTimeout(() => setCopied(null), 2000);
  }, [exportAsJson]);

  const handleCopyCsv = useCallback(() => {
    navigator.clipboard.writeText(exportAsCsv());
    setCopied("csv");
    setTimeout(() => setCopied(null), 2000);
  }, [exportAsCsv]);

  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      clearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  }, [showClearConfirm, clearAll]);

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        {t("player.menus.vocabCollector.backLink")}
      </Menu.BackLink>
      <Menu.Title>
        {t("player.menus.vocabCollector.title")}
        <span className="ml-2 text-sm font-normal text-video-context-type-secondary">
          ({items.length})
        </span>
      </Menu.Title>

      {/* Toggle collecting mode */}
      <div className="mt-4 mb-4">
        <button
          type="button"
          onClick={toggleCollecting}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            isCollecting
              ? "bg-video-context-type-accent text-white"
              : "bg-video-context-light/50 text-video-context-type-main hover:bg-video-context-light"
          }`}
        >
          <Icon icon={isCollecting ? Icons.EYE : Icons.EDIT} />
          {isCollecting
            ? t("player.menus.vocabCollector.stopCollecting")
            : t("player.menus.vocabCollector.startCollecting")}
        </button>
        {isCollecting && (
          <p className="text-xs text-center text-video-context-type-secondary mt-2">
            {t("player.menus.vocabCollector.collectingHint")}
          </p>
        )}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <Menu.TextDisplay noIcon title={t("player.menus.vocabCollector.empty")}>
          <p className="text-video-context-type-secondary">
            {t("player.menus.vocabCollector.emptyHint")}
          </p>
        </Menu.TextDisplay>
      ) : (
        <>
          <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
            {items.slice(0, 50).map((item) => (
              <VocabItemRow key={item.id} item={item} onRemove={removeItem} />
            ))}
            {items.length > 50 && (
              <p className="text-xs text-center text-video-context-type-secondary py-2">
                {t("player.menus.vocabCollector.moreItems", {
                  count: items.length - 50,
                })}
              </p>
            )}
          </div>

          {/* Export buttons */}
          <Menu.Divider />
          <div className="space-y-2">
            <p className="text-sm font-medium text-video-context-type-main mb-2">
              {t("player.menus.vocabCollector.export")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-video-context-light/50 hover:bg-video-context-light text-video-context-type-main transition-colors text-sm"
              >
                <Icon icon={copied === "json" ? Icons.CHECKMARK : Icons.COPY} />
                {copied === "json"
                  ? t("actions.copied")
                  : t("player.menus.vocabCollector.copyJson")}
              </button>
              <button
                type="button"
                onClick={handleCopyCsv}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-video-context-light/50 hover:bg-video-context-light text-video-context-type-main transition-colors text-sm"
              >
                <Icon icon={copied === "csv" ? Icons.CHECKMARK : Icons.COPY} />
                {copied === "csv"
                  ? t("actions.copied")
                  : t("player.menus.vocabCollector.copyCsv")}
              </button>
            </div>

            {/* Clear button */}
            <button
              type="button"
              onClick={handleClearAll}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors text-sm ${
                showClearConfirm
                  ? "bg-video-context-error text-white"
                  : "bg-video-context-light/30 hover:bg-video-context-error/20 text-video-context-type-secondary hover:text-video-context-error"
              }`}
            >
              <Icon icon={Icons.X} />
              {showClearConfirm
                ? t("player.menus.vocabCollector.confirmClear")
                : t("player.menus.vocabCollector.clearAll")}
            </button>
          </div>
        </>
      )}
    </>
  );
}
