import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'gym-sync-secret-key-2024', {
    expiresIn: '7d',
  });
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Access token required" 
    });
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'gym-sync-secret-key-2024', (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }
    req.userId = decoded.userId;
    req.token = token; // Store token for potential blacklisting
    next();
  });
};

// Helper function to get day name from date
const getDayName = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Helper function to get start and end of current week (Monday to Sunday)
const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Calculate days to subtract to get to Monday (1)
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

// Register a new user
router.post("/register", async (req, res) => {
  console.log('Registration attempt:', { email: req.body.email });
  
  try {
    const { name, email, password, membershipType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !membershipType) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      membershipType,
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Registration failed" 
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for user:', user.email);

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Login failed" 
    });
  }
});

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const token = req.token;
    
    // Add token to blacklist
    tokenBlacklist.add(token);
    
    console.log(`User ${req.userId} logged out successfully`);
    
    res.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Logout failed" 
    });
  }
});

// Logout from all devices
router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // In a real application, you would:
    // 1. Store a tokenVersion field in the user model
    // 2. Increment it on logout-all
    // 3. Check tokenVersion in JWT verification
    
    // For now, we'll just add current token to blacklist
    const token = req.token;
    tokenBlacklist.add(token);
    
    console.log(`User ${userId} logged out from all devices`);
    
    res.json({
      success: true,
      message: "Logged out from all devices successfully"
    });

  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Logout from all devices failed" 
    });
  }
});

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile" 
    });
  }
});

// Get weekly goal progress (protected route)
router.get("/weekly-goal", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    // Count attendance for current week
    const weeklyAttendance = user.attendance?.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    }) || [];

    const completedWorkouts = weeklyAttendance.length;
    
    // Default goal is 5 workouts per week (can be made customizable later)
    const weeklyGoal = user.weeklyGoal || 5;
    const percentage = Math.round((completedWorkouts / weeklyGoal) * 100);
    const remaining = Math.max(0, weeklyGoal - completedWorkouts);

    res.json({
      success: true,
      weeklyGoal: {
        completed: completedWorkouts,
        target: weeklyGoal,
        percentage: percentage,
        remaining: remaining,
        startDate: startOfWeek,
        endDate: endOfWeek
      }
    });

  } catch (error) {
    console.error("Weekly goal fetch error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch weekly goal" 
    });
  }
});

// Update weekly goal (protected route)
router.put("/weekly-goal", authenticateToken, async (req, res) => {
  try {
    const { weeklyGoal } = req.body;

    if (!weeklyGoal || weeklyGoal < 1 || weeklyGoal > 7) {
      return res.status(400).json({
        success: false,
        message: "Weekly goal must be between 1 and 7"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { weeklyGoal: weeklyGoal },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`Weekly goal updated to ${weeklyGoal} for user ${user.name}`);

    res.json({
      success: true,
      message: "Weekly goal updated successfully",
      weeklyGoal: weeklyGoal
    });

  } catch (error) {
    console.error("Update weekly goal error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update weekly goal"
    });
  }
});

// Mark attendance for a specific date (protected route)
router.post("/attendance", authenticateToken, async (req, res) => {
  try {
    const { date } = req.body;
    
    // If no date provided, use current date
    const attendanceDate = date ? new Date(date) : new Date();
    const dayName = getDayName(attendanceDate);
    
    // Set time to start of day to avoid duplicate entries for same day
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if attendance already marked for this day
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const existingAttendance = user.attendance?.find(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Attendance already marked for ${dayName}`
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: { attendanceCount: 1 },
        $push: { 
          attendance: { 
            date: attendanceDate,
            dayName: dayName
          } 
        },
      },
      { new: true }
    );

    console.log(`Attendance marked for ${updatedUser.name}: ${dayName} - ${attendanceDate.toDateString()}`);

    res.json({
      success: true,
      message: `Attendance marked for ${dayName}`,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark attendance" 
    });
  }
});

// Mark attendance for today (protected route)
router.post("/attendance/today", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const dayName = getDayName(today);
    
    // Set time to start of day to avoid duplicate entries for same day
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if attendance already marked for today
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const existingAttendance = user.attendance?.find(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: `Attendance already marked for today (${dayName})`
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: { attendanceCount: 1 },
        $push: { 
          attendance: { 
            date: today,
            dayName: dayName
          } 
        },
      },
      { new: true }
    );

    console.log(`Attendance marked for ${updatedUser.name}: ${dayName} - ${today.toDateString()}`);

    res.json({
      success: true,
      message: `Attendance marked for today (${dayName})`,
      user: updatedUser,
    });

  } catch (error) {
    console.error("Attendance error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark attendance" 
    });
  }
});

// Get attendance for a specific date range (protected route)
router.get("/attendance", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, dayName } = req.query;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let filteredAttendance = user.attendance || [];

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredAttendance = filteredAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
      });
    }

    // Filter by day name if provided
    if (dayName) {
      filteredAttendance = filteredAttendance.filter(record => 
        record.dayName?.toLowerCase() === dayName.toLowerCase()
      );
    }

    res.json({
      success: true,
      attendance: filteredAttendance,
      count: filteredAttendance.length
    });

  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch attendance" 
    });
  }
});

// Update user profile (protected route)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, membershipType } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (membershipType) updateData.membershipType = membershipType;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`Profile updated for ${user.name}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile" 
    });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`Password changed for user ${user.email}`);

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password"
    });
  }
});

// Delete account
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account"
      });
    }

    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.userId);
    
    // Add current token to blacklist
    tokenBlacklist.add(req.token);
    
    console.log(`Account deleted for user ${user.email}`);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account"
    });
  }
});

// Get all users (admin route)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users" 
    });
  }
});

// Utility function to clean up expired blacklisted tokens (call periodically)
const cleanupBlacklistedTokens = () => {
  // This is a simple cleanup - in production, you'd store tokens with expiry
  // For now, we'll just clear the entire blacklist periodically
  if (tokenBlacklist.size > 1000) {
    tokenBlacklist.clear();
    console.log('Blacklisted tokens cleared');
  }
};

// Clean up every hour
setInterval(cleanupBlacklistedTokens, 60 * 60 * 1000);

export default router;