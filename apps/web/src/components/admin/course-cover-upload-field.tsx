"use client";

import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CourseCoverUploadFieldProps = {
  courseId: string;
  initialCoverUrl?: string;
  initialFilename?: string | null;
};

type UploadResponse = {
  ok?: boolean;
  error?: string;
  file?: {
    id: string;
    filename: string;
    sizeInBytes: number;
    url: string;
  };
};

const REQUIRED_COVER_RATIO = 16 / 9;
const COVER_RATIO_TOLERANCE = 0.015;

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      reject(new Error("Не удалось прочитать размеры изображения."));
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

function isAcceptedCoverRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return false;
  }

  const ratio = width / height;
  return Math.abs(ratio - REQUIRED_COVER_RATIO) <= COVER_RATIO_TOLERANCE;
}

export function CourseCoverUploadField({
  courseId,
  initialCoverUrl = "",
  initialFilename,
}: CourseCoverUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [filename, setFilename] = useState(initialFilename ?? "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelection(file: File) {
    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const { width, height } = await readImageDimensions(file);

      if (!isAcceptedCoverRatio(width, height)) {
        throw new Error(
          `Обложка должна быть строго в формате 16:9. Сейчас загружено изображение ${width}×${height}.`,
        );
      }

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("file", file);

      const response = await fetch("/api/admin/course-cover", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as UploadResponse | null;

      if (!response.ok || !payload?.ok || !payload.file) {
        throw new Error(payload?.error || "Не удалось загрузить обложку.");
      }

      setCoverUrl(payload.file.url);
      setFilename(payload.file.filename);
      setMessage(
        `Файл загружен: ${payload.file.filename} (${formatFileSize(payload.file.sizeInBytes)}). Формат 16:9 подтверждён.`,
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Не удалось загрузить обложку.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleClear() {
    setCoverUrl("");
    setFilename("");
    setMessage("Обложка будет очищена после сохранения курса.");
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="courseCoverUpload">Обложка курса</Label>
        <input type="hidden" name="coverUrl" value={coverUrl} />
        <input
          ref={inputRef}
          id="courseCoverUpload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              void handleFileSelection(file);
            }
          }}
        />

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {coverUrl ? "Заменить файл" : "Загрузить файл"}
            </Button>

            {coverUrl ? (
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4" />
                Убрать обложку
              </Button>
            ) : null}
          </div>

          <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            Загружай только горизонтальную обложку в формате 16:9.
            Подойдут, например, 1280×720, 1600×900 или 1920×1080.
            Обложка этого формата используется в карточках курса и каталоге без обрезки логики композиции.
          </div>

          {filename ? (
            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{filename}</p>
          ) : null}

          {message ? (
            <p className="mt-2 text-sm text-[var(--primary)]">{message}</p>
          ) : null}

          {error ? (
            <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="h-32 w-full bg-[linear-gradient(135deg,rgba(92,98,255,0.08),rgba(255,179,214,0.1))] sm:h-36">
              {coverUrl ? (
                <div
                  aria-label="Превью обложки курса"
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${coverUrl}")` }}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[var(--muted)]">
                  После загрузки здесь появится компактное превью обложки курса.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
