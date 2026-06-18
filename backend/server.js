const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();
const server = http.createServer(app);

// Socket.IO for real-time messaging
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // Your React frontend URL
    methods: ["GET", "POST"]
  }
});

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting to prevent brute-force attacks and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use("/api/", limiter); // Apply rate limiter only to API routes

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Database connection
const db = require("./config/db");

// ===========================
// ROUTES
// ===========================

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// Case routes
app.use("/api/cases", require("./routes/cases"));

// Consultation routes
app.use("/api/consultations", require("./routes/consultations"));

// Message routes
app.use("/api/messages", require("./routes/messages"));

// Lawyer routes
app.use("/api/lawyers", require("./routes/lawyers"));

// Review routes
app.use("/api/reviews", require("./routes/reviews"));

// Payment routes
app.use("/api/payments", require("./routes/payments"));

// Notification routes
app.use("/api/notifications", require("./routes/notifications"));

// Q&A routes
app.use("/api/qa", require("./routes/qa"));

// Document routes
app.use("/api/documents", require("./routes/documents"));

// Dashboard stats routes
app.use("/api/stats", require("./routes/stats"));

// AI Assessor routes
app.use("/api/ai", require("./routes/ai"));

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to LegalConnect API!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      cases: "/api/cases",
      consultations: "/api/consultations",
      messages: "/api/messages",
      lawyers: "/api/lawyers",
      reviews: "/api/reviews",
      payments: "/api/payments",
      notifications: "/api/notifications",
      qa: "/api/qa",
      documents: "/api/documents",
      stats: "/api/stats",
      ai: "/api/ai"
    }
  });
});

// ===========================
// SOCKET.IO - REAL-TIME MESSAGING
// ===========================

const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user_connected", (userId) => {
    activeUsers.set(userId, socket.id);
    socket.broadcast.emit("user_online", userId);
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, message, caseId } = data;
    try {
      const result = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, message, case_id, message_type, file_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [senderId, receiverId, message || "", caseId || null, data.type || 'text', data.fileUrl || null]
      );

      const messageData = {
        id: result[0].insertId,
        senderId,
        receiverId,
        message: message || "",
        caseId,
        type: data.type || 'text',
        fileUrl: data.fileUrl || null,
        timestamp: new Date(),
        isRead: false
      };

      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("receive_message", messageData);

      socket.emit("message_sent", messageData);

      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
        [receiverId, "New Message", `You have a new message from user ${senderId}`, "message", `/messages/${senderId}`]
      );

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("typing", (data) => {
    const { receiverId, senderId, isTyping } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("user_typing", { senderId, isTyping });
  });

  // WebRTC Signaling
  socket.on("call_user", (data) => {
    const { receiverId, callerId, callerName, callType, signalData } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming_call", {
        callerId,
        callerName,
        callType,
        signalData
      });
    }
  });

  socket.on("call_accepted", (data) => {
    const { callerId, signalData } = data;
    const callerSocketId = activeUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call_accepted", { signalData });
    }
  });

  socket.on("call_rejected", (data) => {
    const { callerId } = data;
    const callerSocketId = activeUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call_rejected");
    }
  });

  socket.on("ice_candidate", (data) => {
    const { receiverId, candidate } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice_candidate", { candidate });
    }
  });

  socket.on("end_call", (data) => {
    const { receiverId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call_ended");
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        socket.broadcast.emit("user_offline", userId);
        break;
      }
    }
  });
});

// ===========================
// ERROR HANDLING
// ===========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ===========================
// START SERVER
// ===========================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 LegalConnect Server Started");
  console.log("=".repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready for real-time messaging`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
  console.log("=".repeat(50));
  console.log("Waiting for database connection...");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    db.end();
    process.exit(0);
  });
});

module.exports = { app, io };
