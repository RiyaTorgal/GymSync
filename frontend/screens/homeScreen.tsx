import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceRecord {
  date: string;
  dayName: string;
}

interface User {
  _id?: string;
  // name: string;
    name: {
    firstname: string;
    middlename?: string;
    lastname: string;
  };
  email: string;
  membershipType: string;
  workoutType: string;
  attendanceCount?: number;
  joinDate?: string;
  attendance?: AttendanceRecord[];
  weeklyGoal?: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  difficulty: 'Beginner' | 'Beginner-Intermediate' | 'Intermediate' | 'Advanced';
  equipment?: string;
  instructions: string;
  muscleGroups?: string[];
}

interface DayWorkout {
  name: string;
  type: string;
  description: string;
  exercises: Exercise[];
  totalCalories: number;
  estimatedDuration: string;
  exerciseCount: number;
}

interface WeeklyGoal {
  completed: number;
  target: number;
  percentage: number;
  remaining: number;
  startDate: string;
  endDate: string;
}

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [todaysWorkout, setTodaysWorkout] = useState<DayWorkout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal | null>(null);
  const [loadingWeeklyGoal, setLoadingWeeklyGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState('5');

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
        if (token) {
          await fetchUserData(token);
          await fetchWeeklyGoal(token);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    
    initializeData();
    fetchTodaysWorkout();
  }, []);

  const fetchUserData = async (token?: string) => {
    try {
      const authTokenToUse = token || authToken;
      if (!authTokenToUse) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await fetch(
        "http://192.168.1.10:5000/api/users/profile",
        {
          headers: { 
            Authorization: `Bearer ${authTokenToUse}` 
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        Alert.alert("Error", "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const fetchWeeklyGoal = async (token?: string) => {
    setLoadingWeeklyGoal(true);
    try {
      const authTokenToUse = token || authToken;
      if (!authTokenToUse) {
        return;
      }

      const response = await fetch(
        "http://192.168.1.10:5000/api/users/weekly-goal",
        {
          headers: { 
            Authorization: `Bearer ${authTokenToUse}` 
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setWeeklyGoal(data.weeklyGoal);
        setNewGoalValue(data.weeklyGoal.target.toString());
      }
    } catch (error) {
      console.error("Failed to fetch weekly goal:", error);
    } finally {
      setLoadingWeeklyGoal(false);
    }
  };

  const updateWeeklyGoal = async () => {
    try {
      if (!authToken) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const goalValue = parseInt(newGoalValue);
      if (isNaN(goalValue) || goalValue < 1 || goalValue > 7) {
        Alert.alert("Invalid Goal", "Weekly goal must be between 1 and 7");
        return;
      }

      const response = await fetch(
        "http://192.168.1.10:5000/api/users/weekly-goal",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ weeklyGoal: goalValue }),
        }
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Weekly goal updated successfully");
        await fetchWeeklyGoal();
        setEditingGoal(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update weekly goal");
      }
    } catch (error) {
      console.error("Update weekly goal error:", error);
      Alert.alert("Error", "Failed to update weekly goal");
    }
  };

  const fetchTodaysWorkout = async () => {
    setLoadingWorkout(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/exercises/weekly-schedule');
      const data = await response.json();
      
      if (data.success) {
        const today = new Date().toLocaleString('en-US', { weekday: 'long' });
        const todaysWorkout = data.schedule[today];
        if (todaysWorkout && todaysWorkout.type !== 'Rest') {
          setTodaysWorkout(todaysWorkout);
        } else {
          setTodaysWorkout(null); // Rest day
        }
      }
    } catch (error) {
      console.error('Failed to fetch today\'s workout:', error);
      // Fallback to demo workout
      setTodaysWorkout({
        name: 'Upper Body + Abs',
        type: 'Strength',
        description: 'Focus on chest, back, shoulders, and core',
        exercises: [
          {
            id: '1',
            name: 'Push-Ups',
            sets: 3,
            reps: '10-15',
            restTime: '60s',
            difficulty: 'Beginner',
            equipment: 'Bodyweight',
            instructions: 'Start in plank position, lower chest to ground, then push back up.',
            muscleGroups: ['Chest', 'Triceps', 'Shoulders']
          },
          {
            id: '2',
            name: 'Plank',
            sets: 3,
            reps: '30s hold',
            restTime: '30s',
            difficulty: 'Beginner',
            equipment: 'Bodyweight',
            instructions: 'Hold plank position with body in straight line.',
            muscleGroups: ['Core', 'Abs']
          }
        ],
        totalCalories: 200,
        estimatedDuration: '25 min',
        exerciseCount: 2
      });
    } finally {
      setLoadingWorkout(false);
    }
  };

  // Updated Quick Check-in function to match backend API
  const handleQuickCheckIn = async () => {
    if (isCheckingIn) return; // Prevent double clicks
    
    setIsCheckingIn(true);
    try {
      if (!authToken) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await fetch(
        "http://192.168.1.10:5000/api/users/attendance/today",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local user state with new data
        setCurrentUser(data.user);
        // Refresh weekly goal to show updated progress
        await fetchWeeklyGoal();
        Alert.alert("Success!", data.message);
      } else {
        Alert.alert("Info", data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Quick check-in error:", error);
      Alert.alert("Error", "Failed to mark attendance. Please check your connection.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchUserData(),
      fetchTodaysWorkout(),
      fetchWeeklyGoal()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [authToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Monthly': return '#10b981';
      case 'Quarterly': return '#f59e0b';
      case 'Annual': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'Cardio': return 'walk';
      case 'Strength': return 'barbell';
      case 'Flexibility': return 'accessibility';
      case 'Balance': return 'scale';
      default: return 'fitness';
    }
  };

  // Get this month's attendance count
  const getThisMonthAttendance = () => {
    if (!currentUser.attendance) return 0;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return currentUser.attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    }).length;
  };

  // Get recent attendance (last 3 records)
  const getRecentAttendance = () => {
    if (!currentUser.attendance || currentUser.attendance.length === 0) return [];
    
    return [...currentUser.attendance]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const recentAttendance = getRecentAttendance();
  const thisMonthCount = getThisMonthAttendance();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{currentUser?.name?.firstname ?? ""} {currentUser?.name?.middlename ?? ""} {currentUser?.name?.lastname ?? ""}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={32} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={24} color="#2563eb" />
          <Text style={styles.statLabel}>Total Workouts</Text>
          <Text style={styles.statNumber}>{currentUser.attendanceCount || 0}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#10b981" />
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statNumber}>{thisMonthCount}</Text>
        </View>

        <View style={[styles.statCard, styles.membershipCard]}>
          <Ionicons name="ribbon" size={26} color="#2563eb" />
          <Text style={styles.statLabel}>Membership Type</Text>
          <View style={[
            styles.membershipBadge, 
            { backgroundColor: getMembershipColor(currentUser.membershipType) }
          ]}>
            <Text style={styles.membershipText}>{currentUser.membershipType}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Check-in</Text>
        </View>
        {/* Today's Workout Card */}
        {loadingWorkout ? (
          <View style={styles.workoutLoadingCard}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading today&apos;s workout...</Text>
          </View>
        ) : todaysWorkout ? (
          <View style={styles.todaysWorkoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutIconContainer}>
                <Ionicons 
                  name={getWorkoutIcon(todaysWorkout.type)} 
                  size={24} 
                  color="#2563eb" 
                />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>Today&apos;s Workout</Text>
                <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.startWorkoutButton,
                  isCheckingIn && styles.disabledButton
                ]}
                onPress={() => Alert.alert(
                  todaysWorkout.name,
                  `${todaysWorkout.description}\n\nDuration: ${todaysWorkout.estimatedDuration}\nExercises: ${todaysWorkout.exerciseCount}\nCalories: ~${todaysWorkout.totalCalories}`,
                  [
                    { text: 'View Details', onPress: () => {} },
                    { 
                      text: isCheckingIn ? 'Checking in...' : 'Start & Check-in', 
                      onPress: () => handleQuickCheckIn(),
                      style: isCheckingIn ? 'default' : 'default'
                    }
                  ]
                )}
                disabled={isCheckingIn}
              >
                {isCheckingIn ? (
                  <ActivityIndicator size={16} color="white" />
                ) : (
                  <Ionicons name="play" size={16} color="white" />
                )}
                <Text style={styles.startWorkoutText}>
                  {isCheckingIn ? 'Checking in...' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.workoutDescription}>{todaysWorkout.description}</Text>
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={14} color="#6b7280" />
                <Text style={styles.statText}>{todaysWorkout.estimatedDuration}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="barbell" size={14} color="#6b7280" />
                <Text style={styles.statText}>{todaysWorkout.exerciseCount} exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame" size={14} color="#6b7280" />
                <Text style={styles.statText}>{todaysWorkout.totalCalories} cal</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.restDayCard}>
            <View style={styles.restDayHeader}>
              <Ionicons name="bed" size={24} color="#059669" />
              <Text style={styles.restDayTitle}>Today is Rest Day</Text>
            </View>
            <Text style={styles.restDayText}>Take time to recover and prepare for tomorrow&apos;s workout!</Text>
            <TouchableOpacity 
              style={[
                styles.restDayButton,
                isCheckingIn && styles.disabledButton
              ]}
              onPress={handleQuickCheckIn}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <ActivityIndicator size={16} color="#059669" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#059669" />
              )}
              <Text style={styles.restDayButtonText}>
                {isCheckingIn ? 'Checking in...' : 'Check-in Anyway'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

        {/* Weekly Goal - Now Dynamic */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Goal</Text>
          {!editingGoal && (
            <TouchableOpacity onPress={() => setEditingGoal(true)}>
              <Ionicons name="create-outline" size={20} color="#2563eb" />
            </TouchableOpacity>
          )}
        </View>
        
        {loadingWeeklyGoal ? (
          <View style={styles.goalCard}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Loading weekly goal...</Text>
          </View>
        ) : weeklyGoal ? (
          <View style={styles.goalCard}>
            {editingGoal ? (
              <View style={styles.editGoalContainer}>
                <Text style={styles.editGoalLabel}>Set weekly workout goal (1-7):</Text>
                <View style={styles.editGoalInputRow}>
                  <TextInput
                    style={styles.goalInput}
                    value={newGoalValue}
                    onChangeText={setNewGoalValue}
                    keyboardType="number-pad"
                    maxLength={1}
                  />
                  <TouchableOpacity 
                    style={styles.saveGoalButton}
                    onPress={updateWeeklyGoal}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveGoalText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelGoalButton}
                    onPress={() => {
                      setEditingGoal(false);
                      setNewGoalValue(weeklyGoal.target.toString());
                    }}
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalText}>
                    {weeklyGoal.completed} of {weeklyGoal.target} workouts completed
                  </Text>
                  <Text style={styles.goalPercentage}>{weeklyGoal.percentage}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(weeklyGoal.percentage, 100)}%` }]} />
                </View>
                {weeklyGoal.remaining > 0 ? (
                  <Text style={styles.goalSubtext}>
                    {weeklyGoal.remaining} more workout{weeklyGoal.remaining !== 1 ? 's' : ''} to reach your goal!
                  </Text>
                ) : (
                  <View style={styles.goalAchievedContainer}>
                    <Ionicons name="trophy" size={16} color="#f59e0b" />
                    <Text style={styles.goalAchievedText}>
                      Goal achieved! Great work! 🎉
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.goalCard}>
            <Text style={styles.emptyStateText}>Unable to load weekly goal</Text>
          </View>
        )}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentAttendance.length > 0 ? (
          <View style={styles.activityContainer}>
            {recentAttendance.map((activity, index) => (
              <View key={`${activity.date}-${index}`} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityType}>{activity.dayName} Workout</Text>
                  <Text style={styles.activityDate}>
                    {formatDate(activity.date)} • {formatTime(activity.date)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              No recent activity
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Start your fitness journey today!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 45,
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  membershipCard: {
    position: 'relative',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  membershipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  membershipText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  workoutLoadingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  todaysWorkoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#eff6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginBottom: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  startWorkoutButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  startWorkoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  restDayCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  restDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  restDayText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    marginBottom: 12,
  },
  restDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  restDayButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    // marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  goalSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  goalAchievedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalAchievedText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  editGoalContainer: {
    gap: 12,
  },
  editGoalLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  editGoalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveGoalButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveGoalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelGoalButton: {
    padding: 12,
  },
});

export default DashboardScreen;