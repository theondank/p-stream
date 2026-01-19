import { useTranslation } from "react-i18next";

import { Icons } from "@/components/Icon";
import { OverlayAnchor } from "@/components/overlays/OverlayAnchor";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { useVocabCollectorStore } from "@/stores/vocabCollector";

export function VocabCollector() {
  const { t } = useTranslation();
  const router = useOverlayRouter("settings");
  const isCollecting = useVocabCollectorStore((s) => s.isCollecting);
  const itemCount = useVocabCollectorStore((s) => s.items.length);

  return (
    <OverlayAnchor id={router.id}>
      <div className="relative">
        <VideoPlayerButton
          onClick={() => {
            router.open();
            router.navigate("/vocabCollector");
          }}
          icon={Icons.EDIT}
          className={isCollecting ? "text-video-context-type-accent" : ""}
        />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-video-context-type-accent text-white rounded-full">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </div>
    </OverlayAnchor>
  );
}
