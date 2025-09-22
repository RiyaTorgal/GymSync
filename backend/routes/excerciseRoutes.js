// routes/excerciseRoutes.js
import express from "express";
import Exercise from "../models/excercise.js";

const router = express.Router();

// Weekly schedule configuration - UPDATED targetMuscles to match JSON Muscle strings
const WEEKLY_SCHEDULE = {
  Monday: {
    name: "Legs Day",
    type: "Strength",
    targetMuscles: ["Legs", "Glutes", "Hamstrings", "Quadriceps"],
    keywords: ["Squat", "Lunge", "Leg Extension", "Leg Curl", "Leg Press"],
    section: "Lower Body",
    description: "Focus on quadriceps, hamstrings, squats, lunges, leg extensions, leg curls, and leg press"
  },
  Tuesday: {
    name: "Upper Body + Abs",
    type: "Strength",
    targetMuscles: ["Shoulders", "Biceps", "Triceps", "Abs", "Core", "Chest"],
    keywords: ["Shoulder", "Bicep", "Tricep", "Ab", "Core"],
    section: ["Upper Body", "Core"],
    description: "Upper body focus on shoulders, biceps, triceps plus core strengthening"
  },
  Wednesday: {
    name: "Inner & Outer Thighs + Back",
    type: "Strength",
    targetMuscles: ["Thighs", "Back", "Lats", "Lower Back"],
    keywords: ["Thigh", "Back", "Lat", "Row"],
    section: ["Lower Body", "Upper Body"],
    description: "Target inner and outer thighs with comprehensive back workout"
  },
  Thursday: {
    name: "Core + Cardio",
    type: ["Strength", "Cardio"],
    targetMuscles: ["Core", "Abs", "Full Body"],
    keywords: ["Core", "Cardio", "Plank", "Crunch", "HIIT"],
    section: ["Core", "Full Body"],
    description: "Core strengthening combined with cardiovascular training"
  },
  Friday: {
    name: "Legs Day",
    type: "Strength",
    targetMuscles: ["Legs", "Glutes", "Hamstrings", "Quadriceps"],
    keywords: ["Squat", "Lunge", "Leg Extension", "Leg Curl", "Leg Press"],
    section: "Lower Body",
    description: "Focus on quadriceps, hamstrings, squats, lunges, leg extensions, leg curls, and leg press"
  },
  Saturday: {
    name: "Upper Body + Abs",
    type: "Strength",
    targetMuscles: ["Shoulders", "Biceps", "Triceps", "Abs", "Core", "Chest"],
    keywords: ["Shoulder", "Bicep", "Tricep", "Ab", "Core"],
    section: ["Upper Body", "Core"],
    description: "Upper body focus on shoulders, biceps, triceps plus core strengthening"
  },
  Sunday: {
    name: "Rest Day",
    type: "Rest",
    description: "Recovery and rest day - light stretching or mobility work only"
  }
};

