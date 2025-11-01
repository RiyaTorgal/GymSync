import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// API Configuration
const API_BASE_URL = 'http://192.168.1.10:5000/api/users';

interface User {
  _id?: string;
  // name: UserName;
  // name: {
  //   firstname: string;
  //   middlename?: string;
  //   lastname: string;
  // };
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  membershipType: string;
  workoutType: string;
  attendanceCount?: number;
  joinDate?: string;
}

interface AccountSettingsScreenProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ 
  user, 
  onLogout, 
  onUserUpdate 
}) => {
  const [editMode, setEditMode] = useState(false);
// const [currentUser, setProfileData] = useState({
//   name: user?.name || { firstname: '', middlename: '', lastname: '' },
//   email: user?.email || '',
//   membershipType: user?.membershipType || '',
//   workoutType: user?.workoutType || '',
// });
  const [currentUser, setCurrentUser] = useState<User>({
    // name: { firstname: '', middlename: '', lastname: '' },
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    membershipType: '',
    workoutType: '',
  });
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    dietReminders: false,
    socialUpdates: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: false,
    allowMessages: true,
  });
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUser({
        // name: user.name || { firstname: '', middlename: '', lastname: '' },
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        membershipType: user.membershipType || '',
        workoutType: user.workoutType || '',
        attendanceCount: user.attendanceCount,
        joinDate: user.joinDate,
      });
    }
  }, [user]);

  const EditProfileModal = () => (
    <Modal
      visible={editMode}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setEditMode(false)}
    >
      <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setEditMode(false)}
            disabled={loading}
          >
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={[styles.modalSave, loading && styles.disabledText]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={currentUser?.firstName ?? ''}
                onChangeText={(text) =>
                  setCurrentUser((prev) => ({
                    ...prev,
                    name: { ...prev, firstName: text },
                  }))
                }
                placeholder="Enter first name"
                editable={!loading}
              />
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Middle Name</Text>
              <TextInput
                style={styles.input}
                value={currentUser?.middleName ?? ''}
                onChangeText={(text) =>
                  setCurrentUser((prev) => ({
                    ...prev,
                    name: { ...prev, middleName: text },
                  }))
                }
                placeholder="Enter middle name (optional)"
                editable={!loading}
              />
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={currentUser?.lastName ?? ''}
                onChangeText={(text) =>
                  setCurrentUser((prev) => ({
                    ...prev,
                    name: { ...prev, lastName: text },
                  }))
                }
                placeholder="Enter last name"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={currentUser.email}
              editable={false}
            />
            <Text style={styles.inputHelp}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Membership Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentUser.membershipType}
                onValueChange={(value) => setCurrentUser(prev => ({ ...prev, membershipType: value }))}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Monthly" value="Monthly" />
                <Picker.Item label="Quarterly" value="Quarterly" />
                <Picker.Item label="Annual" value="Annual" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Workout Focus</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentUser.workoutType}
                onValueChange={(value) => setCurrentUser(prev => ({ ...prev, workoutType: value }))}
                enabled={!loading}
                style={styles.picker}
              >
                <Picker.Item label="Strength Training" value="Strength" />
                <Picker.Item label="Cardio" value="Cardio" />
                <Picker.Item label="Weight Loss" value="Weight Loss" />
                <Picker.Item label="Muscle Building" value="Muscle Building" />
                <Picker.Item label="General Fitness" value="General Fitness" />
              </Picker>
            </View>
          </View>
        </ScrollView>
      </View>
      </View>
    </Modal>
  );

  // Change Password Modal
  const ChangePasswordModal = () => (
    <Modal
      visible={changePasswordModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setChangePasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setChangePasswordModal(false)}
            disabled={loading}
          >
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity 
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={[styles.modalSave, loading && styles.disabledText]}>
              {loading ? 'Changing...' : 'Change'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Enter current password"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              placeholder="Enter new password"
              secureTextEntry
              editable={!loading}
            />
            <Text style={styles.inputHelp}>Must be at least 6 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm new password"
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.passwordTips}>
            <Text style={styles.tipsTitle}>Password Requirements:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>At least 6 characters long</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="information-circle" size={16} color="#6b7280" />
              <Text style={styles.tipText}>Use a strong, unique password</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      </View>
    </Modal>
  );

  React.useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
      } catch (error) {
        console.error('Failed to fetch auth token from storage:', error);
      }
    };
    fetchToken();
  }, []);

  // API Helper function
  const makeApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    if (!authToken) {
      throw new Error('Authentication token not found');
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  const handleSaveProfile = async () => {
    if (!currentUser.firstName.trim() || !currentUser.lastName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const data = await makeApiCall('/profile', 'PUT', {
        firstName: currentUser.firstName,
        middleName: currentUser.middleName,
        lastName: currentUser.lastName,
        membershipType: currentUser.membershipType,
        workoutType: currentUser.workoutType,
      });

      if (data.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditMode(false);
        // Update local storage and parent component
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        onUserUpdate?.(data.user);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const data = await makeApiCall('/change-password', 'PUT', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (data.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setChangePasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = async () => {
    setLoading(true);
    try {
      // Call logout API
      if (authToken) {
        try {
          await makeApiCall('/logout', 'POST');
          console.log('Server logout successful');
        } catch (error) {
          console.error('Server logout failed, continuing with local logout:', error);
          // Continue with local logout even if server logout fails
        }
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      
      // Call parent logout function
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, perform local logout
      try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
      } catch (storageError) {
        console.error('Storage cleanup error:', storageError);
      }
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutFromAllDevices = async () => {
    Alert.alert(
      'Logout from All Devices',
      'This will log you out from all devices. You will need to login again on all devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout All', 
          style: 'destructive',
          onPress: performLogoutFromAllDevices
        }
      ]
    );
  };

  const performLogoutFromAllDevices = async () => {
    setLoading(true);
    try {
      // Call logout all API
      if (authToken) {
        try {
          await makeApiCall('/logout-all', 'POST');
          console.log('Server logout from all devices successful');
        } catch (error) {
          console.error('Server logout all failed, continuing with local logout:', error);
        }
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      
      // Show success message
      Alert.alert('Success', 'Logged out from all devices successfully');
      
      // Call parent logout function
      onLogout();
    } catch (error) {
      console.error('Logout all error:', error);
      // Even if there's an error, perform local logout
      try {
        await AsyncStorage.multiRemove(['authToken', 'userData']);
      } catch (storageError) {
        console.error('Storage cleanup error:', storageError);
      }
      Alert.alert('Logged Out', 'You have been logged out locally');
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: showPasswordPromptForDeletion
        }
      ]
    );
  };

  const showPasswordPromptForDeletion = () => {
    Alert.prompt(
      'Confirm Account Deletion',
      'Please enter your password to confirm account deletion:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: performAccountDeletion
        }
      ],
      'secure-text'
    );
  };

  const performAccountDeletion = async (password?: string) => {
    if (!password) {
      Alert.alert('Error', 'Password is required to delete account');
      return;
    }

    setLoading(true);
    try {
      const data = await makeApiCall('/account', 'DELETE', { password });
      
      if (data.success) {
        Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
        // Clear local storage
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        onLogout();
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'Monthly': return '#10b981';
      case 'Quarterly': return '#f59e0b';
      case 'Annual': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Member since ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}`;
  };

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap, 
    title: string, 
    subtitle: string, 
    onPress: () => void,
    rightElement?: React.ReactNode,
    isDestructive = false
  ) => (
    <TouchableOpacity 
      style={[
        styles.settingItem,
        loading && styles.disabledSetting
      ]} 
      onPress={onPress}
      disabled={loading}
    >
      <View style={[
        styles.settingIcon,
        isDestructive && styles.destructiveIcon
      ]}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isDestructive ? "#ef4444" : "#6b7280"} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          isDestructive && styles.destructiveText
        ]}>
          {title}
        </Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {rightElement || (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#9ca3af" 
        />
      )}
    </TouchableOpacity>
  );

  const renderSwitchItem = (
    icon: keyof typeof Ionicons.glyphMap, 
    title: string, 
    subtitle: string, 
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#6b7280" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        disabled={loading}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <EditProfileModal />
      <ChangePasswordModal />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Account Settings</Text>
        {loading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName
                ? user.firstName.charAt(0).toUpperCase()
                : 'U'
                }
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.firstName ?? ''} {user?.middleName ?? ''} {user?.lastName ?? ''}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.joinDate}>{formatJoinDate(user.joinDate)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, loading && styles.disabledButton]}
              onPress={() => setEditMode(true)}
              disabled={loading}
            >
              <Ionicons name="pencil" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.membershipBadgeContainer}>
            <View style={[
              styles.membershipBadge,
              { backgroundColor: getMembershipColor(user.membershipType) + '20' }
            ]}>
              <Ionicons 
                name="card" 
                size={16} 
                color={getMembershipColor(user.membershipType)} 
              />
              <Text style={[
                styles.membershipText,
                { color: getMembershipColor(user.membershipType) }
              ]}>
                {user.membershipType} Member
              </Text>
            </View>
            {/* <View style={styles.workoutBadge}>
              <Ionicons name="barbell" size={16} color="#6b7280" />
              <Text style={styles.workoutText}>
                {user.workoutType} Focus
              </Text>
            </View> */}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.attendanceCount || 0}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.floor(((user.attendanceCount || 0) * 30) / 7)}
              </Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.floor((user.attendanceCount || 0) / 4) || 0}
              </Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'person',
            'Edit Profile',
            'Update your personal information',
            () => setEditMode(true)
          )}
          {renderSettingItem(
            'lock-closed',
            'Change Password',
            'Update your account password',
            () => setChangePasswordModal(true)
          )}
          {renderSettingItem(
            'card',
            'Membership Plan',
            `Current: ${user.membershipType}`,
            () => Alert.alert('Feature Coming Soon', 'Membership management will be available soon!')
          )}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsGroup}>
          {renderSwitchItem(
            'barbell',
            'Workout Reminders',
            'Get notified about scheduled workouts',
            notifications.workoutReminders,
            (value) => setNotifications(prev => ({ ...prev, workoutReminders: value }))
          )}
          {renderSwitchItem(
            'trending-up',
            'Progress Updates',
            'Weekly progress and achievement notifications',
            notifications.progressUpdates,
            (value) => setNotifications(prev => ({ ...prev, progressUpdates: value }))
          )}
          {renderSwitchItem(
            'restaurant',
            'Diet Reminders',
            'Reminders to log your meals',
            notifications.dietReminders,
            (value) => setNotifications(prev => ({ ...prev, dietReminders: value }))
          )}
          {renderSwitchItem(
            'people',
            'Social Updates',
            'Updates from friends and community',
            notifications.socialUpdates,
            (value) => setNotifications(prev => ({ ...prev, socialUpdates: value }))
          )}
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsGroup}>
          {renderSwitchItem(
            'eye',
            'Profile Visibility',
            'Make your profile visible to other users',
            privacy.profileVisible,
            (value) => setPrivacy(prev => ({ ...prev, profileVisible: value }))
          )}
          {renderSwitchItem(
            'stats-chart',
            'Show Progress',
            'Allow others to see your workout progress',
            privacy.showProgress,
            (value) => setPrivacy(prev => ({ ...prev, showProgress: value }))
          )}
          {renderSwitchItem(
            'chatbox',
            'Allow Messages',
            'Receive messages from other users',
            privacy.allowMessages,
            (value) => setPrivacy(prev => ({ ...prev, allowMessages: value }))
          )}
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'log-out',
            'Logout',
            'Sign out of your account',
            handleLogout,
            <Ionicons name="log-out" size={20} color="#ef4444" />,
            true
          )}
          {renderSettingItem(
            'phone-portrait',
            'Logout All Devices',
            'Sign out of all active sessions',
            handleLogoutFromAllDevices,
            <Ionicons name="phone-portrait" size={20} color="#ef4444" />,
            true
          )}
          {renderSettingItem(
            'trash',
            'Delete Account',
            'Permanently delete your account',
            handleDeleteAccount,
            <Ionicons name="trash" size={20} color="#ef4444" />,
            true
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, paddingTop: 45, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  loadingIndicator: { marginTop: 8 },
  loadingText: { fontSize: 14, color: '#6b7280' },
  section: { margin: 20, marginTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  dangerTitle: { color: '#ef4444' },
  profileCard: { backgroundColor: 'white', borderRadius: 12, padding: 20, elevation: 3 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  joinDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  editButton: { padding: 8, borderRadius: 8, backgroundColor: '#eff6ff' },
  disabledButton: { opacity: 0.5 },
  membershipBadgeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  membershipBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  membershipText: { fontSize: 12, fontWeight: '600' },
  workoutBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', gap: 6 },
  workoutText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: '#e5e7eb' },
  settingsGroup: { backgroundColor: 'white', borderRadius: 12, elevation: 2 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  disabledSetting: { opacity: 0.6 },
  settingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  destructiveIcon: { backgroundColor: '#fee2e2' },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  destructiveText: { color: '#ef4444' },
  settingSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-around',
    // alignItems: 'center',
    padding: 20,
    
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 20,
    padding: 20,
    // paddingBottom: 20,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSave: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  inputHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  passwordTips: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 8,
  },
});

export default AccountSettingsScreen;