import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  membershipType: { type: String, enum: ["Basic", "Premium", "VIP"], default: "Basic" },
  joinDate: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

export default User;
