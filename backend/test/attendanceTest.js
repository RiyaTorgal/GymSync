import mongoose from "mongoose";
import User from "../models/user.js"; // adjust path if needed

// connect to DB
async function connectDB() {
  await mongoose.connect("mongodb://localhost:27017/gym_sync");
  console.log("✅ Connected to gym_sync DB");
}

// function to mark attendance for a user
async function markAttendance(user, classType) {
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $inc: { attendanceCount: 1 },
      $push: { attendance: { date: new Date(), classType } },
    },
    { new: true }
  );

  console.log(`📈 Attendance updated for ${updatedUser.name}`);
  console.log("New attendance count:", updatedUser.attendanceCount);
  console.log("Last attendance entry:", updatedUser.attendance[updatedUser.attendance.length - 1]);
}

async function runTest() {
  await connectDB();

  try {
    // 🔹 fetch any existing user from DB
    const user = await User.findOne();

    if (!user) {
      console.log("❌ No users found in DB");
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // choose the workout type from the user's schema (or pick randomly)
    const classType = user.workoutType || "Cardio";

    // update attendance
    await markAttendance(user, classType);
  } finally {
    await mongoose.connection.close();
    console.log("🛑 Connection closed");
  }
}

runTest();
