const express = require("express");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/stats", auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total tickets
    const totalTickets = await Ticket.countDocuments();
    
    // Get user's tickets
    const myTickets = await Ticket.countDocuments({ reportedBy: userId });
    
    // Get resolved tickets
    const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });
    
    // Get pending tickets
    const pendingTickets = await Ticket.countDocuments({ 
      status: { $in: ["open", "in_progress"] } 
    });
    
    // Get recent tickets (last 5)
    const recentTickets = await Ticket.find()
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      totalTickets,
      myTickets,
      resolvedTickets,
      pendingTickets,
      recentTickets
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
