import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { 
    firstname: { type: String, required: true },
    middlename: { type: String },
    lastname: { type: String, required: true }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  membershipType: { type: String, enum: ["Monthly", "Quarterly", "Annual"], required: true },
  joinDate: { type: Date, default: Date.now },
  attendanceCount: { type: Number, default: 0 },
  weeklyGoal: { type: Number, default: 5, min: 1, max: 7 }, // Default goal: 5 workouts per week
  attendance: [
    {
      date: { type: Date, default: Date.now },
      dayName: { type: String },
      classType: { type: String }, // optional (e.g., Legs/Upper Body/etc.)
    },
  ],
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;