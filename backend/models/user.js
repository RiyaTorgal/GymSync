import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
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
  dateOfBirth: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  contactInfo: {
    primaryPhone: { type: String },
    secondaryPhone: { type: String },
    address:{
      building: { type: String, required: [true, 'Building name is required'], },
      landmark: { type: String, required: [true, 'Landmark is required'], },
      city: { type: String, required: [true, 'City is required'], },
      state: { type: String,required: [true, 'State is required'], },
      country: { type: String, required: [true, 'Country is required'], },
      pincode: { type: String, required: [true, 'Pincode is required'],}
    }
  },
  healthInfo:{
    weight: { type: Number }, // in kgs
    height: { type: Number, min: [100, 'Height must be at least 100 cm'], max: [250, 'Height must be less than 250 cm'], default: null }, // in cms
    bloodGroup: { type: String },
    medicalHistory: {
      accidents: [
        {
          description: { type: String },
          date: { type: Date},
          recovered: { type: Boolean, default: true },
        },
      ],
      chronicConditions:[
        {
            conditionName: { type: String },
            diagnosedDate: { type: Date },
            underMedication: { type: Boolean, default: false },
            notes: { type: String },
        }
      ],
    },
  }
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