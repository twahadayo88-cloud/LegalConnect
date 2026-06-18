const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET NOTIFICATIONS
router.get("/:userId", async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.params.userId]
    );

    res.json({ notifications });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// MARK AS READ
router.put("/:notificationId/read", async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
      [req.params.notificationId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

module.exports = router;
