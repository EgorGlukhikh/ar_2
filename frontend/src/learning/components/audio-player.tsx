"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type AudioPlayerProps = {
  src: string;
  title?: string;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEED_OPTIONS = [1, 1.5, 2] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

function resolveAudioSrc(src: string): string {
  if (src.includes("disk.yandex.ru") || src.includes("yadi.sk")) {
    return `/api/audio-proxy?url=${encodeURIComponent(src)}`;
  }
  return src;
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  }

  function handleProgressClick(event: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }

  function cycleSpeed() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length];
    audio.playbackRate = next;
    setSpeed(next);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <audio ref={audioRef} src={resolveAudioSrc(src)} preload="metadata" />

      {title ? (
        <p className="mb-4 text-sm font-semibold text-[var(--foreground)]">{title}</p>
      ) : null}

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-sm)] transition hover:opacity-90 active:scale-95"
          aria-label={playing ? "Пауза" : "Воспроизвести"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>

        {/* Progress + time */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-[var(--border)]"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)] transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time */}
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed */}
        <button
          type="button"
          onClick={cycleSpeed}
          className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          aria-label="Скорость воспроизведения"
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}
