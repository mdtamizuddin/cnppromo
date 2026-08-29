import React, { useCallback, useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const BARS = 40;

// Decoded peaks are keyed by url so re-rendering a thread doesn't re-fetch and
// re-decode audio the user has already scrolled past.
const peakCache = new Map();

const fmt = (s) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

// A deterministic stand-in shown while the real audio decodes, and kept if the
// decode fails (CORS, an unsupported codec). Seeding off the url means a given
// note always renders the same shape instead of flickering between renders.
const placeholderPeaks = (seed = "") => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    const base = 0.25 + ((h >>> 16) % 1000) / 1000 * 0.6;
    // Taper the ends so it reads as an utterance rather than noise.
    const taper = Math.sin((i / (BARS - 1)) * Math.PI) * 0.4 + 0.6;
    return Math.min(1, base * taper);
  });
};

/**
 * Voice note with a waveform derived from the actual audio.
 *
 * Replaces the previous static `message-wave.png`, which was the same image for
 * every recording and carried no playback position.
 */
const VoiceNote = ({ src, own }) => {
  const audioRef = useRef(null);
  const [peaks, setPeaks] = useState(() => peakCache.get(src) || placeholderPeaks(src));
  const [decoded, setDecoded] = useState(() => peakCache.has(src));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  // Decode once per url, downsampling to BARS RMS buckets.
  useEffect(() => {
    if (!src || peakCache.has(src)) return;
    let cancelled = false;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    (async () => {
      let ctx;
      try {
        const res = await fetch(src);
        const buf = await res.arrayBuffer();
        ctx = new Ctx();
        const audio = await ctx.decodeAudioData(buf);
        const raw = audio.getChannelData(0);
        const per = Math.floor(raw.length / BARS) || 1;
        const out = [];
        let max = 0;
        for (let i = 0; i < BARS; i++) {
          let sum = 0;
          const start = i * per;
          for (let j = 0; j < per; j++) {
            const v = raw[start + j] || 0;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / per);
          out.push(rms);
          if (rms > max) max = rms;
        }
        // Normalise against the loudest bucket so quiet recordings still read.
        const norm = out.map((v) => (max ? Math.max(0.08, v / max) : 0.08));
        peakCache.set(src, norm);
        if (!cancelled) {
          setPeaks(norm);
          setDecoded(true);
        }
      } catch {
        // Keep the placeholder shape — playback still works without the decode.
      } finally {
        ctx?.close?.();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, []);

  // Scrubbing: map the click position across the bar strip onto the timeline.
  const seek = useCallback(
    (e) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(el.duration)) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      el.currentTime = ratio * el.duration;
      setProgress(ratio);
    },
    []
  );

  const played = Math.round(progress * BARS);

  return (
    <div className="flex items-center gap-3 min-w-[210px]">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            own
              ? "bg-white/20 text-white hover:bg-white/30 focus-visible:ring-white/60"
              : "bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand/50"
          }`}
      >
        {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div
          onClick={seek}
          role="slider"
          aria-label="Seek voice message"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          onKeyDown={(e) => {
            const el = audioRef.current;
            if (!el || !Number.isFinite(el.duration)) return;
            if (e.key === "ArrowRight") el.currentTime = Math.min(el.duration, el.currentTime + 2);
            if (e.key === "ArrowLeft") el.currentTime = Math.max(0, el.currentTime - 2);
          }}
          className="flex items-end gap-[2px] h-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded"
          style={{ opacity: decoded ? 1 : 0.75 }}
        >
          {peaks.map((v, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors duration-75 ${
                i < played
                  ? own
                    ? "bg-white"
                    : "bg-brand"
                  : own
                  ? "bg-white/35"
                  : "bg-gray-300"
              }`}
              style={{ height: `${Math.max(10, v * 100)}%` }}
            />
          ))}
        </div>
        <div
          className={`flex justify-between text-[10px] mt-1 tabular-nums ${
            own ? "text-white/70" : "text-gray-400"
          }`}
        >
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          setCurrent(0);
        }}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setCurrent(el.currentTime);
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setProgress(el.currentTime / el.duration);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default VoiceNote;
