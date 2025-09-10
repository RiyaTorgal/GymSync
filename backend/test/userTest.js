import mongoose from "mongoose";
import User from "../models/user.js";

async function connectDB() {
  await mongoose.connect("mongodb://localhost:27017/gym_sync");
  console.log("✅ Connected to MongoDB: gymSync");
}

async function runTest() {
  await connectDB();

  try {
    // create a user
    const newUser = await User.create({
      name: "John Doe",
      email: "john@example.com",
      membershipType: "Monthly",
      workoutType: "Cardio",
    });
    console.log("👤 User created:", newUser);

    // verify user is actually in DB
    const foundUser = await User.findOne({ email: "john@example.com" });
    console.log("🔎 User found in DB:", foundUser);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("🛑 Connection closed");
  }
}

runTest();
