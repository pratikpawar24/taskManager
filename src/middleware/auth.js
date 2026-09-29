const jwt = require("jsonwebtoken");
const db = require("../db/database");

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required. Use a Bearer token." });
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").get(payload.userId);
    if (!user) return res.status(401).json({ success: false, message: "User associated with token no longer exists." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token." });
  }
}

module.exports = { authenticateToken };
