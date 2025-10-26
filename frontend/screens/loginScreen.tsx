import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onLogin: (user: any, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    membershipType: 'Monthly',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        Alert.alert('Success', 'Logged in successfully!');
        onLogin(data.user, data.token);
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          membershipType: formData.membershipType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        Alert.alert('Success', 'Account created successfully!');
        onLogin(data.user, data.token);
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>GymSync</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </Text>
          {isSignUp && (
            <Text style={styles.scheduleInfo}>
              Follow our structured weekly workout schedule designed for optimal results
            </Text>
          )}
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                editable={!loading}
              />
            </View>
          )}

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Membership Type</Text>
              <View style={[styles.pickerContainer, loading && styles.disabled]}>
                <Picker
                  selectedValue={formData.membershipType}
                  onValueChange={(value) => handleInputChange('membershipType', value)}
                  style={styles.picker}
                  enabled={!loading}
                >
                  <Picker.Item label="Monthly" value="Monthly" />
                  <Picker.Item label="Quarterly" value="Quarterly" />
                  <Picker.Item label="Annual" value="Annual" />
                </Picker>
              </View>
            </View>
          )}

          {isSignUp && (
            <View style={styles.weeklySchedule}>
              <Text style={styles.scheduleTitle}>Your Weekly Workout Schedule:</Text>
              <View style={styles.scheduleList}>
                <Text style={styles.scheduleItem}>• Monday: Legs (Quads, Hamstrings, Glutes)</Text>
                <Text style={styles.scheduleItem}>• Tuesday: Upper Body + Abs</Text>
                <Text style={styles.scheduleItem}>• Wednesday: Inner/Outer Thighs + Back</Text>
                <Text style={styles.scheduleItem}>• Thursday: Core + Cardio</Text>
                <Text style={styles.scheduleItem}>• Friday: Legs (Quads, Hamstrings, Glutes)</Text>
                <Text style={styles.scheduleItem}>• Saturday: Upper Body + Abs</Text>
                <Text style={styles.scheduleItem}>• Sunday: Rest Day</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={isSignUp ? handleSignUp : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, loading && styles.disabledText]}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  scheduleInfo: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  weeklySchedule: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  scheduleList: {
    gap: 4,
  },
  scheduleItem: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#9ca3af',
  },
});

export default LoginScreen;