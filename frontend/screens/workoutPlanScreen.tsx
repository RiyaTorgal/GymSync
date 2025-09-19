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
import { MaterialIcons } from '@expo/vector-icons';

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
  workoutType: string;
  name: string;
}

interface WorkoutPlanScreenProps {
  user: User;
}

// API configuration - replace with your backend URL
const API_BASE_URL = 'http://192.168.1.10:5000/api'; // Update this to your backend URL

const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<{ [key: string]: WorkoutPlan[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch workout plans from backend
  const fetchWorkoutPlans = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Use the correct endpoint - get exercises by type
      const response = await fetch(`${API_BASE_URL}/exercises/type/${user.workoutType}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the exercises into "plans" format
        const plans = [
          {
            id: `plan-${user.workoutType}-${Date.now()}`,
            name: `${user.workoutType} Workout Plan`,
            type: user.workoutType,
            duration: `${data.count * 5} min`, // Rough estimate
            difficulty: 'Mixed',
            caloriesBurn: `${data.count * 20}-${data.count * 30}`,
            description: `Comprehensive ${user.workoutType.toLowerCase()} workout with ${data.count} exercises`,
            exercises: data.exercises.map((ex: any) => ({
              id: ex.ID.toString(),
              name: ex.Name,
              sets: ex.Sets,
              reps: ex.Reps,
              restTime: ex.RestTime,
              difficulty: ex.Difficulty,
              equipment: ex.Equipment,
              instructions: ex.Instructions,
              muscleGroups: ex.Muscle ? ex.Muscle.split(',').map((m: string) => m.trim()) : ex.TargetMuscleGroups,
            })),
          }
        ];
        
        setWorkoutPlans({ [user.workoutType]: plans });
      } else {
        throw new Error(data.message || 'Failed to fetch workout plans');
      }
    } catch (err) {
      console.error('Error fetching workout plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout plans');
      
      // Fallback to sample data if API fails
      setWorkoutPlans({
        [user.workoutType]: [
          {
            id: 'fallback-1',
            name: `${user.workoutType} Starter`,
            type: user.workoutType,
            duration: '30 min',
            difficulty: 'Beginner',
            caloriesBurn: '200-300',
            description: 'A basic workout to get you started. Connect to the internet to load more workouts.',
            exercises: [
              {
                id: '1',
                name: 'Basic Exercise',
                sets: 3,
                reps: '10-15',
                restTime: '60s',
                difficulty: 'Beginner',
                instructions: 'Please connect to the internet to load complete exercise database.'
              }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Create custom workout plan
  const createCustomWorkout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exercises/workout-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutType: user.workoutType,
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
    fetchWorkoutPlans();
  }, [user.workoutType]);

  const onRefresh = () => {
    fetchWorkoutPlans(true);
  };

  const getWeeklySchedule = () => {
    const schedule: { [key: string]: WorkoutPlan | null } = {};
    const userPlans = workoutPlans[user.workoutType] || [];
    
    daysOfWeek.forEach((day, index) => {
      if (index < 5) { // Workout on weekdays
        schedule[day] = userPlans[index % userPlans.length] || null;
      } else if (index === 5 && userPlans.length > 0) { // Saturday - lighter workout
        schedule[day] = userPlans[0];
      } else { // Sunday - rest day or if no plans available
        schedule[day] = null;
      }
    });
    
    return schedule;
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
      case 'Cardio': return 'directions-run';
      case 'Strength': return 'fitness-center';
      case 'Flexibility': return 'accessibility';
      case 'Balance': return 'balance';
      default: return 'sports-gymnastics';
    }
  };

  const schedule = getWeeklySchedule();
  const todaysPlan = schedule[daysOfWeek[new Date().getDay() - 1]] || null;

  const startWorkout = (plan: WorkoutPlan) => {
    Alert.alert(
      'Start Workout',
      `Ready to start ${plan.name}? This will take approximately ${plan.duration}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            setSelectedPlan(plan);
            setModalVisible(true);
          }
        }
      ]
    );
  };

  const renderExercise = (exercise: Exercise, index: number) => (
    <TouchableOpacity 
      key={exercise.id}
      style={styles.exerciseItem}
      onPress={() => {
        setActiveExercise(exercise);
        setExerciseModalVisible(true);
      }}
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
          <Text style={styles.exerciseEquipment}>Equipment: {exercise.equipment}</Text>
        )}
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <Text style={styles.exerciseMuscles}>
            Targets: {exercise.muscleGroups.join(', ')}
          </Text>
        )}
      </View>
      <View style={[
        styles.difficultyBadge,
        { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
      ]}>
        <Text style={[
          styles.difficultyText,
          { color: getDifficultyColor(exercise.difficulty) }
        ]}>
          {exercise.difficulty}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDayPlan = (day: string) => {
    const plan = schedule[day];
    const isToday = day === daysOfWeek[new Date().getDay() - 1];
    const isPast = daysOfWeek.indexOf(day) < (new Date().getDay() - 1);

    return (
      <TouchableOpacity 
        key={day}
        style={[
          styles.dayPlanCard,
          isToday && styles.todayCard,
          isPast && styles.pastCard
        ]}
        disabled={!plan}
        onPress={() => plan && startWorkout(plan)}
      >
        <View style={styles.dayHeader}>
          <Text style={[styles.dayName, isToday && styles.todayText, isPast && styles.pastText]}>
            {day}
          </Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
          {plan ? (
            <Text style={styles.planDuration}>{plan.duration}</Text>
          ) : (
            <Text style={styles.restDayText}>Rest Day</Text>
          )}
        </View>
        {plan ? (
          <View style={styles.planInfo}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
            </View>
            <Text style={styles.planDuration}>{plan.description}</Text>
          </View>
        ) : (
          <View style={styles.restDay}>
            <MaterialIcons name="spa" size={16} color="#6b7280" />
            <Text style={styles.restDayText}>Take a break and recover</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderWorkoutPlan = (plan: WorkoutPlan, index: number) => (
    <View key={plan.id} style={styles.planCard}>
      <View style={styles.planCardHeader}>
        <View style={styles.planIconContainer}>
          <MaterialIcons name={getTypeIcon(plan.type)} size={24} color="#2563eb" />
        </View>
        <View style={styles.planCardContent}>
          <Text style={styles.planCardName}>{plan.name}</Text>
          <Text style={styles.planCardDetails}>{plan.type} • {plan.duration} • {plan.caloriesBurn} cal</Text>
        </View>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(plan.difficulty) + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: getDifficultyColor(plan.difficulty) }
          ]}>
            {plan.difficulty}
          </Text>
        </View>
      </View>
      <Text style={styles.planCardDescription}>{plan.description}</Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => startWorkout(plan)}
      >
        <MaterialIcons name="play-arrow" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderWarning = () => (
    <View style={styles.warningContainer}>
      <MaterialIcons name="warning" size={16} color="#d97706" />
      <Text style={styles.warningText}>
        {error}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && renderWarning()}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
          <TouchableOpacity 
            style={styles.customWorkoutButton}
            onPress={createCustomWorkout}
          >
            <MaterialIcons name="auto-awesome" size={16} color="#2563eb" />
            <Text style={styles.customWorkoutText}>Create Custom</Text>
          </TouchableOpacity>
        </View>
        {todaysPlan ? (
          <View style={styles.todaysWorkout}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{todaysPlan.name}</Text>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startWorkout(todaysPlan)}
              >
                <MaterialIcons name="play-arrow" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.workoutDetails}>
              {todaysPlan.type} • {todaysPlan.duration} • {todaysPlan.caloriesBurn} cal
            </Text>
            <Text style={styles.workoutDescription}>
              {todaysPlan.description}
            </Text>
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="fitness-center" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.exercises.length} exercises</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="whatshot" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.caloriesBurn} cal</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.duration}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.todaysWorkout}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>Rest Day</Text>
            </View>
            <Text style={styles.workoutDescription}>
              Take a break and recover. Your body needs time to rebuild and get stronger.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        <View style={styles.weeklySchedule}>
          {daysOfWeek.map(renderDayPlan)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Workout Plans</Text>
        {workoutPlans[user.workoutType]?.map(renderWorkoutPlan)}
      </View>

      {/* Workout Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedPlan?.name}</Text>
            <View style={styles.placeholder} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatText}>Duration</Text>
                <Text style={styles.modalStatValue}>{selectedPlan?.duration}</Text>
              </View>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatText}>Exercises</Text>
                <Text style={styles.modalStatValue}>{selectedPlan?.exercises.length}</Text>
              </View>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatText}>Calories</Text>
                <Text style={styles.modalStatValue}>{selectedPlan?.caloriesBurn}</Text>
              </View>
            </View>
            <Text style={styles.modalDescription}>
              {selectedPlan?.description}
            </Text>
            <Text style={styles.exercisesTitle}>Exercises</Text>
            {selectedPlan?.exercises.map(renderExercise)}
          </ScrollView>
        </View>
      </Modal>

      {/* Exercise Details Modal */}
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
              <Text style={styles.exerciseModalTitle}>{activeExercise?.name}</Text>
              <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.exerciseModalStats}>
              <View style={styles.exerciseModalStat}>
                <Text style={styles.exerciseModalStatLabel}>Sets</Text>
                <Text style={styles.exerciseModalStatValue}>{activeExercise?.sets}</Text>
              </View>
              <View style={styles.exerciseModalStat}>
                <Text style={styles.exerciseModalStatLabel}>Reps</Text>
                <Text style={styles.exerciseModalStatValue}>{activeExercise?.reps}</Text>
              </View>
              <View style={styles.exerciseModalStat}>
                <Text style={styles.exerciseModalStatLabel}>Rest</Text>
                <Text style={styles.exerciseModalStatValue}>{activeExercise?.restTime}</Text>
              </View>
              <View style={styles.exerciseModalStat}>
                <Text style={styles.exerciseModalStatLabel}>Level</Text>
                <Text style={styles.exerciseModalStatValue}>{activeExercise?.difficulty}</Text>
              </View>
            </View>
            <View style={styles.exerciseModalInstructions}>
              <Text style={styles.exerciseModalInstructionsTitle}>Instructions</Text>
              <Text style={styles.exerciseModalInstructionsText}>{activeExercise?.instructions}</Text>
            </View>
            {activeExercise?.equipment && (
              <View style={styles.exerciseModalEquipment}>
                <MaterialIcons name="fitness-center" size={16} color="#2563eb" />
                <Text style={styles.exerciseModalEquipmentText}>{activeExercise.equipment}</Text>
              </View>
            )}
            {activeExercise?.muscleGroups && activeExercise.muscleGroups.length > 0 && (
              <View style={styles.exerciseModalMuscles}>
                <MaterialIcons name="accessibility-new" size={16} color="#059669" />
                <Text style={styles.exerciseModalMusclesText}>
                  Targets: {activeExercise.muscleGroups.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400e',
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
  customWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  customWorkoutText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  todaysWorkout: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  workoutDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#2563eb',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
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
  },
  dayPlanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planInfo: {
    marginTop: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
  },
  restDayText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planCardContent: {
    flex: 1,
  },
  planCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planCardDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  planCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
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
  },
  modalStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  modalStatText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
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
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
  exerciseEquipment: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
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
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  exerciseModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseModalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  exerciseModalInstructions: {
    marginBottom: 16,
  },
  exerciseModalInstructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  exerciseModalInstructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  exerciseModalEquipment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  exerciseModalEquipmentText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  exerciseModalMuscles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
  },
  exerciseModalMusclesText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});

export default WorkoutPlanScreen;