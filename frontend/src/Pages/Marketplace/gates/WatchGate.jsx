import React, { useEffect, useRef, useState } from "react";
import { Progress } from "antd";
import { api } from "../../../util/axios";
import { youtubeId } from "../../../util/youtube";

/**
 * WATCH_SESSION gate: embedded YouTube player, credited only while actually
 * playing. The number shown here is cosmetic — the server's own
 * WatchSession.creditedSeconds (returned by /watch/ping) is the only figure
 * that determines whether Submit unlocks. See task.service.js pingWatchSession.
 */
const WatchGate = ({ task, taskId, onProgress }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const pingInterval = useRef(null);
  const lastKnownTime = useRef(0);

  const [credited, setCredited] = useState(0);
  const [ready, setReady] = useState(false);

  const minDuration = task.typeConfig?.minDurationSeconds || 0;

  useEffect(() => {
    api.post(`tasks/feed/${taskId}/watch/start`).then((res) => {
      setCredited(res.data.creditedSeconds || 0);
      onProgress?.(res.data.creditedSeconds || 0, minDuration);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const onYouTubeIframeAPIReady = () => loadPlayer();
    if (window.YT && window.YT.Player) loadPlayer();
    else window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    return () => {
      stopPinging();
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.targetUrl]);

  const loadPlayer = () => {
    const videoId = youtubeId(task.targetUrl);
    if (!videoId || !containerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "315",
      width: "100%",
      videoId,
      playerVars: { autoplay: 0, controls: 1 },
      events: {
        onReady: () => setReady(true),
        onStateChange: (event) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            lastKnownTime.current = playerRef.current.getCurrentTime();
            startPinging();
          } else {
            stopPinging();
          }
        },
      },
    });
  };

  const ping = async (reset = false) => {
    try {
      const res = await api.post(`tasks/feed/${taskId}/watch/ping`, { reset });
      setCredited(res.data.creditedSeconds || 0);
      onProgress?.(res.data.creditedSeconds || 0, minDuration);
    } catch {
      // A single failed heartbeat is not fatal — the next tick retries.
    }
  };

  const startPinging = () => {
    if (pingInterval.current) return;
    // Reset first: don't credit whatever time elapsed while paused.
    ping(true);
    pingInterval.current = setInterval(() => {
      // Seek detection: a forward jump much larger than the ping interval
      // means the worker scrubbed ahead rather than watched — don't credit it.
      const current = playerRef.current?.getCurrentTime?.() ?? 0;
      const jumped = current - lastKnownTime.current > 20;
      lastKnownTime.current = current;
      if (jumped) {
        ping(true); // treat like a pause/resume: reset without crediting
      } else {
        ping(false);
      }
    }, 15000);
  };

  const stopPinging = () => {
    clearInterval(pingInterval.current);
    pingInterval.current = null;
  };

  const handlePlay = () => ready && playerRef.current?.playVideo();
  const percent = minDuration ? Math.min(100, Math.round((credited / minDuration) * 100)) : 0;
  const done = credited >= minDuration;

  return (
    <div className="space-y-3">
      <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" />
      <Progress percent={percent} size="small" status={done ? "success" : "active"} />
      <div className="flex items-center justify-between text-xs">
        <button onClick={handlePlay} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          ▶️ Play
        </button>
        <span className={done ? "text-emerald-600 font-bold" : "text-gray-500"}>
          Watched {Math.floor(credited)}s / {minDuration}s
        </span>
      </div>
    </div>
  );
};

export default WatchGate;
