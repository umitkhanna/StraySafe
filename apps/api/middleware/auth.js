const jwt = require("jsonwebtoken");

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: "Missing token" });
      req.user = null;
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // { id, role, email }
      next();
    } catch (err) {
      if (required) return res.status(401).json({ error: "Invalid or expired token" });
      req.user = null;
      next();
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());
    if (!allowedRoles.includes(userRole)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { auth, requireRole };
