import { SystemNotice, systemCardClassName } from "@/components/system/system-ui";

type MediaSourceTypeValue =
  | "RUTUBE_EMBED"
  | "EXTERNAL_EMBED"
  | "MANAGED_UPLOAD"
  | "CLOUD_IMPORT"
  | null;

type VideoAssetStatusValue =
  | "DRAFT"
  | "PENDING_UPLOAD"
  | "IMPORTING"
  | "PROCESSING"
  | "READY"
  | "ERROR";

type VideoProviderValue = "MOCK" | "CLOUDFLARE_STREAM";

type LessonVideoPlayerProps = {
  videoSourceType?: MediaSourceTypeValue;
  videoUrl?: string | null;
  videoPlaybackId?: string | null;
  videoAsset?: {
    provider: VideoProviderValue;
    sourceType: Exclude<MediaSourceTypeValue, null>;
    status: VideoAssetStatusValue;
    playerUrl: string | null;
    sourceUrl: string | null;
    playbackId: string | null;
    errorMessage: string | null;
  } | null;
  title: string;
};

function canRenderEmbed(
  sourceType?: MediaSourceTypeValue,
  playerUrl?: string | null,
) {
  return Boolean(
    playerUrl &&
      (sourceType === "RUTUBE_EMBED" ||
        sourceType === "EXTERNAL_EMBED" ||
        sourceType === "MANAGED_UPLOAD" ||
        sourceType === "CLOUD_IMPORT"),
  );
}

function canRenderNativeVideo(
  provider?: VideoProviderValue | null,
  playerUrl?: string | null,
) {
  if (!playerUrl) {
    return false;
  }

  if (playerUrl.startsWith("/api/lesson-video/")) {
    return true;
  }

  if (provider === "MOCK") {
    return true;
  }

  return /\.(mp4|m4v|webm|ogg|mov)(?:[?#].*)?$/i.test(playerUrl);
}

export function LessonVideoPlayer({
  videoSourceType,
  videoUrl,
  videoPlaybackId,
  videoAsset,
  title,
}: LessonVideoPlayerProps) {
  const sourceType = videoAsset?.sourceType ?? videoSourceType ?? null;
  const playerUrl = videoAsset?.playerUrl ?? videoUrl ?? null;
  const playbackId = videoAsset?.playbackId ?? videoPlaybackId ?? null;

  if (videoAsset?.status === "ERROR") {
    return (
      <SystemNotice
        tone="warning"
        title="Видео не удалось подготовить к воспроизведению"
        description={
          videoAsset.errorMessage
            ? `Детали: ${videoAsset.errorMessage}`
            : undefined
        }
        className="p-6"
      />
    );
  }

  if (
    videoAsset &&
    (videoAsset.status === "PENDING_UPLOAD" ||
      videoAsset.status === "IMPORTING" ||
      videoAsset.status === "PROCESSING")
  ) {
    return (
      <div className={`${systemCardClassName} p-6`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Видео готовится
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Файл уже привязан к уроку, но провайдер еще обрабатывает его. Когда
          подготовка завершится, здесь появится плеер.
        </p>
        {playbackId ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Идентификатор видео уже создан.
          </p>
        ) : null}
      </div>
    );
  }

  if (canRenderEmbed(sourceType, playerUrl)) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black">
        <div className="aspect-video">
          <iframe
            className="h-full w-full"
            src={playerUrl ?? undefined}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (canRenderNativeVideo(videoAsset?.provider, playerUrl)) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black">
        <div className="aspect-video">
          <video
            className="h-full w-full"
            controls
            preload="metadata"
            playsInline
            src={playerUrl ?? undefined}
          />
        </div>
      </div>
    );
  }

  if (videoAsset || sourceType || playbackId) {
    return (
      <div className={`${systemCardClassName} p-6`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Видео урока
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Видео уже прикреплено, но для воспроизведения еще не хватает рабочего
          адреса плеера. Это ожидаемо в локальном тестовом режиме или при
          неполной настройке видео-провайдера.
        </p>
      </div>
    );
  }

  return null;
}
