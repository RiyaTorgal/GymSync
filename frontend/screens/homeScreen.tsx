import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { MaterialIcons } from '@expo/vector-icons';

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
  }, []);

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
          <MaterialIcons name="account-circle" size={32} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="fitness-center" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{attendanceCount}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="calendar-today" size={24} color="#10b981" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>

        <View style={[styles.statCard, styles.membershipCard]}>
          <View style={[
            styles.membershipBadge, 
            { backgroundColor: getMembershipColor(user.membershipType) }
          ]}>
            <Text style={styles.membershipText}>{user.membershipType}</Text>
          </View>
          <Text style={styles.statLabel}>Membership</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Check-in</Text>
        <View style={styles.quickActions}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.actionCard,
                user.workoutType === type && styles.preferredAction
              ]}
              onPress={() => handleQuickCheckIn(type)}
            >
              <MaterialIcons 
                name={
                  type === 'Cardio' ? 'directions-run' :
                  type === 'Strength' ? 'fitness-center' :
                  type === 'Flexibility' ? 'accessibility' : 'balance'
                } 
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
        </View>
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
                  <MaterialIcons name="check-circle" size={20} color="#10b981" />
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
            <MaterialIcons name="event-busy" size={48} color="#d1d5db" />
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
    paddingTop: 60,
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
  membershipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  membershipText: {
    color: 'white',
    fontSize: 12,
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