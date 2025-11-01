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
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  onLogin: (user: any, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    membershipType: 'Monthly',
    building: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    weight: '',
    height: '',
    bloodGroup: '',
    accidentDescription: '',
    accidentDate: '',
    accidentRecovered: 'Yes',
    chronicConditionName: '',
    chronicDiagnosisDate: '',
    chronicBeingTreated: 'Yes',
    chronicDoctorNotes: '',
  });

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupInputChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const validateSignupPage1 = () => {
    if (!signupData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!signupData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    // if (!signupData.username.trim()) {
    //   Alert.alert('Error', 'Please enter a username');
    //   return false;
    // }
    // if (signupData.username.length < 3) {
    //   Alert.alert('Error', 'Username must be at least 3 characters long');
    //   return false;
    // }
    if (!signupData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (signupData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!signupData.dateOfBirth.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return false;
    }
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(signupData.dateOfBirth)) {
      Alert.alert('Error', 'Date of birth must be in DD/MM/YYYY format');
      return false;
    }
    return true;
  };

  const validateSignupPage2 = () => {
    if (!signupData.building.trim()) {
      Alert.alert('Error', 'Please enter your building/house details');
      return false;
    }
    if (!signupData.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!signupData.state.trim()) {
      Alert.alert('Error', 'Please enter your state');
      return false;
    }
    if (!signupData.pincode.trim()) {
      Alert.alert('Error', 'Please enter your pincode');
      return false;
    }
    if (!/^\d{6}$/.test(signupData.pincode)) {
      Alert.alert('Error', 'Pincode must be 6 digits');
      return false;
    }
    if (!signupData.primaryPhone.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return false;
    }
    if (!/^\d{10}$/.test(signupData.primaryPhone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Contact number must be 10 digits');
      return false;
    }
    return true;
  };

  const validateSignupPage3 = () => {
    if (signupData.weight.trim() && (isNaN(Number(signupData.weight)) || Number(signupData.weight) <= 0)) {
      Alert.alert('Error', 'Please enter a valid weight');
      return false;
    }
    if (signupData.height.trim() && (isNaN(Number(signupData.height)) || Number(signupData.height) <= 0)) {
      Alert.alert('Error', 'Please enter a valid height');
      return false;
    }
    // if (signupData.accidentDate.trim()) {
    //   const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    //   if (!dateRegex.test(signupData.accidentDate)) {
    //     Alert.alert('Error', 'Accident date must be in DD/MM/YYYY format');
    //     return false;
    //   }
    // }
    // if (signupData.chronicDiagnosisDate.trim()) {
    //   const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    //   if (!dateRegex.test(signupData.chronicDiagnosisDate)) {
    //     Alert.alert('Error', 'Diagnosis date must be in DD/MM/YYYY format');
    //     return false;
    //   }
    // }
    return true;
  };

  const handleNextStep = () => {
    if (signupStep === 1 && validateSignupPage1()) {
      setSignupStep(2);
    } else if (signupStep === 2 && validateSignupPage2()) {
      setSignupStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (signupStep > 1) {
      setSignupStep(signupStep - 1);
    }
  };

  const handleLogin = async () => {
    if (!loginData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!loginData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.10:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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
    if (!validateSignupPage3()) return;

    setLoading(true);
    try {
      const [dobDay, dobMonth, dobYear] = signupData.dateOfBirth.split('/');
      const dobISO = new Date(Number(dobYear), Number(dobMonth) - 1, Number(dobDay)).toISOString();

      // const fullName = [signupData.firstName, signupData.middleName, signupData.lastName]
      //   .filter(n => n.trim()).join(' ');

      let accidentDateISO = null;
      if (signupData.accidentDate.trim()) {
        const [accDay, accMonth, accYear] = signupData.accidentDate.split('/');
        accidentDateISO = new Date(Number(accYear), Number(accMonth) - 1, Number(accDay)).toISOString();
      }

      let chronicDateISO = null;
      if (signupData.chronicDiagnosisDate.trim()) {
        const [chrDay, chrMonth, chrYear] = signupData.chronicDiagnosisDate.split('/');
        chronicDateISO = new Date(Number(chrYear), Number(chrMonth) - 1, Number(chrDay)).toISOString();
      }

      const accidents = signupData.accidentDescription.trim() ? [{
        description: signupData.accidentDescription.trim(),
        date: accidentDateISO || new Date().toISOString(),
        recovered: signupData.accidentRecovered === 'Yes'
      }] : [];

      const chronicConditions = signupData.chronicConditionName.trim() ? [{
        conditionName: signupData.chronicConditionName.trim(),
        diagnosedDate: chronicDateISO || new Date().toISOString(),
        underMedication: signupData.chronicBeingTreated === 'Yes',
        notes: signupData.chronicDoctorNotes.trim()
      }] : [];

      const response = await fetch('http://192.168.1.10:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupData.firstName.trim(),
          middleName: signupData.middleName.trim(),
          lastName: signupData.lastName.trim(),
          email: signupData.email.trim(),
          password: signupData.password,
          dateOfBirth: dobISO,
          membershipType: signupData.membershipType,
          contactInfo: {
            address: {
              building: signupData.building.trim(),
              landmark: signupData.landmark.trim(),
              city: signupData.city.trim(),
              state: signupData.state.trim(),
              country: signupData.country.trim(),
              pincode: signupData.pincode.trim(),
            },
            primaryPhone: signupData.primaryPhone.trim(),
            secondaryPhone: signupData.secondaryPhone.trim(),
          },
          healthInfo: {
            weight: signupData.weight ? Number(signupData.weight) : null,
            height: signupData.height ? Number(signupData.height) : null,
            bloodGroup: signupData.bloodGroup.trim() || null,
            medicalHistory: {
              accidents: accidents,
              chronicConditions: chronicConditions,
            },
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        Alert.alert('Success', 'Account created successfully!');
        onLogin(data.user, data.token);
        resetSignupForm();
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

  const resetSignupForm = () => {
    setSignupStep(1);
    setSignupData({
      firstName: '', middleName: '', lastName: '', password: '',
      confirmPassword: '', dateOfBirth: '', membershipType: 'Monthly', building: '',
      landmark: '', city: '', state: '', country: 'India', pincode: '', email: '',
      primaryPhone: '', secondaryPhone: '', weight: '', height: '', bloodGroup: '',
      accidentDescription: '', accidentDate: '', accidentRecovered: 'Yes',
      chronicConditionName: '', chronicDiagnosisDate: '', chronicBeingTreated: 'Yes',
      chronicDoctorNotes: '',
    });
  };

  const switchToLogin = () => { setIsSignUp(false); setSignupStep(1); resetSignupForm(); };
  const switchToSignup = () => { setIsSignUp(true); setSignupStep(1); };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressSteps}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStepContainer}>
            <View style={[styles.progressCircle, signupStep >= step && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, signupStep >= step && styles.progressNumberActive]}>{step}</Text>
            </View>
            {step < 3 && <View style={[styles.progressLine, signupStep > step && styles.progressLineActive]} />}
          </View>
        ))}
      </View>
      <View style={styles.progressLabels}>
        <Text style={[styles.progressLabel, signupStep === 1 && styles.progressLabelActive]}>Personal Info</Text>
        <Text style={[styles.progressLabel, signupStep === 2 && styles.progressLabelActive]}>Contact Info</Text>
        <Text style={[styles.progressLabel, signupStep === 3 && styles.progressLabelActive]}>Health Info</Text>
      </View>
    </View>
  );

  const renderSignupPage1 = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Full Name</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput style={styles.input} placeholder="First name" value={signupData.firstName}
          onChangeText={(v) => handleSignupInputChange('firstName', v)} autoCapitalize="words" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Middle Name</Text>
        <TextInput style={styles.input} placeholder="Middle name (optional)" value={signupData.middleName}
          onChangeText={(v) => handleSignupInputChange('middleName', v)} autoCapitalize="words" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput style={styles.input} placeholder="Last name" value={signupData.lastName}
          onChangeText={(v) => handleSignupInputChange('lastName', v)} autoCapitalize="words" editable={!loading} />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Password Generation</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password *</Text>
        <TextInput style={styles.input} placeholder="Create a password (min. 6 characters)" value={signupData.password}
          onChangeText={(v) => handleSignupInputChange('password', v)} secureTextEntry autoCapitalize="none" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <TextInput style={styles.input} placeholder="Confirm your password" value={signupData.confirmPassword}
          onChangeText={(v) => handleSignupInputChange('confirmPassword', v)} secureTextEntry editable={!loading} />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>DOB and Membership Type</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth *</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY" value={signupData.dateOfBirth}
          onChangeText={(v) => handleSignupInputChange('dateOfBirth', v)} maxLength={10} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Membership Type</Text>
        <View style={[styles.pickerContainer, loading && styles.disabled]}>
          <Picker selectedValue={signupData.membershipType}
            onValueChange={(v) => handleSignupInputChange('membershipType', v)} style={styles.picker} enabled={!loading}>
            <Picker.Item label="Monthly" value="Monthly" />
            <Picker.Item label="Quarterly" value="Quarterly" />
            <Picker.Item label="Annual" value="Annual" />
          </Picker>
        </View>
      </View>
      <TouchableOpacity style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleNextStep} disabled={loading}>
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </>
  );

  const renderSignupPage2 = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Address</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Building/House *</Text>
        <TextInput style={styles.input} placeholder="Building name, flat no." value={signupData.building}
          onChangeText={(v) => handleSignupInputChange('building', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Landmark</Text>
        <TextInput style={styles.input} placeholder="Nearby landmark (optional)" value={signupData.landmark}
          onChangeText={(v) => handleSignupInputChange('landmark', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput style={styles.input} placeholder="City" value={signupData.city}
          onChangeText={(v) => handleSignupInputChange('city', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>State *</Text>
        <TextInput style={styles.input} placeholder="State" value={signupData.state}
          onChangeText={(v) => handleSignupInputChange('state', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country</Text>
        <TextInput style={styles.input} value={signupData.country}
          onChangeText={(v) => handleSignupInputChange('country', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pincode *</Text>
        <TextInput style={styles.input} placeholder="6-digit pincode" value={signupData.pincode}
          onChangeText={(v) => handleSignupInputChange('pincode', v)} keyboardType="numeric" maxLength={6} editable={!loading} />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email ID</Text>
        <TextInput style={styles.input} placeholder="JaneDoe@xyz.com" value={signupData.email}
          onChangeText={(v) => handleSignupInputChange('email', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Primary Contact Number *</Text>
        <TextInput style={styles.input} placeholder="10-digit mobile number" value={signupData.primaryPhone}
          onChangeText={(v) => handleSignupInputChange('primaryPhone', v)} keyboardType="phone-pad" maxLength={10} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Secondary Contact Number</Text>
        <TextInput style={styles.input} placeholder="Alternate number (optional)" value={signupData.secondaryPhone}
          onChangeText={(v) => handleSignupInputChange('secondaryPhone', v)} keyboardType="phone-pad" maxLength={10} editable={!loading} />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.secondaryButtonOutline, { flex: 1, marginRight: 8 }]} onPress={handlePreviousStep} disabled={loading}>
          <Text style={styles.secondaryButtonOutlineText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }, loading && styles.disabledButton]} onPress={handleNextStep} disabled={loading}>
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSignupPage3 = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Basic Health Information</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput style={styles.input} placeholder="Enter weight in kg (optional)" value={signupData.weight}
          onChangeText={(v) => handleSignupInputChange('weight', v)} keyboardType="numeric" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput style={styles.input} placeholder="Enter height in cm (optional)" value={signupData.height}
          onChangeText={(v) => handleSignupInputChange('height', v)} keyboardType="numeric" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Blood Group</Text>
        <View style={[styles.pickerContainer, loading && styles.disabled]}>
          <Picker selectedValue={signupData.bloodGroup} onValueChange={(v) => handleSignupInputChange('bloodGroup', v)} style={styles.picker} enabled={!loading}>
            <Picker.Item label="Select Blood Group (optional)" value="" />
            <Picker.Item label="A+" value="A+" />
            <Picker.Item label="A-" value="A-" />
            <Picker.Item label="B+" value="B+" />
            <Picker.Item label="B-" value="B-" />
            <Picker.Item label="AB+" value="AB+" />
            <Picker.Item label="AB-" value="AB-" />
            <Picker.Item label="O+" value="O+" />
            <Picker.Item label="O-" value="O-" />
          </Picker>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical History - Accidents</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Accident Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe any past accidents (optional)" value={signupData.accidentDescription}
          onChangeText={(v) => handleSignupInputChange('accidentDescription', v)} multiline numberOfLines={3} textAlignVertical="top" editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Accident Date</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY (optional)" value={signupData.accidentDate}
          onChangeText={(v) => handleSignupInputChange('accidentDate', v)} maxLength={10} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recovered?</Text>
        <View style={[styles.pickerContainer, loading && styles.disabled]}>
          <Picker selectedValue={signupData.accidentRecovered} onValueChange={(v) => handleSignupInputChange('accidentRecovered', v)} style={styles.picker} enabled={!loading}>
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chronic Conditions</Text>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Condition Name</Text>
        <TextInput style={styles.input} placeholder="e.g., Diabetes (optional)" value={signupData.chronicConditionName}
          onChangeText={(v) => handleSignupInputChange('chronicConditionName', v)} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Diagnosis Date</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY (optional)" value={signupData.chronicDiagnosisDate}
          onChangeText={(v) => handleSignupInputChange('chronicDiagnosisDate', v)} maxLength={10} editable={!loading} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currently Being Treated?</Text>
        <View style={[styles.pickerContainer, loading && styles.disabled]}>
          <Picker selectedValue={signupData.chronicBeingTreated} onValueChange={(v) => handleSignupInputChange('chronicBeingTreated', v)} style={styles.picker} enabled={!loading}>
            <Picker.Item label="Yes" value="Yes" />
            <Picker.Item label="No" value="No" />
          </Picker>
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doctor&apos;s Notes</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Additional notes (optional)" value={signupData.chronicDoctorNotes}
          onChangeText={(v) => handleSignupInputChange('chronicDoctorNotes', v)} multiline numberOfLines={3} textAlignVertical="top" editable={!loading} />
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#1e40af" style={styles.infoIcon} />
        <Text style={styles.infoText}>This helps us create a safe and personalized workout plan</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.secondaryButtonOutline, { flex: 1, marginRight: 8 }]} onPress={handlePreviousStep} disabled={loading}>
          <Text style={styles.secondaryButtonOutlineText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginLeft: 8 }, loading && styles.disabledButton]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>GymSync</Text>
          <Text style={styles.subtitle}>{isSignUp ? 'Create your account' : 'Welcome back!'}</Text>
        </View>
        <View style={styles.form}>
          {isSignUp && renderProgressIndicator()}
          {!isSignUp ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput style={styles.input} placeholder="Enter your email" value={loginData.email}
                  onChangeText={(v) => handleLoginInputChange('email', v)} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput style={styles.input} placeholder="Enter your password" value={loginData.password}
                  onChangeText={(v) => handleLoginInputChange('password', v)} secureTextEntry autoCapitalize="none" editable={!loading} />
              </View>
              <TouchableOpacity style={[styles.primaryButton, loading && styles.disabledButton]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={switchToSignup} disabled={loading}>
                <Text style={[styles.secondaryButtonText, loading && styles.disabledText]}>Don&apos;t have an account? Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {signupStep === 1 && renderSignupPage1()}
              {signupStep === 2 && renderSignupPage2()}
              {signupStep === 3 && renderSignupPage3()}
              <TouchableOpacity style={styles.secondaryButton} onPress={switchToLogin} disabled={loading}>
                <Text style={[styles.secondaryButtonText, loading && styles.disabledText]}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 8, marginTop: 20 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 8 },
  form: { backgroundColor: 'white', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  progressContainer: { marginBottom: 30 },
  progressSteps: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  progressStepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  progressCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e7eb' },
  progressCircleActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  progressNumber: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  progressNumberActive: { color: 'white' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#e5e7eb' },
  progressLineActive: { backgroundColor: '#2563eb' },
  progressLabels: { flexDirection: 'row' },
  progressLabel: { fontSize: 12, color: '#6b7280', flex: 1, textAlign: 'left' },
  progressLabelActive: { color: '#2563eb', fontWeight: '600' },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  textArea: { minHeight: 80, paddingTop: 12 },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#f9fafb' },
  picker: { height: 50 },
  sectionHeader: { marginTop: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 6 },
  infoBox: { backgroundColor: '#f0f9ff', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe', flexDirection: 'row', alignItems: 'center' },
  infoIcon: { marginRight: 8 },
  infoText: { fontSize: 13, color: '#1e40af', flex: 1 },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16 },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  secondaryButton: { alignItems: 'center', padding: 8 },
  secondaryButtonText: { color: '#2563eb', fontSize: 14 },
  secondaryButtonOutline: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16, backgroundColor: 'white' },
  secondaryButtonOutlineText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#9ca3af' },
  disabled: { opacity: 0.6 },
  disabledText: { color: '#9ca3af' },
});

export default LoginScreen;