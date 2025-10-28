import React, { 
    useState, 
    useEffect 
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Expo's built-in icons

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

interface WorkoutSchedule {
  [key: string]: DayWorkout;
}

interface WorkoutPlan {
  id: string;
  name: string;
  type: string;
  duration: string;
  difficulty: string;
  exercises: Exercise[];
  description: string;
  caloriesBurn: string;
}

interface User {
  // name: string;
    name: {
    firstname: string;
    middlename?: string;
    lastname: string;
  };
}

interface WorkoutPlanScreenProps {
  user: User;
}

// API configuration - replace with your backend URL
const API_BASE_URL = 'http://192.168.1.10:5000/api';

const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<WorkoutSchedule>({});
  const [todaysWorkout, setTodaysWorkout] = useState<DayWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch weekly schedule from backend
  const fetchWeeklySchedule = async (refresh = false) => {
    try {
      console.log('🔄 Fetching weekly schedule...');
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`${API_BASE_URL}/exercises/weekly-schedule`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📦 Response data keys:', Object.keys(data));
      
      if (data.success) {
        setWeeklySchedule(data.schedule);
        
        // Get today's workout
        const today = new Date();
        const todayIndex = (today.getDay() + 6) % 7; // Adjust for Monday as 0
        const todayName = daysOfWeek[todayIndex];
        const todayWorkout = data.schedule[todayName] || null;
        setTodaysWorkout(todayWorkout);
        console.log(`✅ Today's workout: ${todayName}`, todayWorkout);
      } else {
        throw new Error(data.message || 'Failed to fetch weekly schedule');
      }
    } catch (err) {
      console.error('Error fetching weekly schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly schedule');
      
      // Enhanced fallback schedule with sample data
      const fallbackSchedule: WorkoutSchedule = {
        Monday: { 
          name: 'Legs Day', 
          type: 'Strength', 
          description: 'Focus on quadriceps, hamstrings, and glutes', 
          exercises: [
            {
              id: '1',
              name: 'Bodyweight Squat',
              sets: 3,
              reps: '12-15',
              restTime: '60s',
              difficulty: 'Beginner',
              equipment: 'Bodyweight',
              instructions: 'Stand with feet shoulder-width apart, lower hips as if sitting back into a chair, then stand up.',
              muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings']
            },
            {
              id: '2',
              name: 'Lunges',
              sets: 3,
              reps: '10 per leg',
              restTime: '45s',
              difficulty: 'Beginner-Intermediate',
              equipment: 'Bodyweight',
              instructions: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees, then push back to start.',
              muscleGroups: ['Quadriceps', 'Glutes']
            }
          ],
          totalCalories: 250,
          estimatedDuration: '25 min',
          exerciseCount: 2 
        },
        Tuesday: { 
          name: 'Upper Body + Abs', 
          type: 'Strength', 
          description: 'Focus on chest, back, shoulders, and core', 
          exercises: [
            {
              id: '3',
              name: 'Push-Ups',
              sets: 3,
              reps: '10-15',
              restTime: '60s',
              difficulty: 'Beginner',
              equipment: 'Bodyweight',
              instructions: 'Start in plank position, lower chest to ground, then push back up.',
              muscleGroups: ['Chest', 'Triceps', 'Shoulders']
            }
          ],
          totalCalories: 200,
          estimatedDuration: '20 min',
          exerciseCount: 1 
        },
        Wednesday: { 
          name: 'Inner & Outer Thighs + Back', 
          type: 'Strength', 
          description: 'Target inner/outer thighs and back muscles', 
          exercises: [],
          totalCalories: 0,
          estimatedDuration: '30 min',
          exerciseCount: 0 
        },
        Thursday: { 
          name: 'Core + Cardio', 
          type: 'Mixed', 
          description: 'Core strengthening and cardiovascular training', 
          exercises: [
            {
              id: '4',
              name: 'Plank',
              sets: 3,
              reps: '30s hold',
              restTime: '30s',
              difficulty: 'Beginner',
              equipment: 'Bodyweight',
              instructions: 'Hold plank position with body in straight line from head to heels.',
              muscleGroups: ['Core', 'Abs']
            }
          ],
          totalCalories: 180,
          estimatedDuration: '20 min',
          exerciseCount: 1 
        },
        Friday: { 
          name: 'Legs Day', 
          type: 'Strength', 
          description: 'Focus on quadriceps, hamstrings, and glutes', 
          exercises: [],
          totalCalories: 0,
          estimatedDuration: '30 min',
          exerciseCount: 0 
        },
        Saturday: { 
          name: 'Upper Body + Abs', 
          type: 'Strength', 
          description: 'Upper body focus with core work', 
          exercises: [],
          totalCalories: 0,
          estimatedDuration: '30 min',
          exerciseCount: 0 
        },
        Sunday: { 
          name: 'Rest Day', 
          type: 'Rest', 
          description: 'Recovery and active rest day', 
          exercises: [], 
          totalCalories: 0, 
          estimatedDuration: '0 min', 
          exerciseCount: 0 
        }
      };
      setWeeklySchedule(fallbackSchedule);
      
      const today = new Date();
      const todayIndex = (today.getDay() + 6) % 7;
      const todayName = daysOfWeek[todayIndex];
      setTodaysWorkout(fallbackSchedule[todayName] || null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch today's workout specifically
  // const fetchTodaysWorkout = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/exercises/today`);
  //     const data = await response.json();
      
  //     if (data.success && !data.isRestDay) {
  //       setTodaysWorkout(data.workout);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching today\'s workout:', err);
  //   }
  // };

  // Create custom workout plan
  const createCustomWorkout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercises/workout-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutType: 'Strength',
          difficulty: 'Intermediate',
          duration: 30,
          exerciseCount: 6
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Custom Workout Created',
          'A new personalized workout has been generated for you!',
          [
            { text: 'View Now', onPress: () => startWorkout(data.workoutPlan) },
            { text: 'Later', style: 'cancel' }
          ]
        );
      }
    } catch (err) {
      console.error('Error creating custom workout:', err);
      Alert.alert('Error', 'Failed to create custom workout. Please try again.');
    }
  };

  useEffect(() => {
    fetchWeeklySchedule();
  }, []);

  const onRefresh = () => {
    fetchWeeklySchedule(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Beginner-Intermediate': return '#059669';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cardio': return 'speedometer';
      case 'Strength': return 'barbell';
      case 'Flexibility': return 'body';
      case 'Mixed': return 'git-branch';
      case 'Rest': return 'bed';
      default: return 'apps';
    }
  };

  const startWorkout = (plan: WorkoutPlan | DayWorkout) => {
    // Convert DayWorkout to WorkoutPlan format if needed
    if ('totalCalories' in plan) {
      // It's a DayWorkout, convert to WorkoutPlan
      const workoutPlan: WorkoutPlan = {
        id: `day-${plan.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: plan.name,
        type: plan.type,
        duration: plan.estimatedDuration,
        difficulty: 'Mixed',
        exercises: plan.exercises,
        description: plan.description,
        caloriesBurn: `${plan.totalCalories}-${Math.ceil(plan.totalCalories * 1.3)}`,
      };
      setSelectedPlan(workoutPlan);
    } else {
      // It's already a WorkoutPlan
      setSelectedPlan(plan);
    }
    setModalVisible(true);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        // contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Workout Plans</Text>
          <Text style={styles.subtitle}>Hi {user?.name?.firstname}, here&apos;s your weekly schedule</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loading} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={48} color="#ef4444" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.weeklySchedule}>
            {daysOfWeek.map((day, index) => {
              const dayWorkout = weeklySchedule[day];
              const today = new Date();
              const todayIndex = (today.getDay() + 6) % 7;
              const isToday = index === todayIndex;
              const isPast = index < todayIndex;

              return (
                <View
                  key={day}
                  style={[
                    styles.dayPlanCard,
                    isToday && styles.todayCard,
                    isPast && styles.pastCard,
                  ]}
                >
                  <View style={styles.dayHeader}>
                    <Text style={[styles.dayName, isToday && styles.todayText, isPast && styles.pastText]}>
                      {day}
                    </Text>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Ionicons name="star" size={12} color="white" />
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                  </View>

                  {dayWorkout.type === 'Rest' ? (
                    <View style={styles.restDay}>
                      <Ionicons name="bed-outline" size={20} color="#059669" />
                      <Text style={styles.restDayText}>{dayWorkout.description}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.planInfo}
                      onPress={() => startWorkout(dayWorkout)}
                      disabled={isPast}
                    >
                      <View style={styles.planHeader}>
                        <View style={styles.typeIconContainer}>
                          <Ionicons 
                            name={getTypeIcon(dayWorkout.type)} 
                            size={20} 
                            color="#2563eb" 
                          />
                        </View>
                        <View style={styles.planTextContainer}>
                          <Text style={styles.planName}>{dayWorkout.name}</Text>
                          <Text style={styles.planDuration}>{dayWorkout.estimatedDuration}</Text>
                        </View>
                      </View>
                      <Text style={styles.workoutDescription}>{dayWorkout.description}</Text>
                      <View style={styles.workoutStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="flame-outline" size={16} color="#6b7280" />
                          <Text style={styles.statText}>{dayWorkout.totalCalories} cal</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="barbell-outline" size={16} color="#6b7280" />
                          <Text style={styles.statText}>{dayWorkout.exerciseCount} exercises</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.screenPadding}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={createCustomWorkout}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Create Custom Workout</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal
        animationType="fade"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            {selectedPlan && <Text style={styles.modalTitle}>{selectedPlan.name}</Text>}
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedPlan && (
              <>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="apps-outline" size={16} color="#6b7280" />
                    <Text style={styles.modalStatText}>Type</Text>
                    <Text style={styles.modalStatValue}>{selectedPlan.type}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.modalStatText}>Duration</Text>
                    <Text style={styles.modalStatValue}>{selectedPlan.duration}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="flame-outline" size={16} color="#6b7280" />
                    <Text style={styles.modalStatText}>Calories</Text>
                    <Text style={styles.modalStatValue}>{selectedPlan.caloriesBurn}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="trophy-outline" size={16} color="#6b7280" />
                    <Text style={styles.modalStatText}>Difficulty</Text>
                    <Text style={styles.modalStatValue}>{selectedPlan.difficulty}</Text>
                  </View>
                </View>

                <Text style={styles.modalDescription}>{selectedPlan.description}</Text>

                <Text style={styles.exercisesTitle}>
                  <Ionicons name="list" size={20} color="#1f2937" style={styles.exercisesTitleIcon} />
                  Exercises
                </Text>

                {selectedPlan.exercises.length > 0 ? (
                  selectedPlan.exercises.map((exercise, index) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseItem}
                      onPress={() => {
                        setActiveExercise(exercise);
                        setExerciseModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.exerciseContent}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} • Rest: {exercise.restTime}
                        </Text>
                        {exercise.equipment && (
                          <View style={styles.exerciseEquipmentRow}>
                            <Ionicons name="construct-outline" size={12} color="#2563eb" />
                            <Text style={styles.exerciseEquipment}>Equipment: {exercise.equipment}</Text>
                          </View>
                        )}
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                          <View style={styles.exerciseMusclesRow}>
                            <Ionicons name="body-outline" size={12} color="#059669" />
                            <Text style={styles.exerciseMuscles}>Muscles: {exercise.muscleGroups.join(', ')}</Text>
                          </View>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noExercisesContainer}>
                    <Ionicons name="sad-outline" size={48} color="#9ca3af" />
                    <Text style={styles.noExercisesText}>No exercises available for this workout</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
        </View>
      </Modal>

      {/* Exercise Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.exerciseModalOverlay} 
          activeOpacity={1}
          onPress={() => setExerciseModalVisible(false)}
        >
          <View style={styles.exerciseModalContainer}>
            <View style={styles.exerciseModalHeader}>
              {activeExercise && (
                <>
                  <Text style={styles.exerciseModalTitle}>{activeExercise.name}</Text>
                  <TouchableOpacity 
                    onPress={() => setExerciseModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#1f2937" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {activeExercise && (
              <View style={styles.exerciseModalContent}>
                <View style={styles.exerciseModalStats}>
                  <View style={styles.exerciseModalStat}>
                    <Ionicons name="layers-outline" size={16} color="#6b7280" />
                    <Text style={styles.exerciseModalStatLabel}>Sets</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.sets}</Text>
                  </View>
                  <View style={styles.exerciseModalStat}>
                    <Ionicons name="repeat-outline" size={16} color="#6b7280" />
                    <Text style={styles.exerciseModalStatLabel}>Reps</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.reps}</Text>
                  </View>
                  <View style={styles.exerciseModalStat}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.exerciseModalStatLabel}>Rest</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.restTime}</Text>
                  </View>
                  <View style={styles.exerciseModalStat}>
                    <Ionicons name={getDifficultyIcon(activeExercise.difficulty)} size={16} color={getDifficultyColor(activeExercise.difficulty)} />
                    <Text style={styles.exerciseModalStatLabel}>Difficulty</Text>
                    <Text style={[styles.exerciseModalStatValue, { color: getDifficultyColor(activeExercise.difficulty) }]}>
                      {activeExercise.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.exerciseModalInstructions}>
                  <Text style={styles.exerciseModalInstructionsTitle}>
                    <Ionicons name="book-outline" size={16} color="#1f2937" />
                    Instructions
                  </Text>
                  <Text style={styles.exerciseModalInstructionsText}>{activeExercise.instructions}</Text>
                </View>

                {activeExercise.equipment && (
                  <View style={styles.exerciseModalEquipment}>
                    <Ionicons name="construct-outline" size={20} color="#2563eb" />
                    <View style={styles.equipmentContent}>
                      <Text style={styles.exerciseModalEquipmentTitle}>Equipment</Text>
                      <Text style={styles.exerciseModalEquipmentText}>{activeExercise.equipment}</Text>
                    </View>
                  </View>
                )}

                {activeExercise.muscleGroups && activeExercise.muscleGroups.length > 0 && (
                  <View style={styles.exerciseModalMuscles}>
                    <Ionicons name="body-outline" size={20} color="#059669" />
                    <View style={styles.musclesContent}>
                      <Text style={styles.exerciseModalMusclesTitle}>Target Muscles</Text>
                      <Text style={styles.exerciseModalMusclesText}>{activeExercise.muscleGroups.join(', ')}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Helper function for difficulty icons
const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'star-outline';
    case 'Beginner-Intermediate': return 'star-half-outline';
    case 'Intermediate': return 'star';
    case 'Advanced': return 'star';
    default: return 'help-circle-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    // padding: 20,
    paddingBottom: 100,
  },
  screenPadding:{
    padding: 20,
  },
  header: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    padding: 20,
    marginBottom: 24,
    paddingTop: 45,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  loading: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 20,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    // marginTop: 24,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginLeft: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
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
  weeklySchedule: {
    gap: 12,
    paddingTop: -10,
    padding: 20,
  },
  dayPlanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  pastCard: {
    opacity: 0.6,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  todayText: {
    color: '#2563eb',
  },
  pastText: {
    color: '#9ca3af',
  },
  todayBadge: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planInfo: {
    marginTop: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTextContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  restDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
  },
  restDayText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 70,
    borderRadius: 20,
    // backgroundColor: '',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    // paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  modalStatItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 70,
  },
  modalStatText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exercisesTitleIcon: {
    marginLeft: 2,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseEquipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#2563eb',
  },
  exerciseMusclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: '#059669',
  },
  noExercisesContainer: {
    alignItems: 'center',
    padding: 40,
    opacity: 0.5,
  },
  noExercisesText: {
    marginTop: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  exerciseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exerciseModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exerciseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  exerciseModalContent: {
    padding: 20,
  },
  exerciseModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  exerciseModalStat: {
    alignItems: 'center',
    marginBottom: 8,
    minWidth: 70,
  },
  exerciseModalStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  exerciseModalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  exerciseModalInstructions: {
    marginBottom: 20,
  },
  exerciseModalInstructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseModalInstructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  exerciseModalEquipment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  exerciseModalEquipmentTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseModalEquipmentText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  equipmentContent: {
    flex: 1,
  },
  exerciseModalMuscles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
  },
  exerciseModalMusclesTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseModalMusclesText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  musclesContent: {
    flex: 1,
  },
});

export default WorkoutPlanScreen;