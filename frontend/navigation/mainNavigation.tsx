import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from '../screens/homeScreen';
import AttendaceRecordScreen from '../screens/attendaceRecordScreen';
import WorkoutPlanScreen from '../screens/workoutPlanScreen';
import DietRecordScreen from '../screens/dietRecordScreen';
import AccountSettingsScreen from '../screens/accountSettingScreen';

const Tab = createBottomTabNavigator();

interface MainNavigatorProps {
  user: any;
  onLogout: () => void;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ user, onLogout }) => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Attendance':
              iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
              break;
            case 'Workout':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'Diet':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = focused ? 'home' : 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60 + insets.bottom, // Add bottom inset
          paddingBottom: insets.bottom + 8, // Add bottom inset + padding
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard">
        {() => <DashboardScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen name="Attendance">
        {() => <AttendaceRecordScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen name="Workout">
        {() => <WorkoutPlanScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen name="Diet">
        {() => <DietRecordScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen name="Settings">
        {() => <AccountSettingsScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainNavigator;