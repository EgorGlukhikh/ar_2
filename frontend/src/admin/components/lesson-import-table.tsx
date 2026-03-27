"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importLessons } from "@/features/admin/course-actions";

type Row = {
  id: string;
  title: string;
  rutube: string;
  audio: string;
  file: string;
};

function makeRow(): Row {
  return {
    id: crypto.randomUUID(),
    title: "",
    rutube: "",
    audio: "",
    file: "",
  };
}

type LessonImportTableProps = {
  courseId: string;
  moduleId: string;
};

export function LessonImportTable({ courseId, moduleId }: LessonImportTableProps) {
  const [rows, setRows] = useState<Row[]>([makeRow(), makeRow(), makeRow()]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  function updateRow(id: string, field: keyof Omit<Row, "id">, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow()]);
    // Scroll to bottom after adding
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  const filledRows = rows.filter((r): boolean => Boolean(r.title.trim() || r.rutube.trim())).length;

  function handleSubmit() {
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("moduleId", moduleId);

    for (const row of rows) {
      formData.append("row_title", row.title);
      formData.append("row_rutube", row.rutube);
      formData.append("row_audio", row.audio);
      formData.append("row_file", row.file);
    }

    setResult(null);
    startTransition(async () => {
      const res = await importLessons(formData);
      if (res.ok) {
        setResult({ ok: true, message: `Создано уроков: ${res.created}. Можешь перейти в Программу.` });
        setRows([makeRow(), makeRow(), makeRow()]);
      } else {
        setResult({ ok: false, message: res.error });
      }
    });
  }

  return (
    <div className="space-y-5" ref={tableRef}>
      {/* Table header */}
      <div className="hidden grid-cols-[2rem_1fr_1.4fr_1fr_1fr_2rem] gap-2 px-1 md:grid">
        <div />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Название урока</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Rutube URL</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Аудио URL</p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Файл (PDF)</p>
        <div />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-[2rem_1fr_1.4fr_1fr_1fr_2rem] md:items-center md:rounded-none md:border-0 md:bg-transparent md:p-0"
          >
            {/* Number */}
            <div className="flex items-center justify-center">
              <span className="text-xs font-semibold text-[var(--muted)]">{index + 1}</span>
            </div>

            {/* Title */}
            <div>
              <p className="mb-1 text-xs text-[var(--muted)] md:hidden">Название</p>
              <Input
                value={row.title}
                onChange={(e) => updateRow(row.id, "title", e.target.value)}
                placeholder={`Урок ${index + 1}`}
              />
            </div>

            {/* Rutube */}
            <div>
              <p className="mb-1 text-xs text-[var(--muted)] md:hidden">Rutube URL</p>
              <Input
                value={row.rutube}
                onChange={(e) => updateRow(row.id, "rutube", e.target.value)}
                placeholder="https://rutube.ru/video/..."
              />
            </div>

            {/* Audio */}
            <div>
              <p className="mb-1 text-xs text-[var(--muted)] md:hidden">Аудио URL</p>
              <Input
                value={row.audio}
                onChange={(e) => updateRow(row.id, "audio", e.target.value)}
                placeholder="https://disk.yandex.ru/..."
              />
            </div>

            {/* File */}
            <div>
              <p className="mb-1 text-xs text-[var(--muted)] md:hidden">Файл (PDF)</p>
              <Input
                value={row.file}
                onChange={(e) => updateRow(row.id, "file", e.target.value)}
                placeholder="https://disk.yandex.ru/..."
              />
            </div>

            {/* Remove */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-500"
                aria-label="Удалить строку"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add row */}
      <button
        type="button"
        onClick={addRow}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] py-3 text-sm text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        <Plus className="h-4 w-4" />
        Добавить строку
      </button>

      {/* Result */}
      {result ? (
        <div
          className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {result.message}
        </div>
      ) : null}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
        <p className="text-sm text-[var(--muted)]">
          {filledRows > 0
            ? `Будет создано ${filledRows} ${filledRows === 1 ? "урок" : filledRows < 5 ? "урока" : "уроков"}`
            : "Заполни хотя бы название или Rutube-ссылку"}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || filledRows === 0}
        >
          {isPending ? (
            "Создаю уроки..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Импортировать уроки
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
