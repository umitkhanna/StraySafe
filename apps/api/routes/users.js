const express = require("express");
const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();
const ROLES = [
  "admin",
  "ngoAdmin", 
  "municipalityAdmin",
  "operators",
  "groundStaff",
  "user",
  "highRiskUser"
];

// Helper function to get allowed roles for creation based on current user role
const getAllowedRolesForCreation = (currentUserRole) => {
  switch (currentUserRole) {
    case "admin":
      return ["ngoAdmin", "municipalityAdmin"];
    case "ngoAdmin":
    case "municipalityAdmin":
      return ["operators", "groundStaff"];
    default:
      return []; // Other roles cannot create users
  }
};

// Middleware to validate role-based user creation permissions
const validateRolePermissions = (req, res, next) => {
  // For now, we'll skip authentication check since it's not implemented
  // In a real application, you would get currentUser from req.user after authentication
  // const currentUser = req.user;
  // const allowedRoles = getAllowedRolesForCreation(currentUser.role);
  // const requestedRole = req.body.role;
  
  // if (!allowedRoles.includes(requestedRole)) {
  //   return res.status(403).json({ 
  //     error: `User with role '${currentUser.role}' cannot create users with role '${requestedRole}'` 
  //   });
  // }
  
  next();
};

// Get all users
router.get("/", async (req, res) => {
  try {
    const { parentId } = req.query;
    let filter = {};
    
    if (parentId) {
      // If parentId is provided, only fetch child users
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ error: "Invalid parentId" });
      }
      filter.parentId = parentId;
    } else {
      // If no parentId, fetch only top-level users (no parent)
      filter.parentId = null;
    }
    
    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Create user
router.post(
  "/",
  validateRolePermissions,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("role").optional().isIn(ROLES).withMessage("Invalid role"),
    body("parentId").optional().custom((v) => !v || mongoose.isValidObjectId(v)).withMessage("Invalid parentId"),
    // Conditional validation for ngoAdmin
    body("ngoName").if(body("role").equals("ngoAdmin")).notEmpty().withMessage("NGO Name is required for NGO Admin"),
    body("address").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Address is required"),
    body("city").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("City is required"),
    body("state").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("State is required"),
    body("pincode").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Pincode is required"),
    body("phoneNumber").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Phone Number is required"),
    // Conditional validation for municipalityAdmin
    body("municipalityName").if(body("role").equals("municipalityAdmin")).notEmpty().withMessage("Municipality Name is required for Municipality Admin"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { 
        name, 
        email, 
        password, 
        role = "user", 
        parentId = null,
        ngoName,
        municipalityName,
        address,
        address2,
        city,
        state,
        pincode,
        phoneNumber
      } = req.body;

      if (parentId) {
        const parent = await User.findById(parentId).select("_id");
        if (!parent) return res.status(400).json({ error: "parentId does not exist" });
      }

      const passwordHash = await User.hashPassword(password);
      const userData = { 
        name, 
        email, 
        passwordHash, 
        role, 
        parentId,
        ngoName,
        municipalityName,
        address,
        address2,
        city,
        state,
        pincode,
        phoneNumber
      };
      
      const user = await User.create(userData);
      res.status(201).json(user);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "Email already exists" });
      res.status(500).json({ error: err.message || "Server error" });
    }
  }
);

// Update user
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email required"),
    body("role").optional().isIn(ROLES).withMessage("Invalid role"),
    // Conditional validation for ngoAdmin
    body("ngoName").if(body("role").equals("ngoAdmin")).notEmpty().withMessage("NGO Name is required for NGO Admin"),
    body("address").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Address is required"),
    body("city").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("City is required"),
    body("state").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("State is required"),
    body("pincode").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Pincode is required"),
    body("phoneNumber").if(body("role").custom((role) => role === "ngoAdmin" || role === "municipalityAdmin")).notEmpty().withMessage("Phone Number is required"),
    // Conditional validation for municipalityAdmin
    body("municipalityName").if(body("role").equals("municipalityAdmin")).notEmpty().withMessage("Municipality Name is required for Municipality Admin"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.passwordHash;
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await User.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      });
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json(user);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "Email already exists" });
      res.status(500).json({ error: err.message || "Server error" });
    }
  }
);

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Get user by id
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

module.exports = router;
