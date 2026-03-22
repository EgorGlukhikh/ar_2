import { MediaSourceType, VideoAssetStatus, VideoProviderType } from "@academy/db";

type LessonVideoPlayerProps = {
  videoSourceType?: MediaSourceType | null;
  videoUrl?: string | null;
  videoPlaybackId?: string | null;
  videoAsset?: {
    provider: VideoProviderType;
    sourceType: MediaSourceType;
    status: VideoAssetStatus;
    playerUrl: string | null;
    sourceUrl: string | null;
    playbackId: string | null;
    errorMessage: string | null;
  } | null;
  title: string;
};

function canRenderEmbed(
  sourceType?: MediaSourceType | null,
  playerUrl?: string | null,
) {
  return Boolean(
    playerUrl &&
      (sourceType === MediaSourceType.RUTUBE_EMBED ||
        sourceType === MediaSourceType.EXTERNAL_EMBED ||
        sourceType === MediaSourceType.MANAGED_UPLOAD ||
        sourceType === MediaSourceType.CLOUD_IMPORT),
  );
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

  if (videoAsset?.status === VideoAssetStatus.ERROR) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm leading-7 text-red-700">
        Видео не удалось подготовить к воспроизведению.
        {videoAsset.errorMessage ? ` ${videoAsset.errorMessage}` : ""}
      </div>
    );
  }

  if (
    videoAsset &&
    (videoAsset.status === VideoAssetStatus.PENDING_UPLOAD ||
      videoAsset.status === VideoAssetStatus.IMPORTING ||
      videoAsset.status === VideoAssetStatus.PROCESSING)
  ) {
    return (
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
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
      <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-black">
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

  if (videoAsset || sourceType || playbackId) {
    return (
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Видео урока
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Видео уже прикреплено, но для воспроизведения еще не хватает рабочего
          адреса плеера. Это ожидаемо в локальном тестовом режиме или при неполной
          настройке видео-провайдера.
        </p>
      </div>
    );
  }

  return null;
}
