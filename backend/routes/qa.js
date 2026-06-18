const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET QUESTIONS
router.get("/questions", async (req, res) => {
  try {
    const [questions] = await db.query(
      `SELECT q.*, u.name as client_name
       FROM questions q
       JOIN users u ON q.client_id = u.id
       ORDER BY q.created_at DESC
       LIMIT 20`
    );

    res.json({ questions });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET ANSWERS
router.get("/question/:questionId/answers", async (req, res) => {
  try {
    const [answers] = await db.query(
      `SELECT a.*, u.name as lawyer_name
       FROM answers a
       JOIN users u ON a.lawyer_id = u.id
       WHERE a.question_id = ?
       ORDER BY a.helpful_count DESC`,
      [req.params.questionId]
    );

    res.json({ answers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

module.exports = router;