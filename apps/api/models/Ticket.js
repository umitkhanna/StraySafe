const mongoose = require("mongoose");

const TICKET_TYPES = [
  "dogBite",
  "dogChasing",
  "aggressiveDog",
  "strayDogFeeding",
  "dogInDistress",
  "other"
];

const TICKET_STATUS = [
  "open",
  "inProgress",
  "resolved",
  "closed"
];

const PRIORITY_LEVELS = [
  "low",
  "medium",
  "high",
  "urgent"
];

const TicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    type: {
      type: String,
      enum: TICKET_TYPES,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: TICKET_STATUS,
      default: "open",
      index: true
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "medium",
      index: true
    },
    // Reporter information
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    // Assigned operator
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    // Location information
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere"
      }
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      fullAddress: { type: String, trim: true }
    },
    // Media attachments
    attachments: [{
      type: {
        type: String,
        enum: ["image", "video"],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Additional details
    urgencyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    victimInjured: {
      type: Boolean,
      default: false
    },
    medicalAttentionRequired: {
      type: Boolean,
      default: false
    },
    animalDescription: {
      breed: { type: String, trim: true },
      color: { type: String, trim: true },
      size: { type: String, enum: ["small", "medium", "large"], trim: true },
      collar: { type: Boolean, default: false },
      tags: { type: String, trim: true }
    },
    // Resolution details
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Auto-generate ticket number
TicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for geospatial queries
TicketSchema.index({ location: "2dsphere" });

// Compound indexes for common queries
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ reportedBy: 1, createdAt: -1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
