"use client";

import { Link2, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SystemActionRow,
  SystemNotice,
  systemCardClassName,
  systemCardInsetClassName,
} from "@/components/system/system-ui";

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
  onResolvedTitle?: (title: string) => void;
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

const statusVariantMap: Record<string, "default" | "neutral" | "success" | "warning"> = {
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
    throw new Error(data.error || "Не удалось выполнить действие с видео.");
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
      successMessage: "Видео по ссылке плеера подключено к уроку.",
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
  onResolvedTitle,
}: AdminLessonVideoManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [managedFile, setManagedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasVideo = Boolean(
    initialAsset || fallbackVideoSourceType || fallbackVideoUrl || fallbackVideoPlaybackId,
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
      setError(actionError instanceof Error ? actionError.message : "Unexpected error.");
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

        if (uploadUrl.startsWith("mock://")) {
          const fileFormData = new FormData();
          fileFormData.append("assetId", assetId);
          fileFormData.append("file", managedFile);

          const uploadResponse = await fetch("/api/admin/video/upload", {
            method: "POST",
            body: fileFormData,
          });

          if (!uploadResponse.ok) {
            const payload = (await uploadResponse.json().catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(payload?.error || "Файл не загрузился в платформу.");
          }
        } else {
          const fileFormData = new FormData();
          fileFormData.append("file", managedFile);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: fileFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Файл не загрузился в видеосервис.");
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
          const result = await postVideoCommand({
            action: "attachEmbed",
            lessonId,
            sourceType: strategy.sourceType,
            videoUrl: trimmedUrl,
          });

          const resolvedTitle = result.title;

          if (typeof resolvedTitle === "string" && resolvedTitle.trim()) {
            onResolvedTitle?.(resolvedTitle.trim());
          }
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
    <section className={`space-y-5 ${systemCardClassName} p-5`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Видео
          </p>
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Управление источником урока
          </h3>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Подключи ссылку или загрузи файл. Дальше урок использует один актуальный источник.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {initialAsset ? (
            <Badge
              variant={statusVariantMap[initialAsset.status] ?? "neutral"}
              className="shadow-[0_10px_24px_rgba(24,32,59,0.06)]"
            >
              {statusLabelMap[initialAsset.status] ?? initialAsset.status}
            </Badge>
          ) : hasVideo ? (
            <Badge variant="neutral" className="shadow-[0_10px_24px_rgba(24,32,59,0.06)]">
              Подключено
            </Badge>
          ) : (
            <Badge variant="neutral" className="shadow-[0_10px_24px_rgba(24,32,59,0.06)]">
              Без видео
            </Badge>
          )}

          {initialAsset?.id ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshAsset}
              disabled={pendingAction !== null}
            >
              Обновить
            </Button>
          ) : null}

          {hasVideo ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleClearVideo}
              disabled={pendingAction !== null}
            >
              Очистить
            </Button>
          ) : null}
        </div>
      </div>

      {(initialAsset || hasVideo) ? (
        <SystemNotice
          title="Текущее состояние"
          description={
            <>
              Источник:{" "}
              <span className="font-medium text-[var(--foreground)]">
                {initialAsset?.sourceType ?? fallbackVideoSourceType ?? "подключено"}
              </span>
            </>
          }
        >
          {initialAsset?.playerUrl || initialAsset?.sourceUrl || fallbackVideoUrl ? (
            <p className="truncate rounded-[var(--radius-sm)] bg-[rgba(244,247,255,0.92)] px-3 py-2 text-[13px]">
              {initialAsset?.playerUrl ?? initialAsset?.sourceUrl ?? fallbackVideoUrl}
            </p>
          ) : null}
          {initialAsset?.errorMessage ? (
            <p className="mt-2 text-red-600">{initialAsset.errorMessage}</p>
          ) : null}
        </SystemNotice>
      ) : null}

      {message ? (
        <SystemNotice tone="info" title="Готово" description={message} />
      ) : null}

      {error ? (
        <SystemNotice tone="warning" title="Нужно исправить" description={error} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className={`${systemCardInsetClassName} p-4`}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Ссылка
            </p>
            <h4 className="text-base font-semibold text-[var(--foreground)]">
              Подключить внешнее видео
            </h4>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <Label htmlFor={`video-link-${lessonId}`}>Ссылка на видео</Label>
              <Input
                id={`video-link-${lessonId}`}
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="RUTUBE, ссылка плеера или прямая ссылка"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleVideoLink}
                disabled={pendingAction !== null || !videoUrl.trim()}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {pendingAction === "video-link" ? "Подключаем..." : "Подключить"}
              </Button>
            </div>
          </div>
        </div>

        <div className={`${systemCardInsetClassName} px-4 py-4`}>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Файл
            </p>
            <h4 className="text-base font-semibold text-[var(--foreground)]">
              Загрузить локальное видео
            </h4>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Файл для managed upload
              </p>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">
                {managedFile ? `Выбран файл: ${managedFile.name}` : "Файл пока не выбран."}
              </p>
            </div>

            <SystemActionRow dense>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Выбрать файл
              </Button>
              <Button
                type="button"
                onClick={handleManagedUpload}
                disabled={pendingAction !== null || !managedFile}
              >
                <Upload className="mr-2 h-4 w-4" />
                {pendingAction === "managed-upload" ? "Загружаем..." : "Загрузить"}
              </Button>
            </SystemActionRow>
          </div>
        </div>
      </div>
    </section>
  );
}
