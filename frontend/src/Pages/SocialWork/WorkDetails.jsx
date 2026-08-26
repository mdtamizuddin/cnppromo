import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../util/axios";
import { Spin, Input, message, Progress } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const extractYouTubeId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (parsed.hostname.includes("youtube.com"))
      return parsed.searchParams.get("v");
  } catch {
    return url;
  }
};

const WorkDetails = () => {
  const { user } = useSelector((state) => state.user);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const trackingInterval = useRef(null);

  const [playTime, setPlayTime] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [work, setWork] = useState({});
  const [loading, setLoading] = useState(true);

  const [prase, setPrase] = useState(0);
  const [text, setText] = useState("");
  const [ans, setAns] = useState([]);

  const params = useParams();
  const workId = params.id;

  // Fetch work data
  useEffect(() => {
    const fetchWork = async () => {
      try {
        const res = await api.get(`social-works/${workId}`);
        const data = res.data;

        // Convert regex strings to actual RegExp
        if (data.answers) {
          data.answers = data.answers.map((a) => ({
            ...a,
            regex: new RegExp(a.regex),
          }));
        }

        setWork(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch work:", error);
        setLoading(false);
      }
    };
    fetchWork();
  }, [workId]);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const onYouTubeIframeAPIReady = () => {
      loadYouTubePlayer();
    };

    if (window.YT && window.YT.Player) {
      loadYouTubePlayer();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      stopTracking();
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [work]);

  const loadYouTubePlayer = () => {
    if (!work?.url) return;
    const videoId = extractYouTubeId(work.url);

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "315",
      width: "560",
      videoId,
      playerVars: { autoplay: 0, controls: 1 },
      events: {
        onReady: () => setIsPlayerReady(true),
        onStateChange: (event) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTracking();
          } else {
            setIsPlaying(false);
            stopTracking();
          }
        },
      },
    });
  };

  const startTracking = () => {
    if (trackingInterval.current) return;
    trackingInterval.current = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTracking = () => {
    clearInterval(trackingInterval.current);
    trackingInterval.current = null;
  };

  const handlePlay = () => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.playVideo();
    }
  };
  const handleAnswerChange = (value) => {
    setText(value);
    const current = work.questions?.[prase];
    if (current?.trim().toLowerCase() === value.trim().toLowerCase()) {
      setAns([...ans, value]);
      setText("");
      if (prase + 1 < work.questions.length) {
        setPrase(prase + 1);
        message.success(`✅ Question ${prase + 1} answered correctly!`);
      } else {
        message.success("✅ All questions answered correctly!");
      }
    }
  };
  const navigate = useNavigate();
  const onSubmit = async () => {
    try {
      const res = await api.post("social-works/submit", {
        workId: work?._id,
        answers: ans,
        userId: user?._id,
        duration: playTime,
      });
      message.success("Submitted Successfully");
      navigate("/social-works");
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) return <Spin size="large" fullscreen />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 container mx-auto">
      <h2 className="text-2xl mb-4 font-semibold text-center">{work.title}</h2>
      <p className="text-gray-600 text-sm mb-2 text-center">
        {work.description}
      </p>
      <div className="flex items-center">
        <p className="text-primary text-sm mb-6 mr-5">
          Watch Duration:{" "}
          {work.duration >= 60
            ? `${(work.duration / 60).toFixed(2)} min`
            : `${work.duration} sec`}
        </p>
        <p className="text-red-500 text-sm mb-6">Earning: {work.price} ৳</p>
      </div>

      <div ref={containerRef} className="w-full max-w-[560px] mb-6" />

      {work.questions.length !== ans.length ? (
        <div className="w-full max-w-xl">
          <p className="mb-2 text-gray-700 font-medium select-none">
            Question {prase + 1}: {work.questions[prase]}
          </p>
          {isPlaying && (
            <Input.TextArea
              rows={4}
              value={text}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here"
            />
          )}
        </div>
      ) : (
        <p className="text-green-600 font-semibold text-center my-4">
          🎉 You have completed all questions!
        </p>
      )}
      <Progress
        percent={((playTime / work.duration) * 100).toFixed(0)}
        size="small"
        status="active"
      />
      <div className="flex items-center gap-x-5">
        <button
          onClick={handlePlay}
          className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ▶️ Play Video
        </button>
        {work.duration <= playTime && (
          <button
            onClick={onSubmit}
            className="mt-6 px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkDetails;
