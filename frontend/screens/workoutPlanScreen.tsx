import React, { 
    useState, 
    // useEffect 
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment?: string;
  instructions: string;
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

const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
//   const [selectedDay, setSelectedDay] = useState('Monday');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const workoutPlans: { [key: string]: WorkoutPlan[] } = {
    Cardio: [
      {
        id: '1',
        name: 'HIIT Cardio Blast',
        type: 'Cardio',
        duration: '30 min',
        difficulty: 'Intermediate',
        caloriesBurn: '300-400',
        description: 'High-intensity interval training to boost your metabolism',
        exercises: [
          {
            id: '1',
            name: 'Jumping Jacks',
            sets: 3,
            reps: '30 seconds',
            restTime: '10 seconds',
            difficulty: 'Beginner',
            instructions: 'Jump with feet apart while raising arms overhead, then return to starting position.'
          },
          {
            id: '2',
            name: 'High Knees',
            sets: 3,
            reps: '30 seconds',
            restTime: '10 seconds',
            difficulty: 'Beginner',
            instructions: 'Run in place lifting knees as high as possible.'
          },
          {
            id: '3',
            name: 'Burpees',
            sets: 3,
            reps: '10-15',
            restTime: '30 seconds',
            difficulty: 'Advanced',
            instructions: 'Squat down, jump back to plank, do a push-up, jump feet forward, then jump up.'
          },
          {
            id: '4',
            name: 'Mountain Climbers',
            sets: 3,
            reps: '30 seconds',
            restTime: '15 seconds',
            difficulty: 'Intermediate',
            instructions: 'Start in plank position, alternate bringing knees to chest rapidly.'
          }
        ]
      },
      {
        id: '2',
        name: 'Steady State Cardio',
        type: 'Cardio',
        duration: '45 min',
        difficulty: 'Beginner',
        caloriesBurn: '250-350',
        description: 'Low-impact steady-state cardio for endurance building',
        exercises: [
          {
            id: '5',
            name: 'Brisk Walking',
            sets: 1,
            reps: '20 minutes',
            restTime: 'None',
            difficulty: 'Beginner',
            instructions: 'Maintain a brisk pace that allows conversation but feels challenging.'
          },
          {
            id: '6',
            name: 'Stationary Bike',
            sets: 1,
            reps: '15 minutes',
            restTime: 'None',
            difficulty: 'Beginner',
            equipment: 'Exercise Bike',
            instructions: 'Maintain moderate resistance and steady pace.'
          },
          {
            id: '7',
            name: 'Elliptical',
            sets: 1,
            reps: '10 minutes',
            restTime: 'None',
            difficulty: 'Beginner',
            equipment: 'Elliptical Machine',
            instructions: 'Use arms and legs together for full-body movement.'
          }
        ]
      }
    ],
    Strength: [
      {
        id: '3',
        name: 'Upper Body Power',
        type: 'Strength',
        duration: '45 min',
        difficulty: 'Intermediate',
        caloriesBurn: '200-300',
        description: 'Build upper body strength and muscle definition',
        exercises: [
          {
            id: '8',
            name: 'Push-ups',
            sets: 3,
            reps: '10-15',
            restTime: '60 seconds',
            difficulty: 'Beginner',
            instructions: 'Keep body straight, lower chest to ground, push back up.'
          },
          {
            id: '9',
            name: 'Dumbbell Rows',
            sets: 3,
            reps: '12-15',
            restTime: '60 seconds',
            difficulty: 'Intermediate',
            equipment: 'Dumbbells',
            instructions: 'Bend over, pull weights to chest, squeeze shoulder blades.'
          },
          {
            id: '10',
            name: 'Shoulder Press',
            sets: 3,
            reps: '10-12',
            restTime: '90 seconds',
            difficulty: 'Intermediate',
            equipment: 'Dumbbells',
            instructions: 'Press weights overhead from shoulder level.'
          },
          {
            id: '11',
            name: 'Tricep Dips',
            sets: 3,
            reps: '8-12',
            restTime: '60 seconds',
            difficulty: 'Intermediate',
            equipment: 'Chair/Bench',
            instructions: 'Lower body by bending arms, push back up using triceps.'
          }
        ]
      },
      {
        id: '4',
        name: 'Lower Body Blast',
        type: 'Strength',
        duration: '40 min',
        difficulty: 'Intermediate',
        caloriesBurn: '250-350',
        description: 'Strengthen and tone your legs and glutes',
        exercises: [
          {
            id: '12',
            name: 'Squats',
            sets: 3,
            reps: '15-20',
            restTime: '60 seconds',
            difficulty: 'Beginner',
            instructions: 'Lower body as if sitting in chair, keep knees behind toes.'
          },
          {
            id: '13',
            name: 'Lunges',
            sets: 3,
            reps: '12 each leg',
            restTime: '60 seconds',
            difficulty: 'Intermediate',
            instructions: 'Step forward, lower back knee toward ground, push back up.'
          },
          {
            id: '14',
            name: 'Deadlifts',
            sets: 3,
            reps: '10-12',
            restTime: '90 seconds',
            difficulty: 'Advanced',
            equipment: 'Dumbbells/Barbell',
            instructions: 'Hinge at hips, lower weights while keeping back straight.'
          },
          {
            id: '15',
            name: 'Calf Raises',
            sets: 3,
            reps: '15-20',
            restTime: '45 seconds',
            difficulty: 'Beginner',
            instructions: 'Rise up on toes, squeeze calves, lower slowly.'
          }
        ]
      }
    ],
    Flexibility: [
      {
        id: '5',
        name: 'Full Body Stretch',
        type: 'Flexibility',
        duration: '25 min',
        difficulty: 'Beginner',
        caloriesBurn: '50-100',
        description: 'Improve flexibility and reduce muscle tension',
        exercises: [
          {
            id: '16',
            name: 'Cat-Cow Stretch',
            sets: 1,
            reps: '10 reps',
            restTime: 'None',
            difficulty: 'Beginner',
            instructions: 'On hands and knees, arch and round spine alternately.'
          },
          {
            id: '17',
            name: 'Downward Dog',
            sets: 1,
            reps: '30 seconds',
            restTime: '10 seconds',
            difficulty: 'Beginner',
            instructions: 'Form inverted V-shape with body, press heels down.'
          },
          {
            id: '18',
            name: 'Hip Flexor Stretch',
            sets: 2,
            reps: '30 seconds each side',
            restTime: '15 seconds',
            difficulty: 'Beginner',
            instructions: 'Lunge position, push hips forward to stretch front of hip.'
          },
          {
            id: '19',
            name: 'Hamstring Stretch',
            sets: 2,
            reps: '30 seconds each leg',
            restTime: '15 seconds',
            difficulty: 'Beginner',
            instructions: 'Sit with one leg extended, reach toward toes.'
          }
        ]
      }
    ],
    Balance: [
      {
        id: '6',
        name: 'Core & Balance',
        type: 'Balance',
        duration: '35 min',
        difficulty: 'Intermediate',
        caloriesBurn: '150-250',
        description: 'Improve core stability and balance',
        exercises: [
          {
            id: '20',
            name: 'Single Leg Stand',
            sets: 3,
            reps: '30 seconds each leg',
            restTime: '30 seconds',
            difficulty: 'Beginner',
            instructions: 'Stand on one leg, maintain balance without support.'
          },
          {
            id: '21',
            name: 'Plank',
            sets: 3,
            reps: '30-60 seconds',
            restTime: '60 seconds',
            difficulty: 'Intermediate',
            instructions: 'Hold straight line from head to heels.'
          },
          {
            id: '22',
            name: 'Tree Pose',
            sets: 2,
            reps: '30 seconds each side',
            restTime: '30 seconds',
            difficulty: 'Intermediate',
            instructions: 'Stand on one leg, place other foot on inner thigh.'
          },
          {
            id: '23',
            name: 'Bird Dog',
            sets: 3,
            reps: '10 each side',
            restTime: '45 seconds',
            difficulty: 'Intermediate',
            instructions: 'On hands and knees, extend opposite arm and leg.'
          }
        ]
      }
    ]
  };

  const getWeeklySchedule = () => {
    const schedule: { [key: string]: WorkoutPlan | null } = {};
    const userPlans = workoutPlans[user.workoutType] || [];
    
    daysOfWeek.forEach((day, index) => {
      if (index < 5) { // Workout on weekdays
        schedule[day] = userPlans[index % userPlans.length] || null;
      } else if (index === 5) { // Saturday - lighter workout
        schedule[day] = userPlans[0] || null;
      } else { // Sunday - rest day
        schedule[day] = null;
      }
    });
    
    return schedule;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
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
        onPress={() => plan && startWorkout(plan)}
        disabled={!plan}
      >
        <View style={styles.dayHeader}>
          <Text style={[
            styles.dayName,
            isToday && styles.todayText,
            isPast && styles.pastText
          ]}>
            {day}
          </Text>
          {isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
        </View>
        
        {plan ? (
          <View style={styles.planInfo}>
            <View style={styles.planHeader}>
              <Icon 
                name={getTypeIcon(plan.type)} 
                size={20} 
                color={isToday ? '#2563eb' : '#6b7280'} 
              />
              <Text style={[
                styles.planName,
                isToday && styles.todayText,
                isPast && styles.pastText
              ]}>
                {plan.name}
              </Text>
            </View>
            <Text style={[
              styles.planDuration,
              isPast && styles.pastText
            ]}>
              {plan.duration} • {plan.exercises.length} exercises
            </Text>
          </View>
        ) : (
          <View style={styles.restDay}>
            <Icon name="spa" size={20} color="#6b7280" />
            <Text style={styles.restDayText}>Rest Day</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plans</Text>
        <Text style={styles.subtitle}>Personalized for {user.workoutType.toLowerCase()} training</Text>
      </View>

      {/* Today's Workout */}
      {todaysPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
          <View style={styles.todaysWorkout}>
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutName}>{todaysPlan.name}</Text>
                <Text style={styles.workoutDetails}>
                  {todaysPlan.duration} • {todaysPlan.exercises.length} exercises • {todaysPlan.caloriesBurn} cal
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startWorkout(todaysPlan)}
              >
                <Icon name="play-arrow" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.workoutDescription}>{todaysPlan.description}</Text>
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.type}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color="#6b7280" />
                <Text style={styles.statText}>{todaysPlan.caloriesBurn} cal</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Weekly Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        <View style={styles.weeklySchedule}>
          {daysOfWeek.map(renderDayPlan)}
        </View>
      </View>

      {/* All Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All {user.workoutType} Plans</Text>
        {(workoutPlans[user.workoutType] || []).map(plan => (
          <TouchableOpacity 
            key={plan.id}
            style={styles.planCard}
            onPress={() => startWorkout(plan)}
          >
            <View style={styles.planCardHeader}>
              <View style={styles.planIconContainer}>
                <Icon name={getTypeIcon(plan.type)} size={24} color="#2563eb" />
              </View>
              <View style={styles.planCardContent}>
                <Text style={styles.planCardName}>{plan.name}</Text>
                <Text style={styles.planCardDetails}>
                  {plan.duration} • {plan.exercises.length} exercises
                </Text>
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
          </TouchableOpacity>
        ))}
      </View>

      {/* Workout Detail Modal */}
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
              <Icon name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedPlan?.name}</Text>
            <View style={styles.placeholder} />
          </View>
          
          {selectedPlan && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <Icon name="schedule" size={20} color="#6b7280" />
                  <Text style={styles.modalStatText}>{selectedPlan.duration}</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="fitness-center" size={20} color="#6b7280" />
                  <Text style={styles.modalStatText}>{selectedPlan.exercises.length} exercises</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="local-fire-department" size={20} color="#6b7280" />
                  <Text style={styles.modalStatText}>{selectedPlan.caloriesBurn} cal</Text>
                </View>
              </View>
              
              <Text style={styles.modalDescription}>{selectedPlan.description}</Text>
              
              <Text style={styles.exercisesTitle}>Exercises</Text>
              {selectedPlan.exercises.map((exercise, index) => 
                renderExercise(exercise, index)
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Exercise Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exerciseModalVisible}
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View style={styles.exerciseModalOverlay}>
          <View style={styles.exerciseModalContainer}>
            <View style={styles.exerciseModalHeader}>
              <Text style={styles.exerciseModalTitle}>{activeExercise?.name}</Text>
              <TouchableOpacity 
                onPress={() => setExerciseModalVisible(false)}
              >
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {activeExercise && (
              <>
                <View style={styles.exerciseModalStats}>
                  <View style={styles.exerciseModalStat}>
                    <Text style={styles.exerciseModalStatLabel}>Sets</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.sets}</Text>
                  </View>
                  <View style={styles.exerciseModalStat}>
                    <Text style={styles.exerciseModalStatLabel}>Reps/Time</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.reps}</Text>
                  </View>
                  <View style={styles.exerciseModalStat}>
                    <Text style={styles.exerciseModalStatLabel}>Rest</Text>
                    <Text style={styles.exerciseModalStatValue}>{activeExercise.restTime}</Text>
                  </View>
                </View>
                
                <View style={styles.exerciseModalInstructions}>
                  <Text style={styles.exerciseModalInstructionsTitle}>Instructions</Text>
                  <Text style={styles.exerciseModalInstructionsText}>
                    {activeExercise.instructions}
                  </Text>
                </View>
                
                {activeExercise.equipment && (
                  <View style={styles.exerciseModalEquipment}>
                    <Icon name="fitness-center" size={16} color="#6b7280" />
                    <Text style={styles.exerciseModalEquipmentText}>
                      Equipment: {activeExercise.equipment}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
  },
  exerciseModalStat: {
    alignItems: 'center',
  },
  exerciseModalStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
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
  },
  exerciseModalEquipmentText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
});

export default WorkoutPlanScreen;