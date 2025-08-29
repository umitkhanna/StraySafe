const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    // include hidden passwordHash for verification
    const user = await User.findOne({ email, isActive: true }).select(
      "+passwordHash"
    );
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // return safe user + token
    const safe = user.toJSON(); // strips passwordHash
    res.json({ token, user: safe });
  }
);

// GET /api/auth/me
router.get("/me", auth(true), async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    if (!me) return res.status(404).json({ error: "Not found" });
    res.json(me);
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

/**
 * POST /api/auth/impersonate
 * Allows admins to impersonate other users
 * body: { userId }
 */
router.post(
  "/impersonate",
  [
    auth(true),
    requireRole("admin"),
    body("userId").isMongoId().withMessage("Valid user ID required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { userId } = req.body;
      
      // Get the user to impersonate
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!targetUser.isActive) {
        return res.status(400).json({ error: "Cannot impersonate inactive user" });
      }

      // Create a new token for the target user with impersonation info
      const token = jwt.sign(
        { 
          id: targetUser._id.toString(), 
          role: targetUser.role, 
          email: targetUser.email,
          impersonatedBy: req.user.id, // Track who is doing the impersonation
          isImpersonating: true
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Return the token and target user info
      res.json({ 
        token, 
        user: targetUser.toJSON(),
        impersonatedBy: req.user.id,
        isImpersonating: true
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  }
);

/**
 * POST /api/auth/stop-impersonating
 * Allows user to stop impersonating and return to original account
 */
router.post("/stop-impersonating", auth(true), async (req, res) => {
  try {
    // Check if user is currently impersonating
    if (!req.user.isImpersonating || !req.user.impersonatedBy) {
      return res.status(400).json({ error: "Not currently impersonating" });
    }

    // Get the original admin user
    const originalUser = await User.findById(req.user.impersonatedBy);
    if (!originalUser) {
      return res.status(404).json({ error: "Original user not found" });
    }

    // Create a new token for the original user
    const token = jwt.sign(
      { 
        id: originalUser._id.toString(), 
        role: originalUser.role, 
        email: originalUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Return the original user's token
    res.json({ 
      token, 
      user: originalUser.toJSON(),
      isImpersonating: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

module.exports = router;
