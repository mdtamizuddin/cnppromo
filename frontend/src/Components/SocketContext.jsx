import React, { createContext, useContext, useState, useRef } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Cookie from "js-cookie";
import { socketUrl } from "../util/axios";
import addNotification from "react-push-notification";

// Create the context
const SocketContext = createContext();

// Create a provider component
export const SocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Held in a ref: building an Audio element in the render body allocated a fresh
  // decoder on every render of a provider that wraps the whole app.
  const soundRef = useRef(null);
  const playChime = () => {
    if (!soundRef.current) soundRef.current = new Audio("/norification.wav");
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(() => {
      // Browsers reject playback until the user has interacted with the page.
    });
  };

  useEffect(() => {
    const token = Cookie.get("token-you");
    if (user?._id && token) {
      const newSocket = io(socketUrl, {
        // The handshake is authenticated by this token, not by the user id.
        auth: { token },
        perMessageDeflate: false, // Disable WebSocket compression
        transports: ["websocket", "polling"],
        autoConnect: false,
      });
      setSocket(newSocket);
      newSocket.connect();
      newSocket.on("connect", () => {
        setIsConnected(true);
      });
      newSocket.on("disconnect", () => {
        setIsConnected(false);
      });
      return () => {
        newSocket.off("connect");
        newSocket.off("disconnect");
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (data) => {
        setMessage(data);
        if (data?.receiver === user?._id) {
          playChime();
          addNotification({
            title: "You have a new message",
            message: data.message || "...",
            theme: "darkblue",
            native: true, // when using native, your OS will handle theming.
          });
        }
      };

      socket.on("message", handleMessage);

      // Cleanup
      return () => {
        socket.off("message", handleMessage);
      };
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        message,
        connected: isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