// ---------------------------------------------------------------------------
// GET all exercises (for debugging)
// ---------------------------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    console.log('🔍 Fetching all exercises...');
    const exercises = await Exercise.find({});
    console.log(`📊 Found ${exercises.length} exercises`);
    
    res.json({ 
      success: true, 
      count: exercises.length, 
      exercises 
    });
  } catch (err) {
    console.error('❌ Error fetching all exercises:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET weekly schedule
// ---------------------------------------------------------------------------
router.get("/weekly-schedule", async (req, res) => {
  try {
    console.log('📅 Fetching weekly workout schedule...');
    
    const schedule = {};
    
    for (const [day, config] of Object.entries(WEEKLY_SCHEDULE)) {
      if (config.type === "Rest") {
        schedule[day] = {
          name: config.name,
          type: config.type,
          description: config.description,
          exercises: [],
          totalCalories: 0,
          estimatedDuration: "0 min",
          exerciseCount: 0
        };
        continue;
      }

      // Build query for this day - REMOVED IsActive
      let query = {};
      
      // Handle multiple types
      if (Array.isArray(config.type)) {
        query.Type = { $in: config.type };
      } else {
        query.Type = config.type;
      }

      // Handle multiple sections
      if (Array.isArray(config.section)) {
        query.Section = { $in: config.section };
      } else if (config.section) {
        query.Section = config.section;
      }

      // Add muscle targeting - UPDATED to match Muscle string
      if (config.targetMuscles && config.targetMuscles.length > 0) {
        query.Muscle = new RegExp(config.targetMuscles.join("|"), "i");
      }

      console.log(`🔍 ${day} query:`, JSON.stringify(query, null, 2));

      const exercises = await Exercise.find(query).limit(8); // Limit to 8 exercises per day
      
      // Calculate totals
      let totalCalories = 0;
      let totalTime = 0;
      
      exercises.forEach((ex) => {
        totalCalories += (ex.Sets * (ex.CaloriesPerSet || 5));
        totalTime += ex.EstimatedDuration || 3; // Default 3 min per exercise
      });

      schedule[day] = {
        name: config.name,
        type: Array.isArray(config.type) ? config.type.join(" + ") : config.type,
        description: config.description,
        exercises: exercises.map((ex) => ({
          id: ex.ID.toString(),
          name: ex.Name,
          sets: ex.Sets,
          reps: ex.Reps,
          restTime: ex.RestTime,
          difficulty: ex.Difficulty,
          equipment: ex.Equipment,
          instructions: ex.Instructions,
          muscleGroups: ex.Muscle ? ex.Muscle.split(',').map(m => m.trim()) : (ex.TargetMuscleGroups || []),
          type: ex.Type,
          section: ex.Section,
        })),
        totalCalories: totalCalories,
        estimatedDuration: `${Math.max(totalTime, 20)} min`, // Minimum 20 min
        exerciseCount: exercises.length
      };
      
      console.log(`✅ ${day}: ${exercises.length} exercises found`);
    }

    res.json({
      success: true,
      message: "Weekly schedule generated successfully",
      schedule
    });

  } catch (err) {
    console.error('❌ Error fetching weekly schedule:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly schedule",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET exercises by type
// ---------------------------------------------------------------------------
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`🔍 Searching for Type: "${type}"`);
    
    const exercises = await Exercise.find({ Type: type });
    console.log(`📊 Found ${exercises.length} exercises for Type "${type}"`);
    
    res.json({ success: true, type, count: exercises.length, exercises });
  } catch (err) {
    console.error('❌ Error fetching exercises by type:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises by type",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET exercises by difficulty
// ---------------------------------------------------------------------------
router.get("/difficulty/:difficulty", async (req, res) => {
  try {
    const { difficulty } = req.params;
    console.log(`🔍 Searching for Difficulty: "${difficulty}"`);
    
    const exercises = await Exercise.find({ Difficulty: difficulty });
    console.log(`📊 Found ${exercises.length} exercises for Difficulty "${difficulty}"`);
    
    res.json({ success: true, difficulty, count: exercises.length, exercises });
  } catch (err) {
    console.error('❌ Error fetching exercises by difficulty:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises by difficulty",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET exercises by muscle group
// ---------------------------------------------------------------------------
router.get("/muscle/:muscle", async (req, res) => {
  try {
    const { muscle } = req.params;
    console.log(`🔍 Searching for Muscle: "${muscle}"`);
    
    const exercises = await Exercise.find({ Muscle: new RegExp(muscle, "i") });
    console.log(`📊 Found ${exercises.length} exercises for Muscle "${muscle}"`);
    
    res.json({ success: true, muscle, count: exercises.length, exercises });
  } catch (err) {
    console.error('❌ Error fetching exercises by muscle:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises by muscle",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET exercises by equipment
// ---------------------------------------------------------------------------
router.get("/equipment", async (req, res) => {
  try {
    const { available } = req.query;
    const equipmentList = available ? available.split(",") : ["Bodyweight"];
    console.log(`🔍 Searching for Equipment: [${equipmentList.join(', ')}]`);
    
    const exercises = await Exercise.find({ Equipment: new RegExp(equipmentList.join("|"), "i") });
    console.log(`📊 Found ${exercises.length} exercises for equipment`);
    
    res.json({
      success: true,
      equipment: equipmentList,
      count: exercises.length,
      exercises,
    });
  } catch (err) {
    console.error('❌ Error fetching exercises by equipment:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises by equipment",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// POST — generate custom workout plan
// ---------------------------------------------------------------------------
router.post("/workout-plan", async (req, res) => {
  try {
    const {
      workoutType,
      difficulty,
      duration = 30,
      targetMuscles,
      equipment,
      exerciseCount = 6,
    } = req.body;

    console.log('🔨 Creating workout plan:', { workoutType, difficulty, exerciseCount });

    const typeMapping = {
      Cardio: ["Cardio", "HIIT", "Plyometric"],
      Strength: ["Strength", "Isometric"],
      Flexibility: ["Stretching (Static)", "Stretching (Dynamic)", "Mobility"],
      Balance: ["Isometric", "Stretching (Static)", "Warm-Up (Dynamic)"],
    };

    let query = {};

    if (workoutType && typeMapping[workoutType]) {
      query.Type = { $in: typeMapping[workoutType] };
      console.log(`🔍 Using Type filter: [${typeMapping[workoutType].join(', ')}]`);
    } else if (workoutType) {
      query.Type = workoutType;
    }

    if (difficulty) {
      query.Difficulty = difficulty;
      console.log(`🔍 Using Difficulty filter: ${difficulty}`);
    }
    if (targetMuscles?.length) {
      query.Muscle = new RegExp(targetMuscles.join("|"), "i");
      console.log(`🔍 Using Muscle filter: [${targetMuscles.join(', ')}]`);
    }
    if (equipment?.length) {
      query.Equipment = new RegExp(equipment.join("|"), "i");
      console.log(`🔍 Using Equipment filter: [${equipment.join(', ')}]`);
    }

    console.log('🔍 Final query:', JSON.stringify(query, null, 2));

    const exercises = await Exercise.find(query).limit(exerciseCount);
    console.log(`📊 Found ${exercises.length} exercises for workout plan`);

    let totalTime = 0;
    let totalCalories = 0;
    exercises.forEach((ex) => {
      totalTime += ex.EstimatedDuration || 2;
      totalCalories += (ex.Sets * (ex.CaloriesPerSet || 5));
    });

    const workoutPlan = {
      id: Date.now().toString(),
      name: `Custom ${workoutType || 'Full Body'} Workout`,
      type: workoutType || 'Mixed',
      difficulty: difficulty || "Mixed",
      duration: `${Math.max(totalTime, 15)} min`,
      caloriesBurn: `${totalCalories}-${Math.ceil(totalCalories * 1.3)}`,
      description: `A personalized ${workoutType?.toLowerCase() || 'full body'} workout targeting your goals`,
      exercises: exercises.map((ex) => ({
        id: ex.ID.toString(),
        name: ex.Name,
        sets: ex.Sets,
        reps: ex.Reps,
        restTime: ex.RestTime,
        difficulty: ex.Difficulty,
        equipment: ex.Equipment,
        instructions: ex.Instructions,
        muscleGroups: ex.Muscle ? ex.Muscle.split(',').map(m => m.trim()) : [],
        type: ex.Type,
        section: ex.Section,
      })),
    };

    console.log(`✅ Created workout plan with ${exercises.length} exercises`);
    res.json({ success: true, workoutPlan });
  } catch (err) {
    console.error('❌ Error creating workout plan:', err);
    res.status(500).json({
      success: false,
      message: "Error creating workout plan",
      error: err.message,
    });
  }
});

export default router;