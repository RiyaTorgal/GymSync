// models/excercise.js - COMPLETE UPPERCASE SCHEMA
import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    ID: { type: Number, required: true, unique: true }, // Changed from id
    Name: { type: String, required: true, trim: true }, // Changed from name
    Type: { // Changed from type
      type: String,
      required: true,
      enum: [
        "Strength",
        "Cardio",
        "Plyometric",
        "Isometric",
        "HIIT",
        "Warm-Up (Dynamic)",
        "Stretching (Static)",
        "Stretching (Dynamic)",
        "Stretching (Flow)",
        "Mobility",
      ],
    },
    Section: { // Changed from section
      type: String,
      required: true,
      enum: ["Upper Body", "Lower Body", "Core", "Legs", "Mix", "Full Body"],
    },
    Muscle: { type: String, required: true }, // Changed from muscle
    Equipment: { type: String, required: true }, // Changed from equipment
    Difficulty: { // Changed from difficulty
      type: String,
      required: true,
      enum: ["Beginner", "Beginner-Intermediate", "Intermediate", "Advanced"],
    },
    Instructions: { type: String, required: true }, // Changed from instructions
    Sets: { type: Number, required: true, min: 1 }, // Changed from sets
    Reps: { type: String, required: true }, // Changed from reps
    RestTime: { type: String, required: true }, // Changed from restTime
    CaloriesPerSet: { type: Number, default: 5 }, // Changed from caloriesPerSet
    TargetMuscleGroups: [ // Changed from targetMuscleGroups
      {
        type: String,
        enum: [
          "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes",
          "Abs", "Core", "Hamstrings", "Quadriceps", "Calves", "Traps", "Lats",
          "Forearms", "Lower Back", "Hip Flexors", "Inner Thighs", "Rear Delts",
          "Full Body", "Cardio",
        ],
      },
    ],
    IsActive: { type: Boolean, default: true }, // Changed from isActive
  },
  {
    timestamps: true,
    collection: "excercises",
  }
);

// Update ALL indexes to use uppercase fields
exerciseSchema.index({ Type: 1, Difficulty: 1 }); // Changed from type, difficulty
exerciseSchema.index({ Section: 1, Muscle: 1 }); // Changed from section, muscle
exerciseSchema.index({ Equipment: 1 }); // Changed from equipment

// Update virtual for estimated duration
exerciseSchema.virtual("EstimatedDuration").get(function () {
  const restTimeNum = parseInt(this.RestTime) || 60; // Changed from restTime
  const avgSetTime = 45;
  return Math.ceil((this.Sets * (avgSetTime + restTimeNum)) / 60); // Changed from sets
});

// Update instance method
exerciseSchema.methods.CalculateTotalCalories = function () {
  return this.Sets * this.CaloriesPerSet; // Changed from sets, caloriesPerSet
};

// Update static methods
exerciseSchema.statics.FindByMuscleGroup = function (muscleGroup) {
  return this.find({
    $or: [
      { Muscle: new RegExp(muscleGroup, "i") }, // Changed from muscle
      { TargetMuscleGroups: muscleGroup }, // Changed from targetMuscleGroups
    ],
    IsActive: true, // Changed from isActive
  });
};

exerciseSchema.statics.FindByEquipment = function (availableEquipment) {
  const equipmentRegex = new RegExp(availableEquipment.join("|"), "i");
  return this.find({ Equipment: equipmentRegex, IsActive: true }); // Changed from equipment, isActive
};

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;