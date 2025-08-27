const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = [
  "admin",
  "ngoAdmin",
  "municipalityAdmin",
  "operators",
  "groundStaff",
  "user",
  "highRiskUser",
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ROLES,
      default: "user",
      index: true,
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true, index: true },
    // Optional fields
    ngoName: { type: String, trim: true },
    municipalityName: { type: String, trim: true },
    address: { type: String, trim: true },
    address2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

// Hide sensitive fields in JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Static helper to hash passwords
UserSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

// Instance method to compare passwords
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Prevent self-reference
UserSchema.pre("save", async function (next) {
  if (!this.isModified("parentId") || !this.parentId) return next();

  if (this._id && this._id.equals(this.parentId)) {
    return next(new Error("parentId cannot be the user itself."));
  }

  const parent = await mongoose.model("User").findById(this.parentId).select("_id");
  if (!parent) return next(new Error("parentId does not exist."));

  next();
});

module.exports = mongoose.model("User", UserSchema);
