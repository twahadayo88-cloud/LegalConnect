const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = "uploads/";
    if (file.fieldname === "audio") dir += "voice";
    else dir += "files";

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext || (file.fieldname === 'audio' ? '.webm' : '')}`);
  }
});

const upload = multer({ storage });

// GET CONVERSATIONS
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT DISTINCT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as id,
        u.name as name,
        u.role as role,
        (SELECT message FROM messages 
         WHERE (sender_id = ? AND receiver_id = id)
            OR (sender_id = id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = id)
            OR (sender_id = id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT message_type FROM messages 
         WHERE (sender_id = ? AND receiver_id = id)
            OR (sender_id = id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_type,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `;

    const [conversations] = await db.query(query, [
      userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET MESSAGES
router.get("/history/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const [messages] = await db.query(
      `SELECT m.*, sender.name as sender_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, contactId, contactId, userId]
    );

    // Update unread status
    await db.query(
      `UPDATE messages SET is_read = TRUE 
       WHERE sender_id = ? AND receiver_id = ?`,
      [contactId, userId]
    );

    res.json({ messages });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// SEND MESSAGE
router.post("/send", async (req, res) => {
  const { senderId, receiverId, message, caseId } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message, case_id, message_type, file_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [senderId, receiverId, message || "", caseId || null, req.body.type || "text", req.body.fileUrl || null]
    );

    res.status(201).json({ message: "Message sent", messageId: result.insertId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// UPLOAD VOICE MESSAGE
router.post("/upload-voice", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/voice/${req.file.filename}`;
  res.json({ fileUrl });
});

// UPLOAD GENERAL FILE/IMAGE
router.post("/upload-file", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/files/${req.file.filename}`;
  res.json({ fileUrl, originalName: req.file.originalname, type: req.file.mimetype });
});

module.exports = router;
