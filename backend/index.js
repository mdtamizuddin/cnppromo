const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./util/mongodb");
const getSetting = require("./Routes/Settings/getSetting");
const authChecker = require("./util/authChecker");
const roleChecker = require("./util/roleChecker");
const updateSetting = require("./Routes/Settings/updateSetting");
const User = require("./Routes/User/user.model");
const Withdraw = require("./Routes/WithDraw/withdraw.model");
const Message = require("./Routes/message/message.model");
const { createMessage } = require("./Routes/message/message.service");
const Chat = require("./Routes/message/chat.model");
const Refer = require("./Routes/Refer/refer.model");
const { instrument } = require("@socket.io/admin-ui");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = require("./util/jwtSecret");
const sessionService = require("./Routes/Session/session.service");

const app = express();
const port = process.env.PORT || 4000;

// Behind a reverse proxy, req.ip is the proxy's address unless Express is told
// to read X-Forwarded-For. Without this every login session records the same IP
// and the rate limiters bucket the whole internet together.
app.set("trust proxy", 1);

// Safety net: never let an unhandled rejection take down the whole server
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

require("./tracing");

// Create HTTP server for Socket.IO
const server = createServer(app);

const allowedOrigins = [
  "http://localhost:4321",
  "http://localhost:4000",
  "https://cnppromo.vercel.app",
  "https://admin.socket.io",
  "https://www.cnppromo.com",
  "https://cnppromo.com",
  "https://cnppromo-ba4cdajay-tamizs-projects.vercel.app"
];
const redirectUrl = "https://cnppromo.com";

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Origin ${origin} is not allowed by Socket.IO CORS`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ['websocket', 'polling'],
});

// The Socket.IO Admin UI exposes every live socket, room and user. It is only
// mounted outside production, and only when an explicit password is configured.
if (process.env.NODE_ENV !== "production" && process.env.SOCKET_ADMIN_PASSWORD) {
  instrument(io, {
    auth: {
      type: "basic",
      username: process.env.SOCKET_ADMIN_USERNAME || "admin",
      // bcrypt hash of SOCKET_ADMIN_PASSWORD
      password: bcrypt.hashSync(process.env.SOCKET_ADMIN_PASSWORD, 10),
    },
    namespaceName: '/admin',
    namespacePath: '/socket.io',
    mode: "development",
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// 🛡️ Security Headers via Helmet (with cross-origin policy allowing S3/media assets)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Managed by client hosting
}));

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 🛡️ NoSQL Injection Sanitization Middleware
const sanitizeNoSql = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeNoSql(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
});

// 🛡️ Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 auth requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." }
});

app.use("/api/v1/", generalLimiter);
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/pass-less", authLimiter);
app.use("/api/v1/user/send-link", authLimiter);

// Redirect Unauthorized Origins for browser requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`Redirecting unauthorized origin: ${origin}`);
    if (!req.xhr && req.accepts("html")) {
      return res.redirect(307, redirectUrl);
    } else {
      return res.status(403).json({ error: "CORS Policy Blocked This Request" });
    }
  }

  next();
});

// Connect MongoDB
connectDB();

// Routes
app.use("/api/v1", require("./Routes/index"));

app.get("/", (req, res) => {
  res.send({
    message: "Server Is Running",
  });
});

// Get site settings
app.get("/api/v1/setting", async (req, res) => {
  try {
    const response = await getSetting();
    res.send(response);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// Statistics route
app.get("/api/v1/statistic", async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ status: "active" });
    const pending = await User.countDocuments({ status: "pending" });
    const blocked = await User.countDocuments({ lock: true });
    const [withdrawSum] = await Withdraw.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalAmmount = withdrawSum?.total || 0;
    res.send({
      total: 72000 + total,
      active: 72000 + active,
      pending,
      blocked,
      total_withdraw: totalAmmount,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// Update settings (Admin only)
app.put("/api/v1/setting", authChecker, roleChecker(['admin']), async (req, res) => {
  try {
    const response = await updateSetting(req.body);
    res.send(response);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

app.get("/files/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "files", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found.");
    }
  });
});

// Socket.IO Connection and Chat Handling
// Every socket joins a room named after its user id. A Map holding one socket per
// user meant a second tab silently evicted the first, which then stopped receiving
// anything; a room fans out to every live connection that user has.
const sendToSpecificUser = (userId, data, funname) => {
  if (!userId) return;
  io.to(String(userId)).emit(funname, data);
};

// Socket handshakes must carry the same bearer token the REST API uses.
// Trusting a plain `query.user` id would let any client connect as any account.
io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      (typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return next(new Error("Authentication error: Missing token"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }

    // A revoked device must lose its live socket as well as its REST access.
    if (decoded.jti) {
      const session = await sessionService.loadLiveSession(decoded.jti);
      if (!session || String(session.user) !== String(decoded.id)) {
        return next(new Error("Authentication error: Session ended"));
      }
      socket.data.sessionId = String(session._id);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Disconnects the live sockets belonging to sessions that were just revoked.
 *
 * Exposed on the app so the session routes can reach it without importing the
 * Socket.IO server (which would be a cycle: index -> routes -> index).
 */
const endSessions = async (sessionIds, userId) => {
  try {
    const doomed = new Set(sessionIds.map(String));
    const sockets = await io.in(String(userId)).fetchSockets();
    for (const s of sockets) {
      if (s.data?.sessionId && doomed.has(s.data.sessionId)) {
        s.emit("session:revoked");
        s.disconnect(true);
      }
    }
  } catch (error) {
    console.error("endSessions error:", error.message);
  }
};
app.set("endSessions", endSessions);

const statusUpdater = async (socketId, status) => {
  try {
    await User.findByIdAndUpdate(
      socketId,
      { active: status, lastActive: Date.now() },
      { new: true }
    );
  } catch (error) {
    console.error("statusUpdater error:", error.message);
  }
};

io.on("connection", async (socket) => {
  const userId = socket.userId;
  socket.join(userId);

  try {
    const sockets = await io.in(userId).fetchSockets();
    if (sockets.length === 1) {
      statusUpdater(userId, true);
      io.emit("user:presence", { userId, active: true });
    }
  } catch (err) {
    console.error("Presence check error:", err.message);
  }

  socket.on("message", async (data) => {
    try {
      if (!data || !data.chat || !data.receiver) {
        return socket.emit("message:error", {
          error: "chat and receiver are required",
        });
      }
      // The sender is whoever the handshake authenticated, never whatever the
      // payload claims — otherwise anyone could post as another user.
      const result = await createMessage({ ...data, sender: userId });

      sendToSpecificUser(data.receiver, result, "message");
      sendToSpecificUser(userId, result, "message");
    } catch (error) {
      console.error("socket message handler error:", error.message);
      socket.emit("message:error", { error: error.message || "Message failed" });
    }
  });

  socket.on('seen', async (data) => {
    try {
      if (!data?._id) return;
      // Scope the update to the recipient so a socket cannot mark other
      // people's conversations as read.
      const result = await Message.findOneAndUpdate({
        _id: data._id,
        receiver: userId
      }, {
        seen: true
      }, {
        new: true
      });
      if (!result) return;
      sendToSpecificUser(result.sender?.toString(), result, "seen");
    } catch (error) {
      console.error("socket seen handler error:", error.message);
      socket.emit("seen:error", { error: error.message || "Seen failed" });
    }
  });

  socket.on('seenOnly', async (id) => {
    try {
      const chat = await Chat.findById(id);
      if (!chat) {
        return socket.emit("seen:error", { error: "Chat not found" });
      }
      if (chat.owner?.toString() !== userId && chat.user?.toString() !== userId) {
        return socket.emit("seen:error", { error: "Not a participant of this chat" });
      }
      sendToSpecificUser(chat.owner?.toString(), { message: "seen" }, "seen");
      sendToSpecificUser(chat.user?.toString(), { message: "seen" }, "seen");
    } catch (error) {
      console.error("socket seenOnly handler error:", error.message);
      socket.emit("seen:error", { error: error.message || "Seen failed" });
    }
  });

  // Fast in-memory typing relay without querying MongoDB
  socket.on("typing", async (data) => {
    try {
      const receiver = data?.receiver;
      if (receiver) {
        sendToSpecificUser(String(receiver), { from: userId, stop: !!data.stop }, "typing");
        return;
      }
      // Fallback only if receiver was omitted
      if (!data?.chat) return;
      const chat = await Chat.findById(data.chat);
      if (!chat) return;
      if (chat.owner?.toString() !== userId && chat.user?.toString() !== userId) return;

      const other =
        chat.owner?.toString() === userId
          ? chat.user?.toString()
          : chat.owner?.toString();

      sendToSpecificUser(other, { from: userId, stop: !!data.stop }, "typing");
    } catch (error) {
      console.error("socket typing handler error:", error.message);
    }
  });

  socket.on("disconnect", async () => {
    try {
      // Only go offline once the user's last connection is gone — closing one of
      // several open tabs must not mark a still-connected user away.
      const remaining = await io.in(userId).fetchSockets();
      if (remaining.length === 0) {
        statusUpdater(userId, false);
        io.emit("user:presence", { userId, active: false });
      }
    } catch (error) {
      console.error("socket disconnect handler error:", error.message);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : (err.message || "Internal Server Error")
  });
});

// Start the server
server.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
);
