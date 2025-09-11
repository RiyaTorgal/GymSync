import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from '../screens/loginScreen';
import MainNavigator from '../navigation/mainNavigation';

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

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [authToken, userData] = await AsyncStorage.multiGet(['authToken', 'userData']);
      
      if (authToken[1] && userData[1]) {
        setUser(JSON.parse(userData[1]));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {isLoggedIn && user ? (
        <MainNavigator user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default App;