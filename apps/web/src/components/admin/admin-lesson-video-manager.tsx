"use client";

import { Link2, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VideoAssetState = {
  id: string;
  provider: string;
  sourceType: string;
  status: string;
  originalFilename: string | null;
  sourceUrl: string | null;
  playerUrl: string | null;
  playbackId: string | null;
  errorMessage: string | null;
};

type AdminLessonVideoManagerProps = {
  lessonId: string;
  initialAsset: VideoAssetState | null;
  fallbackVideoSourceType?: string | null;
  fallbackVideoUrl?: string | null;
  fallbackVideoPlaybackId?: string | null;
};

type LinkStrategy =
  | {
      kind: "embed";
      sourceType: "RUTUBE_EMBED" | "EXTERNAL_EMBED";
      successMessage: string;
    }
  | {
      kind: "import";
      successMessage: string;
    };

const statusVariantMap: Record<
  string,
  "default" | "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  PENDING_UPLOAD: "warning",
  IMPORTING: "warning",
  PROCESSING: "warning",
  READY: "success",
  ERROR: "warning",
};

const statusLabelMap: Record<string, string> = {
  DRAFT: "Черновик",
  PENDING_UPLOAD: "Ждет загрузку",
  IMPORTING: "Импортируется",
  PROCESSING: "Обрабатывается",
  READY: "Готово",
  ERROR: "Ошибка",
};

async function postVideoCommand(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    ok?: boolean;
    error?: string;
    result?: Record<string, unknown>;
  };

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Video request failed.");
  }

  return data.result ?? {};
}

