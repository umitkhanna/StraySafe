const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/straysafe";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // clean existing user with same email
    const email = "user@example.com";
    await User.deleteOne({ email });

    // hash password
    const passwordHash = await User.hashPassword("Admin@123");

    const user = await User.create({
      name: "App User",
      email,
      passwordHash,
      role: "user",
      parentId: null,
    });

    console.log("✅ User seeded:", user);
  } catch (err) {
    console.error("❌ Error seeding user:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

run();
