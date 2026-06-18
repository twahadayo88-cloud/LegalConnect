const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// UPLOAD DOCUMENT
router.post("/upload", upload.single("document"), async (req, res) => {
  const { caseId, userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO documents (case_id, uploaded_by, file_name, file_path, file_type)
       VALUES (?, ?, ?, ?, ?)`,
      [caseId, userId, file.originalname, file.path, file.mimetype]
    );

    res.status(201).json({
      message: "Document uploaded successfully",
      documentId: result.insertId,
      document: {
        id: result.insertId,
        file_name: file.originalname,
        file_path: file.path,
        file_type: file.mimetype,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload document to database" });
  }
});

// GET DOCUMENTS BY CASE
router.get("/case/:caseId", async (req, res) => {
  try {
    const [documents] = await db.query(
      `SELECT d.*, u.name as uploaded_by_name
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.case_id = ?
       ORDER BY d.created_at DESC`,
      [req.params.caseId]
    );

    res.json({ documents });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// DELETE DOCUMENT
router.delete("/:documentId", async (req, res) => {
  try {
    await db.query(`DELETE FROM documents WHERE id = ?`, [req.params.documentId]);
    res.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

module.exports = router;