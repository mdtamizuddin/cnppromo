import React, { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "antd";
import toast from "react-hot-toast";
import {
  PaperClipIcon,
  CameraIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  StopIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";
import { uploadImageToS3, uploadVideoToS3, uploadAudioToS3 } from "../../util/s3Upload";
import { useSocketContext } from "../../Components/SocketContext";

const MAX_ROWS_PX = 132; // roughly six lines before the field starts scrolling

const Composer = ({ socket, chat, reply, setReply }) => {
  const { connected } = useSocketContext();
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(null); // 'image' | 'video' | null
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordLength, setRecordLength] = useState(0);
  const [attachOpen, setAttachOpen] = useState(false);

  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const typingTimerRef = useRef(null);

  const hasText = message.trim().length > 0;

  /* ── Auto-grow ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`;
  }, [message]);

  /* ── Typing signal ──────────────────────────────────────────────────── */
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!message || !chat?.user?._id || !connected || !socket) return;
    
    // Only send the start typing packet once when typing begins, not on every keystroke
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", { receiver: chat?.user?._id, chat: chat?._id, stop: false });
    }

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing", { receiver: chat?.user?._id, chat: chat?._id, stop: true });
    }, 2500);

    return () => clearTimeout(typingTimerRef.current);
  }, [message, chat, connected, socket]);

  /* ── Recording timer ────────────────────────────────────────────────── */
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => setRecordLength((p) => p + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  // Releasing the mic on unmount matters: leaving the track live keeps the
  // browser's recording indicator on after the user has navigated away.
  useEffect(
    () => () => {
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
      clearInterval(intervalRef.current);
      clearTimeout(typingTimerRef.current);
    },
    []
  );

  const emit = (payload) => {
    socket.emit("message", {
      receiver: chat?.user?._id,
      chat: chat?._id,
      reply: reply?._id || null,
      ...payload,
    });
    setReply(null);
  };

  /* ── Send text ──────────────────────────────────────────────────────── */
  const sendText = (e) => {
    e?.preventDefault();
    if (!connected) return toast.error("Still reconnecting — hold on a moment");
    const text = message.trim();
    if (!text) return;
    emit({ message: text });
    setMessage("");
    isTypingRef.current = false;
    socket.emit("typing", { receiver: chat?.user?._id, chat: chat?._id, stop: true });
  };

  // Enter sends, Shift+Enter breaks the line. The old single-line input made a
  // newline impossible to type at all.
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  /* ── Attachments ────────────────────────────────────────────────────── */
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked twice in a row
    if (!file || !connected) return;
    try {
      setUploading("image");
      const url = await uploadImageToS3(file, null, "message/image");
      emit({ image: url });
    } catch (err) {
      toast.error(err?.message || "Could not send the photo");
    } finally {
      setUploading(null);
    }
  };

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploading("video");
      const url = await uploadVideoToS3(file, null, "message/video");
      emit({ video: url });
    } catch (err) {
      toast.error(err?.message || "Could not send the video");
    } finally {
      setUploading(null);
    }
  };

  /* ── Voice ──────────────────────────────────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => setAudioBlob(ev.data);
      recorder.start();
      setRecordLength(0);
      setIsRecording(true);
    } catch {
      toast.error("Microphone access was blocked");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks?.().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRecording(false);
  };

  const discardRecording = () => {
    if (isRecording) stopRecording();
    setAudioBlob(null);
    setRecordLength(0);
  };

  const sendVoice = async () => {
    if (!audioBlob) return;
    try {
      setUploading("audio");
      const url = await uploadAudioToS3(audioBlob, null, "message/voice");
      emit({ audio: url });
      setAudioBlob(null);
      setRecordLength(0);
    } catch (err) {
      toast.error(err?.message || "Could not send the voice message");
    } finally {
      setUploading(null);
    }
  };

  const mmss = `${Math.floor(recordLength / 60)}:${String(recordLength % 60).padStart(2, "0")}`;

  // Created once per blob and revoked when it goes away; building the URL in the
  // render body leaked one object URL per render for the whole review session.
  const audioPreview = useMemo(
    () => (audioBlob ? URL.createObjectURL(audioBlob) : null),
    [audioBlob]
  );
  useEffect(() => {
    if (!audioPreview) return;
    return () => URL.revokeObjectURL(audioPreview);
  }, [audioPreview]);

  /* ── Recording / review bar replaces the composer while active ──────── */
  if (isRecording || audioBlob) {
    return (
      <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={discardRecording}
            aria-label="Discard recording"
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-400
              hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
          >
            <TrashIcon className="w-[18px] h-[18px]" />
          </button>

          {isRecording ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span className="text-sm font-semibold text-gray-700 tabular-nums">{mmss}</span>
              <span className="text-xs text-gray-400 truncate">Recording…</span>
            </div>
          ) : (
            <audio controls src={audioPreview} className="flex-1 min-w-0 h-9" />
          )}

          <button
            type="button"
            onClick={isRecording ? stopRecording : sendVoice}
            disabled={uploading === "audio"}
            aria-label={isRecording ? "Stop recording" : "Send voice message"}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand text-white
              shadow-sm hover:bg-brand/90 disabled:opacity-50 transition-colors shrink-0
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            {uploading === "audio" ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : isRecording ? (
              <StopIcon className="w-[18px] h-[18px]" />
            ) : (
              <PaperAirplaneIcon className="w-[18px] h-[18px] -rotate-45 -ml-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white">
      {!connected && (
        <div className="px-4 py-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border-b border-amber-100">
          Reconnecting… your message will send once you're back online.
        </div>
      )}

      {reply && (
        <div className="flex items-center gap-2 px-3 py-2 bg-brand-soft/50 border-b border-gray-100">
          <span className="w-0.5 self-stretch rounded-full bg-brand shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">Replying to</p>
            <p className="text-xs text-gray-600 truncate">
              {reply.message ||
                (reply.audio ? "Voice message" : reply.video ? "Video" : "Photo")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReply(null)}
            aria-label="Cancel reply"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white shrink-0"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={sendText} className="flex items-end gap-2 p-2.5">
        <input ref={imageInputRef} onChange={uploadImage} accept="image/*" type="file" className="hidden" />
        <input ref={videoInputRef} onChange={uploadVideo} accept="video/*" type="file" className="hidden" />

        <Popover
          trigger="click"
          placement="topLeft"
          open={attachOpen}
          onOpenChange={setAttachOpen}
          content={
            <div className="flex flex-col min-w-[168px] text-sm text-gray-700">
              <button
                className="chat-menu-item"
                onClick={() => {
                  setAttachOpen(false);
                  imageInputRef.current?.removeAttribute("capture");
                  imageInputRef.current?.click();
                }}
              >
                <PhotoIcon className="w-4 h-4 text-brand" /> Photo
              </button>
              <button
                className="chat-menu-item"
                onClick={() => {
                  setAttachOpen(false);
                  imageInputRef.current?.setAttribute("capture", "environment");
                  imageInputRef.current?.click();
                }}
              >
                <CameraIcon className="w-4 h-4 text-brand" /> Camera
              </button>
              <button
                className="chat-menu-item"
                onClick={() => {
                  setAttachOpen(false);
                  videoInputRef.current?.click();
                }}
              >
                <VideoCameraIcon className="w-4 h-4 text-brand" /> Video
              </button>
            </div>
          }
        >
          <button
            type="button"
            aria-label="Add an attachment"
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 shrink-0
              hover:text-brand hover:bg-brand-soft transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {uploading && uploading !== "audio" ? (
              <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-brand animate-spin" />
            ) : (
              <PaperClipIcon className="w-5 h-5" />
            )}
          </button>
        </Popover>

        <div className="flex-1 min-w-0 bg-gray-100 rounded-2xl px-3.5 py-2 focus-within:bg-gray-50 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Write a message…"
            aria-label="Message"
            className="w-full bg-transparent text-[13.5px] leading-relaxed text-gray-800 placeholder:text-gray-400
              resize-none outline-none max-h-[132px]"
          />
        </div>

        {/* One trailing control that morphs: mic when empty, send once there's text. */}
        <button
          type={hasText ? "submit" : "button"}
          onClick={hasText ? undefined : startRecording}
          aria-label={hasText ? "Send message" : "Record a voice message"}
          className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
              hasText
                ? "bg-brand text-white shadow-sm hover:bg-brand/90 scale-100"
                : "bg-gray-100 text-gray-500 hover:text-brand hover:bg-brand-soft"
            }`}
        >
          {hasText ? (
            <PaperAirplaneIcon className="w-[18px] h-[18px] -rotate-45 -ml-0.5" />
          ) : (
            <MicrophoneIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default Composer;
