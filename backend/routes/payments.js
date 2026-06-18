const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET PAYMENTS
router.get("/", async (req, res) => {
  const { userId, role } = req.query;
  const field = role === 'client' ? 'client_id' : 'lawyer_id';

  try {
    const [payments] = await db.query(
      `SELECT p.*, u.name as ${role === 'client' ? 'lawyer_name' : 'client_name'}
       FROM payments p
       JOIN users u ON p.${role === 'client' ? 'lawyer_id' : 'client_id'} = u.id
       WHERE p.${field} = ?
       ORDER BY p.payment_date DESC`,
      [userId]
    );

    res.json({ payments });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

module.exports = router;
