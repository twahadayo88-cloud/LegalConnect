const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE CONSULTATION
router.post("/create", async (req, res) => {
  const { clientId, lawyerId, caseId, consultationType, scheduledDate, duration, fee } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO consultations (client_id, lawyer_id, case_id, consultation_type, scheduled_date, duration, fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [clientId, lawyerId, caseId || null, consultationType, scheduledDate, duration || 30, fee]
    );

    res.status(201).json({ message: "Consultation scheduled", consultationId: result.insertId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to schedule consultation" });
  }
});

// GET CONSULTATIONS
router.get("/", async (req, res) => {
  const { userId, role } = req.query;
  const roleField = role === 'client' ? 'client_id' : 'lawyer_id';

  try {
    const [consultations] = await db.query(
      `SELECT c.*, client.name as client_name, lawyer.name as lawyer_name
       FROM consultations c
       JOIN users client ON c.client_id = client.id
       JOIN users lawyer ON c.lawyer_id = lawyer.id
       WHERE c.${roleField} = ?
       ORDER BY c.scheduled_date DESC`,
      [userId]
    );

    res.json({ consultations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch consultations" });
  }
});

// UPDATE CONSULTATION
router.put("/:consultationId", async (req, res) => {
  const { status, notes } = req.body;

  try {
    await db.query(
      `UPDATE consultations SET status = ?, notes = ? WHERE id = ?`,
      [status, notes, req.params.consultationId]
    );

    res.json({ message: "Consultation updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update consultation" });
  }
});

module.exports = router;
