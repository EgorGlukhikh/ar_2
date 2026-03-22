"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

type LessonEngagementTrackerProps = {
  courseId: string;
  lessonId: string;
  entryPath: string;
  hasVideo: boolean;
  sourceType?: string | null;
};

type RutubePlayerMessage = {
  type?: string;
  data?: {
    state?: string;
    time?: number;
    duration?: number;
  };
};

function isRutubeOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return url.hostname === "rutube.ru" || url.hostname.endsWith(".rutube.ru");
  } catch {
    return false;
  }
}

export function LessonEngagementTracker({
  courseId,
  lessonId,
  entryPath,
  hasVideo,
  sourceType,
}: LessonEngagementTrackerProps) {
  const clientSessionId = useMemo(() => crypto.randomUUID(), []);
  const closedRef = useRef(false);
  const positionRef = useRef(0);
  const durationRef = useRef<number | null>(null);
  const playerStateRef = useRef<string | null>(null);
  const visibilityStateRef = useRef<string>(
    typeof document === "undefined" ? "visible" : document.visibilityState,
  );

  const readNativeVideoState = useCallback(() => {
    const video = document.querySelector("video");

    if (!video) {
      return;
    }

    positionRef.current = Math.max(positionRef.current, Math.round(video.currentTime || 0));
    durationRef.current = Number.isFinite(video.duration) ? Math.round(video.duration) : durationRef.current;
    playerStateRef.current = video.paused ? "paused" : "playing";
  }, []);

  const postEvent = useCallback((
    eventType: string,
    extra?: Partial<{
      positionSeconds: number | null;
      durationSeconds: number | null;
      playerState: string | null;
      visibilityState: string | null;
      exitReason: string | null;
      payload: Record<string, unknown>;
    }>,
    flush = false,
  ) => {
    if (typeof document !== "undefined") {
      readNativeVideoState();
    }

    const body = {
      clientSessionId,
      courseId,
      lessonId,
      eventType,
      entryPath,
      hadVideo: hasVideo,
      sourceType: sourceType ?? null,
      positionSeconds: extra?.positionSeconds ?? positionRef.current,
      durationSeconds: extra?.durationSeconds ?? durationRef.current,
      playerState: extra?.playerState ?? playerStateRef.current,
      visibilityState: extra?.visibilityState ?? visibilityStateRef.current,
      exitReason: extra?.exitReason ?? null,
      payload: extra?.payload ?? null,
    };

    const payload = JSON.stringify(body);

    if (flush && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const sent = navigator.sendBeacon(
        "/api/learning/telemetry",
        new Blob([payload], { type: "application/json" }),
      );

      if (sent) {
        return;
      }
    }

    void fetch("/api/learning/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: flush,
      cache: "no-store",
    }).catch(() => undefined);
  }, [clientSessionId, courseId, entryPath, hasVideo, lessonId, readNativeVideoState, sourceType]);

  useEffect(() => {
    postEvent("session_started", {
      payload: {
        userAgent: navigator.userAgent,
      },
    });

    const heartbeat = window.setInterval(() => {
      postEvent("lesson_heartbeat");
    }, 15_000);

    function handleVisibilityChange() {
      visibilityStateRef.current = document.visibilityState;
      postEvent(
        document.visibilityState === "hidden" ? "page_hidden" : "page_visible",
        {
          visibilityState: document.visibilityState,
        },
        document.visibilityState === "hidden",
      );
    }

    function closeSession(exitReason: string) {
      if (closedRef.current) {
        return;
      }

      closedRef.current = true;
      postEvent(
        "session_closed",
        {
          exitReason,
        },
        true,
      );
    }

    function handlePageHide() {
      closeSession("pagehide");
    }

    function handleBeforeUnload() {
      closeSession("beforeunload");
    }

    function handleMessage(event: MessageEvent<string>) {
      if (sourceType !== "RUTUBE_EMBED" || !isRutubeOrigin(event.origin)) {
        return;
      }

      let parsed: RutubePlayerMessage | null = null;

      try {
        parsed =
          typeof event.data === "string" ? (JSON.parse(event.data) as RutubePlayerMessage) : null;
      } catch {
        parsed = null;
      }

      if (!parsed?.type) {
        return;
      }

      if (parsed.type === "player:currentTime" && typeof parsed.data?.time === "number") {
        positionRef.current = Math.max(positionRef.current, Math.round(parsed.data.time));
      }

      if (parsed.type === "player:durationChange" && typeof parsed.data?.duration === "number") {
        durationRef.current = Math.round(parsed.data.duration);
      }

      if (parsed.type === "player:changeState" && parsed.data?.state) {
        playerStateRef.current = parsed.data.state;
        postEvent("player_state", {
          playerState: parsed.data.state,
          payload: {
            vendor: "rutube",
          },
        });
      }

      if (parsed.type === "player:playComplete") {
        playerStateRef.current = "completed";
        postEvent(
          "player_complete",
          {
            playerState: "completed",
            exitReason: "complete",
            payload: {
              vendor: "rutube",
            },
          },
          true,
        );
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("message", handleMessage as EventListener);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("message", handleMessage as EventListener);

      if (!closedRef.current) {
        postEvent(
          "session_closed",
          {
            exitReason: "lesson-switch",
          },
          true,
        );
      }
    };
  }, [postEvent, sourceType]);

  return null;
}
