"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function AdminLessonVideoManager({
  lessonId,
  initialAsset,
  fallbackVideoSourceType,
  fallbackVideoUrl,
  fallbackVideoPlaybackId,
}: AdminLessonVideoManagerProps) {
  const router = useRouter();
  const [managedFile, setManagedFile] = useState<File | null>(null);
  const [cloudImportUrl, setCloudImportUrl] = useState("");
  const [rutubeUrl, setRutubeUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
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
          throw new Error("Не удалось создать upload session.");
        }

        if (!uploadUrl.startsWith("mock://")) {
          const fileFormData = new FormData();
          fileFormData.append("file", managedFile);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: fileFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Загрузка файла в video provider завершилась ошибкой.");
          }
        }

        await postVideoCommand({
          action: "finalizeUpload",
          assetId,
        });

        setManagedFile(null);
      },
      "Видео загружено и привязано к уроку.",
    );
  }

  async function handleCloudImport() {
    await runAction(
      "cloud-import",
      async () => {
        if (!cloudImportUrl.trim()) {
          throw new Error("Укажи ссылку на исходный видеофайл.");
        }

        await postVideoCommand({
          action: "importFromUrl",
          lessonId,
          sourceUrl: cloudImportUrl.trim(),
        });

        setCloudImportUrl("");
      },
      "Импорт видео запущен.",
    );
  }

  async function handleRutubeAttach() {
    await runAction(
      "rutube-embed",
      async () => {
        if (!rutubeUrl.trim()) {
          throw new Error("Укажи ссылку на видео RUTUBE.");
        }

        await postVideoCommand({
          action: "attachEmbed",
          lessonId,
          sourceType: "RUTUBE_EMBED",
          videoUrl: rutubeUrl.trim(),
        });

        setRutubeUrl("");
      },
      "RUTUBE-видео привязано к уроку.",
    );
  }

  async function handleExternalAttach() {
    await runAction(
      "external-embed",
      async () => {
        if (!externalUrl.trim()) {
          throw new Error("Укажи embed URL.");
        }

        await postVideoCommand({
          action: "attachEmbed",
          lessonId,
          sourceType: "EXTERNAL_EMBED",
          videoUrl: externalUrl.trim(),
        });

        setExternalUrl("");
      },
      "Внешнее embed-видео привязано к уроку.",
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
            Video Manager
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Видео урока
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Поддержаны три сценария: прямая загрузка файла, импорт по ссылке и
            привязка RUTUBE/embed-плеера.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {initialAsset ? (
            <Badge variant={statusVariantMap[initialAsset.status] ?? "neutral"}>
              {statusLabelMap[initialAsset.status] ?? initialAsset.status}
            </Badge>
          ) : hasVideo ? (
            <Badge variant="neutral">Legacy video</Badge>
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
                  {initialAsset?.sourceType ?? fallbackVideoSourceType ?? "Не указан"}
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
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Label htmlFor={`managed-video-${lessonId}`}>1. Загрузить файл</Label>
          <Input
            id={`managed-video-${lessonId}`}
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setManagedFile(file);
            }}
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Для `Cloudflare Stream` файл уйдет напрямую в provider. Для `mock`
            режима этот шаг симулируется, чтобы тестировать архитектуру локально.
          </p>
          <Button
            type="button"
            onClick={handleManagedUpload}
            disabled={pendingAction !== null}
          >
            {pendingAction === "managed-upload"
              ? "Загружаем..."
              : "Запустить managed upload"}
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Label htmlFor={`cloud-import-${lessonId}`}>2. Импорт по ссылке</Label>
          <Input
            id={`cloud-import-${lessonId}`}
            value={cloudImportUrl}
            onChange={(event) => setCloudImportUrl(event.target.value)}
            placeholder="https://storage.example.com/video.mp4"
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Подходит для прямых ссылок на видеофайл. Для публичных файлов из
            облака лучше использовать ссылку, по которой провайдер сможет скачать
            сам файл.
          </p>
          <Button
            type="button"
            onClick={handleCloudImport}
            disabled={pendingAction !== null}
          >
            {pendingAction === "cloud-import" ? "Импортируем..." : "Импортировать"}
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Label htmlFor={`rutube-embed-${lessonId}`}>3. Привязать RUTUBE</Label>
          <Input
            id={`rutube-embed-${lessonId}`}
            value={rutubeUrl}
            onChange={(event) => setRutubeUrl(event.target.value)}
            placeholder="https://rutube.ru/video/..."
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Можно вставить обычную ссылку RUTUBE, компонент сам переведет ее в
            embed-формат.
          </p>
          <Button
            type="button"
            onClick={handleRutubeAttach}
            disabled={pendingAction !== null}
          >
            {pendingAction === "rutube-embed" ? "Сохраняем..." : "Подключить RUTUBE"}
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <Label htmlFor={`external-embed-${lessonId}`}>4. Внешний embed</Label>
          <Input
            id={`external-embed-${lessonId}`}
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://player.example.com/embed/..."
          />
          <p className="text-sm leading-6 text-[var(--muted)]">
            Оставлен как запасной канал для сторонних плееров и кастомных
            источников.
          </p>
          <Button
            type="button"
            onClick={handleExternalAttach}
            disabled={pendingAction !== null}
          >
            {pendingAction === "external-embed"
              ? "Сохраняем..."
              : "Подключить embed"}
          </Button>
        </div>
      </div>
    </section>
  );
}
