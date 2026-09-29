const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");
const { registerSchema, loginSchema, parse } = require("../utils/validation");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
function createToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
}

router.post("/register", async (req, res, next) => {
  try {
    const validation = parse(registerSchema, req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: "Validation failed.", errors: validation.errors });
    const { name, email, password } = validation.data;
    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)").run(name, email, passwordHash);
    const user = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: "Registration successful.", data: { user, token: createToken(user) } });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const validation = parse(loginSchema, req.body);
    if (!validation.ok) return res.status(400).json({ success: false, message: "Validation failed.", errors: validation.errors });
    const { email, password } = validation.data;
    const record = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!record || !(await bcrypt.compare(password, record.password_hash))) return res.status(401).json({ success: false, message: "Invalid email or password." });
    const user = { id: record.id, name: record.name, email: record.email, created_at: record.created_at };
    return res.status(200).json({ success: true, message: "Login successful.", data: { user, token: createToken(user) } });
  } catch (error) { next(error); }
});

router.get("/me", authenticateToken, (req, res) => res.status(200).json({ success: true, data: { user: req.user } }));
module.exports = router;
