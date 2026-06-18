const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL LAWYERS
router.get("/", async (req, res) => {
  const { specialization, minRating, search } = req.query;

  try {
    let query = `
      SELECT u.id, u.name, u.email, u.bio, u.is_verified, 
             COALESCE(lp.specialization, 'General Practice') as specialization, 
             COALESCE(lp.years_of_experience, 0) as years_of_experience, 
             COALESCE(lp.consultation_fee, 0) as consultation_fee,
             COALESCE(lp.rating, 5.0) as rating, 
             COALESCE(lp.total_reviews, 0) as total_reviews
      FROM users u
      LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
      WHERE u.role = 'lawyer' AND u.status = 'active'
    `;

    const params = [];

    if (specialization) {
      query += ` AND lp.specialization = ?`;
      params.push(specialization);
    }

    if (minRating) {
      query += ` AND lp.rating >= ?`;
      params.push(parseFloat(minRating));
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.bio LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY lp.rating DESC`;

    const [lawyers] = await db.query(query, params);

    res.json({ lawyers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

// GET LAWYER PROFILE
router.get("/:lawyerId", async (req, res) => {
  try {
    const [lawyer] = await db.query(
      `SELECT u.*, lp.* FROM users u
       JOIN lawyer_profiles lp ON u.id = lp.user_id
       WHERE u.id = ?`,
      [req.params.lawyerId]
    );

    if (!lawyer || lawyer.length === 0) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    const [reviews] = await db.query(
      `SELECT r.*, u.name as client_name
       FROM reviews r
       JOIN users u ON r.client_id = u.id
       WHERE r.lawyer_id = ?
       ORDER BY r.created_at DESC LIMIT 5`,
      [req.params.lawyerId]
    );

    res.json({ lawyer: lawyer[0], reviews });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch lawyer profile" });
  }
});

module.exports = router;