function resolveVideoLinkStrategy(rawValue: string): LinkStrategy {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawValue.trim());
  } catch {
    throw new Error("Укажи корректную ссылку на видео.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();

  if (hostname === "rutube.ru" || hostname === "www.rutube.ru") {
    return {
      kind: "embed",
      sourceType: "RUTUBE_EMBED",
      successMessage: "Видео RUTUBE подключено к уроку.",
    };
  }

  if (
    pathname.includes("/embed/") ||
    hostname.startsWith("player.") ||
    hostname.includes("iframe.") ||
    parsedUrl.searchParams.has("embed")
  ) {
    return {
      kind: "embed",
      sourceType: "EXTERNAL_EMBED",
      successMessage: "Видео по embed-ссылке подключено к уроку.",
    };
  }

  return {
    kind: "import",
    successMessage: "Видео по ссылке отправлено в импорт.",
  };
}

export function AdminLessonVideoManager({
  lessonId,
  initialAsset,
  fallbackVideoSourceType,
  fallbackVideoUrl,
  fallbackVideoPlaybackId,
}: AdminLessonVideoManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [managedFile, setManagedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasVideo = Boolean(
    initialAsset ||
      fallbackVideoSourceType ||
      fallbackVideoUrl ||
      fallbackVideoPlaybackId,
  );

  async function runAction(
    actionName: string,
    callback: () => Promise<void>,
    successMessage: string,
  ) {
    setPendingAction(actionName);
    setError(null);
    setMessage(null);

    try {
      await callback();
      setMessage(successMessage);
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Unexpected error.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleManagedUpload() {
    if (!managedFile) {
      setError("Сначала выбери видеофайл.");
      return;
    }

    await runAction(
      "managed-upload",
      async () => {
        const uploadSession = await postVideoCommand({
          action: "createUploadSession",
          lessonId,
          filename: managedFile.name,
          mimeType: managedFile.type || "video/mp4",
          sizeInBytes: managedFile.size,
        });

        const uploadUrl = String(uploadSession.uploadUrl ?? "");
        const assetId = String(uploadSession.assetId ?? "");

        if (!uploadUrl || !assetId) {
          throw new Error("Не удалось создать сессию загрузки.");
        }

        if (!uploadUrl.startsWith("mock://")) {
          const fileFormData = new FormData();
          fileFormData.append("file", managedFile);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: fileFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Файл не загрузился в video provider.");
          }
        }

        await postVideoCommand({
          action: "finalizeUpload",
          assetId,
        });

        setManagedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      "Видео загружено и привязано к уроку.",
    );
  }

  async function handleVideoLink() {
    const trimmedUrl = videoUrl.trim();

    if (!trimmedUrl) {
      setError("Вставь ссылку на видео.");
      return;
    }

    const strategy = resolveVideoLinkStrategy(trimmedUrl);

    await runAction(
      "video-link",
      async () => {
        if (strategy.kind === "embed") {
          await postVideoCommand({
            action: "attachEmbed",
            lessonId,
            sourceType: strategy.sourceType,
            videoUrl: trimmedUrl,
          });
        } else {
          await postVideoCommand({
            action: "importFromUrl",
            lessonId,
            sourceUrl: trimmedUrl,
          });
        }

        setVideoUrl("");
      },
      strategy.successMessage,
    );
  }

  async function handleRefreshAsset() {
    if (!initialAsset?.id) {
      return;
    }

    await runAction(
      "refresh-asset",
      async () => {
        await postVideoCommand({
          action: "refreshAsset",
          assetId: initialAsset.id,
        });
      },
      "Статус видео обновлен.",
    );
  }

  async function handleClearVideo() {
    await runAction(
      "clear-video",
      async () => {
        await postVideoCommand({
          action: "clearVideo",
          lessonId,
        });
      },
      "Видео удалено из урока.",
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Видео урока
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Ссылка или файл
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Вставь ссылку на private/public RUTUBE, embed-плеер или прямой
            видеофайл. Если видео лежит на компьютере, просто нажми на плюс и
            загрузи файл.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {initialAsset ? (
            <Badge variant={statusVariantMap[initialAsset.status] ?? "neutral"}>
              {statusLabelMap[initialAsset.status] ?? initialAsset.status}
            </Badge>
          ) : hasVideo ? (
            <Badge variant="neutral">Видео из старой схемы</Badge>
          ) : (
            <Badge variant="neutral">Без видео</Badge>
          )}
        </div>
      </div>

      {(initialAsset || hasVideo) && (
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p>
                Источник:{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {initialAsset?.sourceType ??
                    fallbackVideoSourceType ??
                    "Не указан"}
                </span>
              </p>
              {initialAsset?.provider ? (
                <p>
                  Провайдер:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {initialAsset.provider}
                  </span>
                </p>
              ) : null}
              {initialAsset?.originalFilename ? (
                <p>
                  Файл:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {initialAsset.originalFilename}
                  </span>
                </p>
              ) : null}
              {initialAsset?.playbackId || fallbackVideoPlaybackId ? (
                <p>
                  Playback ID:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {initialAsset?.playbackId ?? fallbackVideoPlaybackId}
                  </span>
                </p>
              ) : null}
              {initialAsset?.playerUrl || initialAsset?.sourceUrl || fallbackVideoUrl ? (
                <p className="break-all">
                  URL:{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {initialAsset?.playerUrl ??
                      initialAsset?.sourceUrl ??
                      fallbackVideoUrl}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {initialAsset?.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefreshAsset}
                  disabled={pendingAction !== null}
                >
                  Обновить статус
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleClearVideo}
                disabled={pendingAction !== null}
              >
                Очистить видео
              </Button>
            </div>
          </div>

          {initialAsset?.errorMessage ? (
            <p className="mt-3 text-sm text-red-600">{initialAsset.errorMessage}</p>
          ) : null}
        </div>
      )}

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2840db]">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--foreground)]">
                Вставить ссылку на видео
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Поддерживаются private RUTUBE, прямые ссылки на видеофайл и
                embed-плееры. Режим подключится автоматически.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor={`video-link-${lessonId}`}>Ссылка на видео</Label>
            <Input
              id={`video-link-${lessonId}`}
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://rutube.ru/video/private/... или https://storage..."
            />
          </div>

          <Button
            type="button"
            onClick={handleVideoLink}
            disabled={pendingAction !== null}
          >
            {pendingAction === "video-link"
              ? "Подключаем..."
              : "Подключить видео"}
          </Button>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#2840db] transition hover:bg-[#dfe7ff]"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--foreground)]">
                Загрузить файл с компьютера
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                Если видео лежит локально, выбери файл и отправь его в урок.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            id={`managed-video-${lessonId}`}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setManagedFile(file);
            }}
          />

          <div className="rounded-2xl border border-dashed border-[#cfd7f3] bg-white px-4 py-3 text-sm text-[var(--muted)]">
            {managedFile ? (
              <span>
                Выбран файл:{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {managedFile.name}
                </span>
              </span>
            ) : (
              "Файл пока не выбран."
            )}
          </div>

          <Button
            type="button"
            onClick={handleManagedUpload}
            disabled={pendingAction !== null}
            className="inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {pendingAction === "managed-upload"
              ? "Загружаем..."
              : "Загрузить видео"}
          </Button>
        </div>
      </div>
    </section>
  );
}
