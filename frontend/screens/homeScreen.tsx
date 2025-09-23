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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

interface User {
  _id?: string;
  name: string;
  email: string;
  membershipType: string;
  workoutType: string;
  attendanceCount?: number;
  joinDate?: string;
  attendance?: Array<{
    date: string;
    classType: string;
  }>;
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

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onLogout }) => {
  const [attendanceCount, setAttendanceCount] = useState(user.attendanceCount || 0);
  const [refreshing, setRefreshing] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState<Array<{
    date: string;
    classType: string;
  }>>(user.attendance ? user.attendance.slice(0, 3) : []);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [todaysWorkout, setTodaysWorkout] = useState<DayWorkout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  const workoutTypes = ['Cardio', 'Strength', 'Flexibility', 'Balance'];
  
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
      } catch (error) {
        console.error('Failed to fetch auth token from storage:', error);
      }
    };
    fetchToken();
    fetchTodaysWorkout();
  }, []);

  // Fetch today's workout
  // const fetchTodaysWorkout = async () => {
  //   setLoadingWorkout(true);
  //   try {
  //     const response = await fetch(`http://192.168.1.10:5000/api/exercises/today`);
  //     const data = await response.json();
      
  //     if (data.success && !data.isRestDay) {
  //       setTodaysWorkout(data.workout);
  //     } else if (data.isRestDay) {
  //       // Handle rest day
  //       setTodaysWorkout(null);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch today\'s workout:', error);
  //     // Set fallback workout for demo purposes
  //     setTodaysWorkout({
  //       name: 'Upper Body + Abs',
  //       type: 'Strength',
  //       description: 'Focus on chest, back, shoulders, and core',
  //       exercises: [
  //         {
  //           id: '1',
  //           name: 'Push-Ups',
  //           sets: 3,
  //           reps: '10-15',
  //           restTime: '60s',
  //           difficulty: 'Beginner',
  //           equipment: 'Bodyweight',
  //           instructions: 'Start in plank position, lower chest to ground, then push back up.',
  //           muscleGroups: ['Chest', 'Triceps', 'Shoulders']
  //         },
  //         {
  //           id: '2',
  //           name: 'Plank',
  //           sets: 3,
  //           reps: '30s hold',
  //           restTime: '30s',
  //           difficulty: 'Beginner',
  //           equipment: 'Bodyweight',
  //           instructions: 'Hold plank position with body in straight line.',
  //           muscleGroups: ['Core', 'Abs']
  //         }
  //       ],
  //       totalCalories: 200,
  //       estimatedDuration: '25 min',
  //       exerciseCount: 2
  //     });
  //   } finally {
  //     setLoadingWorkout(false);
  //   }
  // };
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

  const handleQuickCheckIn = async (classType: string) => {
    if (!authToken) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.10:5000/api/users/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ classType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAttendanceCount(data.user.attendanceCount);
        setRecentAttendance(data.user.attendance.slice(-3).reverse());
        
        Alert.alert(
          'Success!', 
          `Checked in for ${classType} class.`
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to mark attendance.');
      }
    } catch (error) {
      console.error('Attendance API error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTodaysWorkout();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <Text style={styles.userName}>{user.name}!</Text>
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
          <Text style={styles.statNumber}>{attendanceCount}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#10b981" />
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statNumber}>12</Text>
        </View>

        <View style={[styles.statCard, styles.membershipCard]}>
          <Ionicons name="ribbon" size={26} color="#2563eb" />
          <Text style={styles.statLabel}>Membership Type</Text>
          <View style={[
            styles.membershipBadge, 
            { backgroundColor: getMembershipColor(user.membershipType) }
          ]}>
            <Text style={styles.membershipText}>{user.membershipType}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Check-in</Text>
        
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
                style={styles.startWorkoutButton}
                onPress={() => Alert.alert(
                  todaysWorkout.name,
                  `${todaysWorkout.description}\n\nDuration: ${todaysWorkout.estimatedDuration}\nExercises: ${todaysWorkout.exerciseCount}\nCalories: ~${todaysWorkout.totalCalories}`,
                  [
                    { text: 'View Details', onPress: () => {} },
                    { text: 'Start Workout', onPress: () => handleQuickCheckIn(todaysWorkout.type) }
                  ]
                )}
              >
                <Ionicons name="play" size={16} color="white" />
                <Text style={styles.startWorkoutText}>Start</Text>
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
          </View>
        )}

        {/* Quick Check-in Buttons */}
        {/* <View style={styles.quickActions}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.actionCard,
                user.workoutType === type && styles.preferredAction
              ]}
              onPress={() => handleQuickCheckIn(type)}
            >
              <Ionicons 
                name={getWorkoutIcon(type)} 
                size={24} 
                color={user.workoutType === type ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[
                styles.actionText,
                user.workoutType === type && styles.preferredActionText
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}
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
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityType}>{activity.classType}</Text>
                  <Text style={styles.activityDate}>
                    {formatDate(activity.date)}
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

      {/* Weekly Goal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Goal</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalText}>3 of 5 workouts completed</Text>
            <Text style={styles.goalPercentage}>60%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.goalSubtext}>2 more workouts to reach your goal!</Text>
        </View>
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
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
  },
  actionCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  preferredAction: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  preferredActionText: {
    color: '#2563eb',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginTop: 12,
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
});

export default DashboardScreen;