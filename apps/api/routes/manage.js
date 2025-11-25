const express = require("express");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/manage/stats - Get management statistics (for ground staff and admin)
router.get("/stats", auth(), async (req, res) => {
  try {
    // Check if user has management privileges
    if (!["groundstaff", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total tickets
    const totalTickets = await Ticket.countDocuments();
    
    // Get pending tickets
    const pendingTickets = await Ticket.countDocuments({ 
      status: { $in: ["open", "in_progress"] } 
    });
    
    // Get resolved tickets
    const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });
    
    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")
      .lean();

    res.json({
      totalUsers,
      totalTickets,
      pendingTickets,
      resolvedTickets,
      recentUsers
    });
  } catch (error) {
    console.error("Manage stats error:", error);
    res.status(500).json({ error: "Failed to fetch management stats" });
  }
});

module.exports = router;
