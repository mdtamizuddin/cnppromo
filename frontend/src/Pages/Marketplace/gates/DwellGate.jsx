import React, { useEffect, useRef, useState } from "react";
import { Progress } from "antd";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { api } from "../../../util/axios";

/**
 * DWELL gate: opens the target link in a new tab, and credits time only
 * while OUR tab is hidden — i.e. while the worker is genuinely over there.
 * Same server-verified ping/clamp as WatchGate; see task.service.js.
 */
const DwellGate = ({ task, taskId, onProgress }) => {
  const [credited, setCredited] = useState(0);
  const [opened, setOpened] = useState(false);
  const pingInterval = useRef(null);

  const minDuration = task.typeConfig?.minDurationSeconds || 0;

  useEffect(() => {
    api.post(`tasks/feed/${taskId}/watch/start`).then((res) => {
      setCredited(res.data.creditedSeconds || 0);
      onProgress?.(res.data.creditedSeconds || 0, minDuration);
    });
    return () => stopPinging();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const ping = async (reset = false) => {
    try {
      const res = await api.post(`tasks/feed/${taskId}/watch/ping`, { reset });
      setCredited(res.data.creditedSeconds || 0);
      onProgress?.(res.data.creditedSeconds || 0, minDuration);
    } catch {
      // ignore — next tick retries
    }
  };

  const startPinging = () => {
    if (pingInterval.current) return;
    ping(true);
    pingInterval.current = setInterval(() => ping(false), 15000);
  };

  const stopPinging = () => {
    clearInterval(pingInterval.current);
    pingInterval.current = null;
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") startPinging();
      else stopPinging();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const openTask = () => {
    window.open(task.targetUrl, "_blank", "noopener,noreferrer");
    setOpened(true);
  };

  const percent = minDuration ? Math.min(100, Math.round((credited / minDuration) * 100)) : 0;
  const done = credited >= minDuration;

  return (
    <div className="space-y-3">
      <button
        onClick={openTask}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition-colors"
      >
        Open Task <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </button>
      <Progress percent={percent} size="small" status={done ? "success" : "active"} />
      <p className={`text-xs text-center ${done ? "text-emerald-600 font-bold" : "text-gray-500"}`}>
        {done
          ? "Great — you can submit now."
          : opened
          ? `Stay on the other tab. Time on task: ${Math.floor(credited)}s / ${minDuration}s`
          : `Open the task and stay there for ${minDuration}s.`}
      </p>
    </div>
  );
};

export default DwellGate;
