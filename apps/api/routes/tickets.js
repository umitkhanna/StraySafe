const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Ticket = require("../models/Ticket");
const { auth, requireRole } = require("../middleware/auth");
const router = express.Router();

/**
 * GET /api/tickets
 * Get tickets with filtering and pagination
 */
router.get(
  "/",
  [
    auth(true),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["open", "inProgress", "resolved", "closed"]),
    query("type").optional().isIn(["dogBite", "dogChasing", "aggressiveDog", "strayDogFeeding", "dogInDistress", "other"]),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
    query("assignedTo").optional().isMongoId(),
    query("reportedBy").optional().isMongoId()
  ],
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      
      // Role-based filtering
      const userRole = req.user.role.toLowerCase();
      if (userRole === 'operators' || userRole === 'groundstaff') {
        // Operators and ground staff can only see tickets assigned to them or unassigned tickets in their area
        filter.$or = [
          { assignedTo: req.user.id },
          { assignedTo: null }
        ];
      } else if (userRole === 'ngoadmin' || userRole === 'municipalityadmin') {
        // NGO/Municipality admins can see tickets from their team members
        // This would need additional logic to get team members, for now just their own
        filter.assignedTo = req.user.id;
      }
      // Admins can see all tickets (no additional filter)

      // Apply query filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
      if (req.query.reportedBy) filter.reportedBy = req.query.reportedBy;

      const tickets = await Ticket.find(filter)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Ticket.countDocuments(filter);

      res.json({
        tickets,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch tickets" });
    }
  }
);

/**
 * GET /api/tickets/:id
 * Get single ticket by ID
 */
router.get(
  "/:id",
  [auth(true)],
  async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.id)
        .populate('reportedBy', 'name email role phoneNumber')
        .populate('assignedTo', 'name email role')
        .populate('resolvedBy', 'name email');

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check if user has permission to view this ticket
      const userRole = req.user.role.toLowerCase();
      if (userRole === 'operators' || userRole === 'groundstaff') {
        if (ticket.assignedTo && ticket.assignedTo._id.toString() !== req.user.id && !ticket.assignedTo === null) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch ticket" });
    }
  }
);

/**
 * POST /api/tickets
 * Create new ticket (for users and high-risk users)
 */
router.post(
  "/",
  [
    auth(true),
    body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be 5-200 characters"),
    body("description").trim().isLength({ min: 10, max: 2000 }).withMessage("Description must be 10-2000 characters"),
    body("type").isIn(["dogBite", "dogChasing", "aggressiveDog", "strayDogFeeding", "dogInDistress", "other"]),
    body("coordinates").isArray({ min: 2, max: 2 }).withMessage("Coordinates must be [longitude, latitude]"),
    body("coordinates.*").isFloat().withMessage("Coordinates must be numbers"),
    body("urgencyLevel").optional().isInt({ min: 1, max: 10 }),
    body("victimInjured").optional().isBoolean(),
    body("medicalAttentionRequired").optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        type,
        coordinates,
        address,
        urgencyLevel,
        victimInjured,
        medicalAttentionRequired,
        animalDescription,
        attachments
      } = req.body;

      // Determine priority based on type and urgency
      let priority = "medium";
      if (type === "dogBite" || medicalAttentionRequired) {
        priority = "urgent";
      } else if (type === "dogChasing" || type === "aggressiveDog") {
        priority = "high";
      } else if (urgencyLevel >= 8) {
        priority = "urgent";
      } else if (urgencyLevel >= 6) {
        priority = "high";
      }

      const ticket = new Ticket({
        title,
        description,
        type,
        priority,
        reportedBy: req.user.id,
        location: {
          type: "Point",
          coordinates: coordinates // [longitude, latitude]
        },
        address,
        urgencyLevel,
        victimInjured,
        medicalAttentionRequired,
        animalDescription,
        attachments: attachments || []
      });

      await ticket.save();
      
      // Populate the created ticket
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate('reportedBy', 'name email role');

      res.status(201).json(populatedTicket);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to create ticket" });
    }
  }
);

/**
 * PUT /api/tickets/:id/assign
 * Assign ticket to operator
 */
router.put(
  "/:id/assign",
  [
    auth(true),
    requireRole("admin", "ngoAdmin", "municipalityAdmin", "operators"),
    body("assignedTo").optional().isMongoId()
  ],
  async (req, res) => {
    try {
      const { assignedTo } = req.body;
      
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // If no assignedTo provided, assign to current user (self-assignment)
      ticket.assignedTo = assignedTo || req.user.id;
      
      // Update status if it's still open
      if (ticket.status === "open") {
        ticket.status = "inProgress";
      }

      await ticket.save();
      
      const updatedTicket = await Ticket.findById(ticket._id)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role');

      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to assign ticket" });
    }
  }
);

/**
 * PUT /api/tickets/:id/status
 * Update ticket status
 */
router.put(
  "/:id/status",
  [
    auth(true),
    requireRole("admin", "ngoAdmin", "municipalityAdmin", "operators", "groundStaff"),
    body("status").isIn(["open", "inProgress", "resolved", "closed"]),
    body("resolutionNotes").optional().trim().isLength({ max: 1000 })
  ],
  async (req, res) => {
    try {
      const { status, resolutionNotes } = req.body;
      
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check permission
      const userRole = req.user.role.toLowerCase();
      if ((userRole === 'operators' || userRole === 'groundstaff') && 
          ticket.assignedTo && ticket.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ error: "Can only update assigned tickets" });
      }

      ticket.status = status;
      if (resolutionNotes) {
        ticket.resolutionNotes = resolutionNotes;
      }

      if (status === "resolved" || status === "closed") {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = req.user.id;
      }

      await ticket.save();
      
      const updatedTicket = await Ticket.findById(ticket._id)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .populate('resolvedBy', 'name email');

      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to update ticket" });
    }
  }
);

/**
 * GET /api/tickets/stats
 * Get ticket statistics
 */
router.get(
  "/stats",
  [auth(true)],
  async (req, res) => {
    try {
      const userRole = req.user.role.toLowerCase();
      let matchFilter = {};

      // Apply role-based filtering
      if (userRole === 'operators' || userRole === 'groundstaff') {
        matchFilter = {
          $or: [
            { assignedTo: req.user.id },
            { assignedTo: null }
          ]
        };
      }

      const stats = await Ticket.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
            urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
            low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
        urgent: 0, high: 0, medium: 0, low: 0
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  }
);

module.exports = router;
