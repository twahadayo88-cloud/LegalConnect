const express = require("express");
const router = express.Router();
const db = require("../config/db");

// CREATE CASE
router.post("/create", async (req, res) => {
  const { clientId, lawyerId, title, description, caseType, priority, budget } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO cases (client_id, lawyer_id, title, description, case_type, priority, budget, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [clientId, lawyerId || null, title, description, caseType, priority || 'medium', budget || null]
    );

    res.status(201).json({ message: "Case created", caseId: result.insertId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create case" });
  }
});

// GET ALL CASES
router.get("/", async (req, res) => {
  const { userId, role } = req.query;
  const roleField = role === 'client' ? 'client_id' : 'lawyer_id';

  try {
    const [cases] = await db.query(
      `SELECT c.*, client.name as client_name, lawyer.name as lawyer_name
       FROM cases c
       JOIN users client ON c.client_id = client.id
       LEFT JOIN users lawyer ON c.lawyer_id = lawyer.id
       WHERE c.${roleField} = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json({ cases });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// GET SINGLE CASE
router.get("/:caseId", async (req, res) => {
  try {
    const [caseData] = await db.query(
      `SELECT c.*, client.name as client_name, lawyer.name as lawyer_name
       FROM cases c
       JOIN users client ON c.client_id = client.id
       LEFT JOIN users lawyer ON c.lawyer_id = lawyer.id
       WHERE c.id = ?`,
      [req.params.caseId]
    );

    if (!caseData || caseData.length === 0) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json({ case: caseData[0] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch case" });
  }
});

// UPDATE CASE
router.put("/:caseId", async (req, res) => {
  const { status, priority, description } = req.body;

  try {
    await db.query(
      `UPDATE cases SET status = ?, priority = ?, description = ? WHERE id = ?`,
      [status, priority, description, req.params.caseId]
    );

    res.json({ message: "Case updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update case" });
  }
});

module.exports = router;
