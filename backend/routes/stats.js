const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CLIENT STATS
router.get("/client/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const [activeCases] = await db.query(
      `SELECT COUNT(*) as count FROM cases WHERE client_id = ? AND status IN ('pending', 'active')`,
      [clientId]
    );

    const [consultations] = await db.query(
      `SELECT COUNT(*) as count FROM consultations WHERE client_id = ? AND status IN ('scheduled', 'confirmed')`,
      [clientId]
    );

    const [lawyersHired] = await db.query(
      `SELECT COUNT(DISTINCT lawyer_id) as count FROM cases WHERE client_id = ? AND lawyer_id IS NOT NULL`,
      [clientId]
    );

    const [unreadMessages] = await db.query(
      `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE`,
      [clientId]
    );

    const [recentCases] = await db.query(
      `SELECT c.*, u.name as lawyer_name FROM cases c 
       LEFT JOIN users u ON c.lawyer_id = u.id
       WHERE c.client_id = ? ORDER BY c.created_at DESC LIMIT 5`,
      [clientId]
    );

    const [upcomingConsultations] = await db.query(
      `SELECT c.*, u.name as lawyer_name FROM consultations c 
       JOIN users u ON c.lawyer_id = u.id
       WHERE c.client_id = ? AND c.scheduled_date >= NOW()
       AND c.status IN ('scheduled', 'confirmed')
       ORDER BY c.scheduled_date ASC LIMIT 5`,
      [clientId]
    );

    res.json({
      stats: {
        activeCases: activeCases[0].count,
        consultations: consultations[0].count,
        lawyersHired: lawyersHired[0].count,
        unreadMessages: unreadMessages[0].count
      },
      recentCases,
      upcomingConsultations
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// LAWYER STATS
router.get("/lawyer/:lawyerId", async (req, res) => {
  const { lawyerId } = req.params;

  try {
    const [totalClients] = await db.query(
      `SELECT COUNT(DISTINCT client_id) as count FROM cases WHERE lawyer_id = ?`,
      [lawyerId]
    );

    const [activeCases] = await db.query(
      `SELECT COUNT(*) as count FROM cases WHERE lawyer_id = ? AND status = 'active'`,
      [lawyerId]
    );

    const [todayConsultations] = await db.query(
      `SELECT COUNT(*) as count FROM consultations 
       WHERE lawyer_id = ? AND DATE(scheduled_date) = CURDATE()
       AND status IN ('scheduled', 'confirmed')`,
      [lawyerId]
    );

    const [unreadMessages] = await db.query(
      `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE`,
      [lawyerId]
    );

    const [recentCases] = await db.query(
      `SELECT c.*, u.name as client_name FROM cases c 
       JOIN users u ON c.client_id = u.id
       WHERE c.lawyer_id = ? ORDER BY c.created_at DESC LIMIT 5`,
      [lawyerId]
    );

    res.json({
      stats: {
        totalClients: totalClients[0].count,
        activeCases: activeCases[0].count,
        todayConsultations: todayConsultations[0].count,
        unreadMessages: unreadMessages[0].count
      },
      recentCases
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// LAWYER CLIENTS LIST
router.get("/lawyer/:lawyerId/clients", async (req, res) => {
  const { lawyerId } = req.params;
  try {
    const [clients] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email, 
       (SELECT COUNT(*) FROM cases WHERE client_id = u.id AND lawyer_id = ?) as case_count
       FROM users u
       WHERE u.role = 'client' AND u.id IN (
         SELECT client_id FROM cases WHERE lawyer_id = ?
         UNION
         SELECT client_id FROM consultations WHERE lawyer_id = ?
       )`,
      [lawyerId, lawyerId, lawyerId]
    );
    res.json({ clients });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

module.exports = router;
