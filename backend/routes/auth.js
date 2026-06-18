const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      `INSERT INTO users (name, email, password, role, is_verified, status) 
       VALUES (?, ?, ?, ?, TRUE, 'active')`,
      [name, email, hashedPassword, role]
    );

    if (role === "lawyer") {
      await connection.query(
        `INSERT INTO lawyer_profiles (user_id, specialization) VALUES (?, ?)`,
        [result.insertId, specialization || "General Practice"]
      );
    }

    await connection.commit();
    connection.release();

    res.status(200).json({ msg: "Account created successfully!", userId: result.insertId });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Signup error:", error);
    res.status(500).json({ msg: "Server error during signup" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ msg: "Account inactive" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      role: user.role,
      name: user.name
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// GET USER INFO
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ msg: "User not found" });
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
