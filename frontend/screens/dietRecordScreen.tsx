import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foods: (FoodItem & { quantity: number })[];
  time: string;
}

interface DailyNutrition {
  date: string;
  meals: Meal[];
  waterIntake: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

interface User {
  name: string;
  workoutType: string;
}

interface DietRecordScreenProps {
  user: User;
}

const DietRecordScreen: React.FC<DietRecordScreenProps> = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);

  // Sample data - in real app, this would come from API/storage
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>({
    date: selectedDate,
    meals: [
      {
        id: '1',
        type: 'Breakfast',
        time: '08:00 AM',
        foods: [
          {
            id: '1',
            name: 'Oatmeal',
            calories: 150,
            protein: 5,
            carbs: 27,
            fat: 3,
            serving: '1 cup',
            quantity: 1
          },
          {
            id: '2',
            name: 'Banana',
            calories: 105,
            protein: 1,
            carbs: 27,
            fat: 0,
            serving: '1 medium',
            quantity: 1
          }
        ]
      },
      {
        id: '2',
        type: 'Lunch',
        time: '12:30 PM',
        foods: [
          {
            id: '3',
            name: 'Grilled Chicken Breast',
            calories: 231,
            protein: 43,
            carbs: 0,
            fat: 5,
            serving: '100g',
            quantity: 1
          },
          {
            id: '4',
            name: 'Brown Rice',
            calories: 218,
            protein: 5,
            carbs: 45,
            fat: 2,
            serving: '1 cup',
            quantity: 1
          }
        ]
      }
    ],
    waterIntake: 6,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 200,
    targetFat: 65
  });

  const commonFoods: FoodItem[] = [
    { id: '1', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, serving: '1 cup' },
    { id: '2', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, serving: '1 medium' },
    { id: '3', name: 'Grilled Chicken Breast', calories: 231, protein: 43, carbs: 0, fat: 5, serving: '100g' },
    { id: '4', name: 'Brown Rice', calories: 218, protein: 5, carbs: 45, fat: 2, serving: '1 cup' },
    { id: '5', name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, serving: '1 cup' },
    { id: '6', name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, serving: '28g' },
    { id: '7', name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 12, serving: '100g' },
    { id: '8', name: 'Sweet Potato', calories: 103, protein: 2, carbs: 24, fat: 0, serving: '1 medium' },
    { id: '9', name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fat: 0, serving: '1 cup' },
    { id: '10', name: 'Eggs', calories: 78, protein: 6, carbs: 1, fat: 5, serving: '1 large' },
    { id: '11', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, serving: '1/2 medium' },
    { id: '12', name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 4, serving: '1 cup' },
  ];

  const mealTypes: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'> = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const calculateTotalNutrition = () => {
    return dailyNutrition.meals.reduce((total, meal) => {
      const mealNutrition = meal.foods.reduce((mealTotal, food) => ({
        calories: mealTotal.calories + (food.calories * food.quantity),
        protein: mealTotal.protein + (food.protein * food.quantity),
        carbs: mealTotal.carbs + (food.carbs * food.quantity),
        fat: mealTotal.fat + (food.fat * food.quantity),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'Breakfast': return 'free-breakfast';
      case 'Lunch': return 'lunch-dining';
      case 'Dinner': return 'dinner-dining';
      case 'Snack': return 'local-cafe';
      default: return 'restaurant';
    }
  };

  const getMealColor = (type: string) => {
    switch (type) {
      case 'Breakfast': return '#f59e0b';
      case 'Lunch': return '#10b981';
      case 'Dinner': return '#8b5cf6';
      case 'Snack': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const addFoodToMeal = (food: FoodItem) => {
    const updatedMeals = [...dailyNutrition.meals];
    const mealIndex = updatedMeals.findIndex(meal => meal.type === selectedMealType);
    
    if (mealIndex >= 0) {
      updatedMeals[mealIndex].foods.push({ ...food, quantity: 1 });
    } else {
      // Create new meal if it doesn't exist
      const newMeal: Meal = {
        id: Date.now().toString(),
        type: selectedMealType,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        foods: [{ ...food, quantity: 1 }]
      };
      updatedMeals.push(newMeal);
    }
    
    setDailyNutrition(prev => ({ ...prev, meals: updatedMeals }));
    setModalVisible(false);
    Alert.alert('Success', `${food.name} added to ${selectedMealType}!`);
  };

  const removeFoodFromMeal = (mealId: string, foodIndex: number) => {
    const updatedMeals = dailyNutrition.meals.map(meal => {
      if (meal.id === mealId) {
        const updatedFoods = [...meal.foods];
        updatedFoods.splice(foodIndex, 1);
        return { ...meal, foods: updatedFoods };
      }
      return meal;
    });
    
    setDailyNutrition(prev => ({ ...prev, meals: updatedMeals }));
  };

  const updateWaterIntake = (increment: boolean) => {
    const newIntake = increment ? waterIntake + 1 : Math.max(0, waterIntake - 1);
    setWaterIntake(newIntake);
    setDailyNutrition(prev => ({ ...prev, waterIntake: newIntake }));
  };

  const totalNutrition = calculateTotalNutrition();
  const calorieProgress = (totalNutrition.calories / dailyNutrition.targetCalories) * 100;
  const proteinProgress = (totalNutrition.protein / dailyNutrition.targetProtein) * 100;
  const carbsProgress = (totalNutrition.carbs / dailyNutrition.targetCarbs) * 100;
  const fatProgress = (totalNutrition.fat / dailyNutrition.targetFat) * 100;

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMeal = (meal: Meal) => (
    <View key={meal.id} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTitleContainer}>
          <View style={[
            styles.mealIconContainer,
            { backgroundColor: getMealColor(meal.type) + '20' }
          ]}>
            <Icon 
              name={getMealIcon(meal.type)} 
              size={20} 
              color={getMealColor(meal.type)} 
            />
          </View>
          <View>
            <Text style={styles.mealType}>{meal.type}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedMealType(meal.type);
            setModalVisible(true);
          }}
        >
          <Icon name="add" size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>
      
      {meal.foods.length > 0 ? (
        <>
          {meal.foods.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <View style={styles.foodContent}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodDetails}>
                  {food.serving} • {Math.round(food.calories * food.quantity)} cal
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFoodFromMeal(meal.id, index)}
              >
                <Icon name="close" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.mealSummary}>
            <Text style={styles.mealSummaryText}>
              Total: {Math.round(meal.foods.reduce((sum, food) => 
                sum + (food.calories * food.quantity), 0
              ))} calories
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyMeal}>
          <Text style={styles.emptyMealText}>No foods added yet</Text>
        </View>
      )}
    </View>
  );

  const renderNutritionProgress = (label: string, current: number, target: number, progress: number, color: string) => (
    <View style={styles.nutritionItem}>
      <View style={styles.nutritionHeader}>
        <Text style={styles.nutritionLabel}>{label}</Text>
        <Text style={styles.nutritionValues}>
          {Math.round(current)}/{target}g
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min(100, progress)}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={[styles.progressPercentage, { color }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Diet Record</Text>
        <Text style={styles.subtitle}>Track your nutrition and meals</Text>
      </View>

      {/* Daily Summary */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <View style={styles.calorieSection}>
            <Text style={styles.calorieNumber}>
              {Math.round(totalNutrition.calories)}
            </Text>
            <Text style={styles.calorieTarget}>
              / {dailyNutrition.targetCalories} cal
            </Text>
            <View style={styles.calorieProgressContainer}>
              <View style={styles.calorieProgressBackground}>
                <View 
                  style={[
                    styles.calorieProgressFill, 
                    { width: `${Math.min(100, calorieProgress)}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.remainingCalories}>
              {dailyNutrition.targetCalories - totalNutrition.calories > 0
                ? `${Math.round(dailyNutrition.targetCalories - totalNutrition.calories)} calories remaining`
                : `${Math.round(totalNutrition.calories - dailyNutrition.targetCalories)} calories over`
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Macronutrients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>
        <View style={styles.macroCard}>
          {renderNutritionProgress('Protein', totalNutrition.protein, dailyNutrition.targetProtein, proteinProgress, '#ef4444')}
          {renderNutritionProgress('Carbs', totalNutrition.carbs, dailyNutrition.targetCarbs, carbsProgress, '#10b981')}
          {renderNutritionProgress('Fat', totalNutrition.fat, dailyNutrition.targetFat, fatProgress, '#f59e0b')}
        </View>
      </View>

      {/* Water Intake */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Water Intake</Text>
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Icon name="local-drink" size={24} color="#2563eb" />
            <Text style={styles.waterText}>
              {waterIntake} / 8 glasses
            </Text>
          </View>
          <View style={styles.waterControls}>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={() => updateWaterIntake(false)}
            >
              <Icon name="remove" size={20} color="#6b7280" />
            </TouchableOpacity>
            <View style={styles.waterGlasses}>
              {[...Array(8)].map((_, index) => (
                <Icon
                  key={index}
                  name="local-drink"
                  size={20}
                  color={index < waterIntake ? '#2563eb' : '#e5e7eb'}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.waterButton}
              onPress={() => updateWaterIntake(true)}
            >
              <Icon name="add" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Meals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meals</Text>
        {mealTypes.map(type => {
          const meal = dailyNutrition.meals.find(m => m.type === type);
          return meal ? renderMeal(meal) : (
            <View key={type} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleContainer}>
                  <View style={[
                    styles.mealIconContainer,
                    { backgroundColor: getMealColor(type) + '20' }
                  ]}>
                    <Icon 
                      name={getMealIcon(type)} 
                      size={20} 
                      color={getMealColor(type)} 
                    />
                  </View>
                  <Text style={styles.mealType}>{type}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setSelectedMealType(type);
                    setModalVisible(true);
                  }}
                >
                  <Icon name="add" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
              <View style={styles.emptyMeal}>
                <Text style={styles.emptyMealText}>No foods added yet</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Add Food Modal */}
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
            <Text style={styles.modalTitle}>Add to {selectedMealType}</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for foods..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView style={styles.foodList}>
            {filteredFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodSelectItem}
                onPress={() => addFoodToMeal(food)}
              >
                <View style={styles.foodSelectContent}>
                  <Text style={styles.foodSelectName}>{food.name}</Text>
                  <Text style={styles.foodSelectDetails}>
                    {food.serving} • {food.calories} cal
                  </Text>
                  <Text style={styles.foodSelectMacros}>
                    P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                  </Text>
                </View>
                <Icon name="add-circle-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calorieSection: {
    alignItems: 'center',
    width: '100%',
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  calorieTarget: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  calorieProgressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  calorieProgressBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  calorieProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  remainingCalories: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  macroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionItem: {
    marginBottom: 20,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  nutritionValues: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  waterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlasses: {
    flexDirection: 'row',
    gap: 8,
  },
  mealCard: {
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mealTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  foodContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  foodDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  mealSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  mealSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
  },
  emptyMeal: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  foodList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  foodSelectContent: {
    flex: 1,
  },
  foodSelectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  foodSelectDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  foodSelectMacros: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default DietRecordScreen;