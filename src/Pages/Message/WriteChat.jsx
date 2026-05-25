import {
  AudioOutlined,
  CameraFilled,
  FileImageFilled,
  VideoCameraFilled,
} from "@ant-design/icons";
import React, { useState, useRef, useEffect } from "react";
import { api } from "../../util/axios";
import { Spin, Popover, Input } from "antd";
import { useSocketContext } from "../../Components/SocketContext";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const WriteChat = ({ socket, chat, reply, setReply }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const { connected } = useSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [message, setMessage] = useState("");
  const [recordLength, setRecordLength] = useState(1);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordLength((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => setAudioBlob(event.data);
      mediaRecorder.start();
      setRecordLength(1);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    try {
      const response = await api.post("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newMessage = {
        receiver: chat?.user?._id,
        sender: chat?.owner?._id,
        chat: chat?._id,
        audio: response.data.url,
        reply: reply?._id || null,
      };
      socket.emit("message", newMessage);
      setAudioBlob(null);
      setReply(null);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const uploadIMage = async (e) => {
    try {
      if (!connected) return;
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/upload", formData);
      socket.emit("message", {
        receiver: chat?.user?._id,
        sender: chat?.owner?._id,
        chat: chat?._id,
        image: res.data.url,
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!connected) return toast.error("Wait");
    const msgText = e.target.message.value;
    socket.emit("message", {
      message: msgText,
      receiver: chat?.user?._id,
      sender: chat?.owner?._id,
      chat: chat?._id,
      reply: reply?._id || null,
    });
    setMessage("");
    setReply(null);
  };

  const uploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes("video")) {
      return toast.error("Please select a valid video file (MP4, WebM, Ogg, etc).");
    }
    const formData = new FormData();
    formData.append("video", file);
    try {
      setUploadingVideo(true);
      const res = await api.post("/upload/video", formData);
      socket.emit("message", {
        receiver: chat?.user?._id,
        sender: chat?.owner?._id,
        chat: chat?._id,
        video: res.data.url,
        reply: reply?._id || null,
      });
      setUploadingVideo(false);
      setReply(null);
    } catch (error) {
      console.error(error);
      setUploadingVideo(false);
    }
  };

  const openCamera = () => {
    document.getElementById("file")?.setAttribute("capture", "environment");
    document.getElementById("file")?.click();
  };

  const openGallery = () => {
    document.getElementById("file")?.removeAttribute("capture");
    document.getElementById("file")?.click();
  };

  if (!connected) {
    return <div className="p-3 text-center text-white text-sm">Reconnecting...</div>;
  }

  return (
    <form onSubmit={sendMessage} className="flex items-center justify-between w-full p-3 border border-gray-300 relative shrink-0">
      {reply && (
        <div className="absolute top-[-42px] text-black text-[11px] bg-gray-100 px-2 py-1 rounded min-w-[200px]">
          <h2 className="border-b">Reply to</h2>
          <p>
            {reply.message
              ? reply.message.slice(0, 50)
              : reply.audio ? "Voice Message" : reply.video ? "A Video" : "Image"}
          </p>
          <div className="absolute top-[0px] right-[3px] text-sm" onClick={() => setReply(null)}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
        </div>
      )}
      <Input
        onChange={(e) => setMessage(e.target.value)}
        value={message}
        type="text"
        placeholder="Message"
        className="block w-full py-2 pl-4 mx-3 bg-gray-100 outline-none focus:text-gray-700 text-xs"
        name="message"
        required
      />
      <input onChange={uploadIMage} accept="image/*" type="file" id="file" className="hidden" />
      <Popover
        trigger={"click"}
        content={
          <div className="flex items-center gap-x-3 text-lg text-red-400">
            <CameraFilled onClick={openCamera} />
            <FileImageFilled onClick={openGallery} />
          </div>
        }
      >
        <button className="mr-3 text-white text-xl cursor-pointer" type="button">
          {loading ? <Spin /> : <CameraFilled />}
        </button>
      </Popover>
      <label htmlFor="video" className="mr-3 text-white text-xl cursor-pointer">
        {uploadingVideo ? <Spin /> : <VideoCameraFilled />}
        <input onChange={uploadVideo} accept="video/*" type="file" id="video" className="hidden" />
      </label>
      <Popover
        trigger={"click"}
        content={
          <div className="min-w-[250px] min-h-[150px] flex flex-col justify-center items-center">
            <div onClick={isRecording ? stopRecording : startRecording}>
              {isRecording ? (
                <div className="waveform">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                  {recordLength}s
                </div>
              ) : audioBlob ? null : (
                "Start Recording"
              )}
            </div>
            {audioBlob && (
              <div>
                <audio controls src={URL.createObjectURL(audioBlob)}></audio>
                <div onClick={() => setAudioBlob(null)} className="text-red-500 text-sm mt-2 cursor-pointer">Cancel</div>
                <div onClick={uploadAudio} className="text-green-600 text-base flex items-center gap-x-2 mt-2 cursor-pointer">
                  Send Voice
                  <svg className="w-3 h-3 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        }
      >
        <span className="text-xl text-white mr-4"><AudioOutlined /></span>
      </Popover>
      <button type="submit">
        <svg className="w-5 h-5 text-gray-100 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </form>
  );
};

export default WriteChat;
