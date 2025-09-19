// routes/excerciseRoutes.js
import express from "express";
import Exercise from "../models/excercise.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// GET all exercises 
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Fetching all exercises...');
    // TEMPORARY: Removed IsActive filter to see all data
    const exercises = await Exercise.find({});
    console.log(`📊 Found ${exercises.length} total exercises`);
    res.json({ success: true, count: exercises.length, exercises });
  } catch (err) {
    console.error('❌ Error fetching exercises:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: err.message,
    });
  }
});

// ---------------------------------------------------------------------------
// GET single exercise by ID 
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "ID must be a number",
    });
  }

  try {
    console.log(`🔍 Fetching exercise ID: ${id}`);
    
    // TEMPORARY: Removed IsActive filter to see all data
    const exercise = await Exercise.findOne({ ID: id });
    if (!exercise) {
      console.log(`❌ Exercise ID ${id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "Exercise not found" });
    }
    
    console.log(`✅ Found exercise: ${exercise.Name}`);
    res.json({ success: true, exercise });
  } catch (err) {
    console.error('❌ Error fetching exercise:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching exercise",
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
    
    // TEMPORARY: Removed IsActive filter to see all data
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
    
    // TEMPORARY: Removed IsActive filter to see all data
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
    
    // Use the static method (which still has IsActive filter)
    const exercises = await Exercise.FindByMuscleGroup(muscle);
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
    
    // Use the static method (which still has IsActive filter)
    const exercises = await Exercise.FindByEquipment(equipmentList);
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
// POST – generate custom workout plan 
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

    // TEMPORARY: Removed IsActive filter to see all data
    let query = {}; 

    if (workoutType && typeMapping[workoutType]) {
      query.Type = { $in: typeMapping[workoutType] };
      console.log(`🔍 Using Type filter: [${typeMapping[workoutType].join(', ')}]`);
    }
    if (difficulty) {
      query.Difficulty = difficulty;
      console.log(`🔍 Using Difficulty filter: ${difficulty}`);
    }
    if (targetMuscles?.length) {
      query.$or = [
        { Muscle: new RegExp(targetMuscles.join("|"), "i") },
        { TargetMuscleGroups: { $in: targetMuscles } },
      ];
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
      // Use virtual and method names with uppercase
      totalTime += ex.EstimatedDuration || 2; // Default 2 min if virtual not working
      totalCalories += ex.CalculateTotalCalories ? ex.CalculateTotalCalories() : (ex.Sets * 5);
    });

    const workoutPlan = {
      id: Date.now().toString(),
      name: `Custom ${workoutType || 'Full Body'} Workout`,
      type: workoutType || 'Mixed',
      difficulty: difficulty || "Mixed",
      duration: `${Math.max(totalTime, 15)} min`, // Minimum 15 min
      caloriesBurn: `${totalCalories}-${Math.ceil(totalCalories * 1.3)}`,
      description: `A personalized ${workoutType?.toLowerCase() || 'full body'} workout targeting your goals`,
      exercises: exercises.map((ex) => ({
        id: ex.Id.toString(),
        name: ex.Name,
        sets: ex.Sets,
        reps: ex.Reps,
        restTime: ex.RestTime,
        difficulty: ex.Difficulty,
        equipment: ex.Equipment,
        instructions: ex.Instructions,
        muscleGroups: ex.TargetMuscleGroups || (ex.Muscle ? ex.Muscle.split(',').map(m => m.trim()) : []),
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



// ---------------------------------------------------------------------------
// TEMPORARY DEBUG ROUTE - Remove after testing
// ---------------------------------------------------------------------------
router.get("/debug/all", async (req, res) => {
  try {
    console.log('🔍 Running full debug...');
    
    // Get ALL unique field values
    const uniqueTypes = await Exercise.distinct("Type");
    const uniqueSections = await Exercise.distinct("Section");
    const uniqueMuscles = await Exercise.distinct("Muscle");
    const uniqueDifficulties = await Exercise.distinct("Difficulty");
    const uniqueEquipment = await Exercise.distinct("Equipment");
    
    // Get sample documents
    const sampleExercises = await Exercise.find({}).limit(5).select('Id Name Type Section Muscle Difficulty Equipment IsActive');
    
    // Count documents per Type
    const typeCounts = await Exercise.aggregate([
      { $group: { _id: "$Type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Check IsActive status
    const activeCount = await Exercise.countDocuments({ IsActive: true });
    const inactiveCount = await Exercise.countDocuments({ IsActive: false });
    const missingActiveCount = await Exercise.countDocuments({ IsActive: { $exists: false } });
    
    res.json({
      success: true,
      totalDocuments: await Exercise.countDocuments(),
      isActiveStats: {
        active: activeCount,
        inactive: inactiveCount,
        missingField: missingActiveCount
      },
      debug: {
        uniqueTypes,
        uniqueSections,
        uniqueMuscles,
        uniqueDifficulties,
        uniqueEquipment,
        typeCounts,
        sampleExercises: sampleExercises.map(doc => ({
          Id: doc.Id,
          Name: doc.Name,
          Type: doc.Type,
          Section: doc.Section,
          Muscle: doc.Muscle,
          Difficulty: doc.Difficulty,
          Equipment: doc.Equipment,
          IsActive: doc.IsActive
        }))
      },
      message: "Debug info - check console for detailed logs"
    });
  } catch (err) {
    console.error('❌ Debug error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;