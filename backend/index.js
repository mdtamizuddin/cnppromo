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

const app = express();
const port = process.env.PORT || 4000;

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
  transports: ['websocket'],
});

instrument(io, {
  auth: false,
  namespaceName: '/admin',
  namespacePath: '/socket.io',
});

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
    const total_withdraw = await Withdraw.find({ status: "completed" });
    const totalAmmount = total_withdraw
      .map((withdraw) => withdraw.amount)
      .reduce((a, b) => a + b, 0);
    res.send({
      total: 32000 + total,
      active: 30001 + active,
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
const connectedSockets = new Map();
const sendToSpecificUser = (socketId, data, funname) => {
  if (connectedSockets.has(socketId)) {
    const socket2 = connectedSockets.get(socketId);
    socket2.emit(funname, data);
  }
};

io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.query.user;
    if (!userId) {
      return next(new Error("Authentication error: Missing user ID"));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user;
    socket.id = userId;
    next();
  } catch (error) {
    next(error);
  }
});

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

io.on("connection", (socket) => {
  const userId = socket.handshake.query.user;
  socket.id = userId;
  connectedSockets.set(socket.id, socket);
  statusUpdater(userId, true);

  socket.on("message", async (data) => {
    try {
      if (!data || !data.chat || !data.receiver || !data.sender) {
        return socket.emit("message:error", {
          error: "chat, receiver and sender are required",
        });
      }
      const result = await createMessage(data);

      sendToSpecificUser(data.receiver, result, "message");
      sendToSpecificUser(data.sender, result, "message");
    } catch (error) {
      console.error("socket message handler error:", error.message);
      socket.emit("message:error", { error: error.message || "Message failed" });
    }
  });

  socket.on('seen', async (data) => {
    try {
      if (!data?._id) return;
      const result = await Message.findByIdAndUpdate(data._id, {
        seen: true
      }, {
        new: true
      });
      sendToSpecificUser(data.sender, result, "seen");
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
      sendToSpecificUser(chat.owner, { message: "seen" }, "seen");
      sendToSpecificUser(chat.user, { message: "seen" }, "seen");
    } catch (error) {
      console.error("socket seenOnly handler error:", error.message);
      socket.emit("seen:error", { error: error.message || "Seen failed" });
    }
  });

  socket.on("disconnect", () => {
    statusUpdater(userId, false);
    connectedSockets.delete(userId);
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
