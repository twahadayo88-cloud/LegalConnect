const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE REVIEW
router.post("/create", async (req, res) => {
  const { lawyerId, clientId, caseId, rating, reviewText } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO reviews (lawyer_id, client_id, case_id, rating, review_text)
       VALUES (?, ?, ?, ?, ?)`,
      [lawyerId, clientId, caseId || null, rating, reviewText]
    );

    // Update lawyer rating
    await db.query(
      `UPDATE lawyer_profiles 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE lawyer_id = ?),
           total_reviews = (SELECT COUNT(*) FROM reviews WHERE lawyer_id = ?)
       WHERE user_id = ?`,
      [lawyerId, lawyerId, lawyerId]
    );

    res.status(201).json({ message: "Review submitted", reviewId: result.insertId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// GET REVIEWS
router.get("/lawyer/:lawyerId", async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name as client_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.lawyer_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.lawyerId]
    );

    res.json({ reviews });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
