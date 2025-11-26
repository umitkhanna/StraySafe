const mongoose = require("mongoose");
const User = require("../models/User");
const Ticket = require("../models/Ticket");

// ----------------------------------------------------------------------
// CONNECT TO MONGO
// ----------------------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/straysafe";

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ----------------------------------------------------------------------
    // 1️⃣ CREATE USERS
    // ----------------------------------------------------------------------
    console.log("⏳ Creating users...");

    const passwordHash = await User.hashPassword("password123");

    const citizenUser = await User.findOneAndUpdate(
      { email: "citizen@example.com" },
      {
        name: "Citizen User",
        email: "citizen@example.com",
        passwordHash,
        role: "user",
      },
      { upsert: true, new: true }
    );

    const highRiskUser = await User.findOneAndUpdate(
      { email: "highrisk@example.com" },
      {
        name: "High Risk User",
        email: "highrisk@example.com",
        passwordHash,
        role: "highRiskUser",
      },
      { upsert: true, new: true }
    );

    const operatorUser = await User.findOneAndUpdate(
      { email: "operator@example.com" },
      {
        name: "Operator",
        email: "operator@example.com",
        passwordHash,
        role: "operators",
      },
      { upsert: true, new: true }
    );

    const groundStaff = await User.findOneAndUpdate(
      { email: "groundstaff@example.com" },
      {
        name: "Ground Staff",
        email: "groundstaff@example.com",
        passwordHash,
        role: "groundStaff",
      },
      { upsert: true, new: true }
    );

    console.log("✅ Users created.");

    // ----------------------------------------------------------------------
    // 2️⃣ CREATE TICKETS
    // ----------------------------------------------------------------------
    console.log("⏳ Creating sample tickets...");

    const sampleTickets = [
      {
        title: "Aggressive dog near school",
        description: "The dog is growling and barking at students.",
        type: "aggressiveDog",
        priority: "urgent",
        reportedBy: highRiskUser._id,
        assignedTo: operatorUser._id,
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716],
        },
        address: {
          street: "MG Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          fullAddress: "MG Road, Bangalore",
        },
        attachments: [],
      },
      {
        title: "Dog chasing joggers",
        description: "Stray dog chasing people in the park.",
        type: "dogChasing",
        priority: "high",
        reportedBy: citizenUser._id,
        assignedTo: groundStaff._id,
        location: {
          type: "Point",
          coordinates: [72.8777, 19.0760],
        },
        address: {
          street: "Marine Drive",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400002",
          fullAddress: "Marine Drive, Mumbai",
        },
        attachments: [],
      }
    ];

    // IMPORTANT — create tickets *one by one* using save()
    for (const t of sampleTickets) {
      const ticket = new Ticket(t);

      // MANUAL FALLBACK (ensures ticketNumber is always set)
      if (!ticket.ticketNumber) {
        const count = await Ticket.countDocuments();
        ticket.ticketNumber = `TKT${String(count + 1).padStart(6, "0")}`;
      }

      await ticket.save();
    }

    console.log("🎉 Tickets created successfully!");
    console.log("✅ Seeding completed.");

    process.exit(0);

  } catch (err) {
    console.error("❌ SEEDING ERROR:", err);
    process.exit(1);
  }
}

seed();
