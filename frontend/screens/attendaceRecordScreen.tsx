import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  // FlatList,
  // Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceRecord {
  date: string;
  classType: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  attendanceCount?: number;
  attendance?: AttendanceRecord[];
}

interface AttendanceRecordScreenProps {
  user: User;
}

const AttendanceRecordScreen: React.FC<AttendanceRecordScreenProps> = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(
    user.attendance || []
  );
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const filters = ['All', 'Cardio', 'Strength', 'Flexibility', 'Balance'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    if (!authToken) return;

    try {
      const response = await fetch(`http://192.168.1.10:5000/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAttendanceData(data.user.attendance || []);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredAttendance = attendanceData.filter(record => 
    selectedFilter === 'All' || record.classType === selectedFilter
  );

  const getAttendanceStats = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthCount = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    }).length;

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const lastMonthCount = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear;
    }).length;

    const classTypeCounts = attendanceData.reduce((acc, record) => {
      acc[record.classType] = (acc[record.classType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const mostFrequent = Object.entries(classTypeCounts).sort(([,a], [,b]) => b - a)[0];

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      total: attendanceData.length,
      mostFrequent: mostFrequent ? mostFrequent[0] : 'None'
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getWorkoutIcon = (classType: string) => {
    switch (classType) {
      case 'Cardio': return 'walk';
      case 'Strength': return 'barbell';
      case 'Flexibility': return 'accessibility';
      case 'Balance': return 'scale';
      default: return 'fitness';
    }
  };

  const getWorkoutColor = (classType: string) => {
    switch (classType) {
      case 'Cardio': return '#ef4444';
      case 'Strength': return '#2563eb';
      case 'Flexibility': return '#10b981';
      case 'Balance': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const groupAttendanceByMonth = () => {
    const grouped = filteredAttendance.reduce((acc, record) => {
      const date = new Date(record.date);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(record);
      return acc;
    }, {} as { [key: string]: AttendanceRecord[] });

    return Object.entries(grouped).sort(([a], [b]) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const stats = getAttendanceStats();
  const groupedAttendance = groupAttendanceByMonth();

  const renderFilterButton = (filter: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.attendanceItem}>
      <View style={[
        styles.workoutIconContainer,
        { backgroundColor: getWorkoutColor(item.classType) + '15' }
      ]}>
        <Ionicons 
          name={getWorkoutIcon(item.classType)} 
          size={24} 
          color={getWorkoutColor(item.classType)} 
        />
      </View>
      <View style={styles.attendanceContent}>
        <Text style={styles.workoutType}>{item.classType}</Text>
        <Text style={styles.attendanceTime}>
          {formatDate(item.date)} • {formatTime(item.date)}
        </Text>
      </View>
      <View style={styles.checkIcon}>
        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Record</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats.mostFrequent}</Text>
          <Text style={styles.statLabel}>Most Frequent</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter by Workout Type</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filters.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Attendance List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'All' ? 'All Sessions' : `${selectedFilter} Sessions`}
          </Text>
          <Text style={styles.resultCount}>
            {filteredAttendance.length} sessions
          </Text>
        </View>

        {filteredAttendance.length > 0 ? (
          <>
            {groupedAttendance.map(([monthYear, records]) => (
              <View key={monthYear} style={styles.monthGroup}>
                <Text style={styles.monthHeader}>{monthYear}</Text>
                <View style={styles.monthContent}>
                  {records.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  ).map((record, index) => (
                    <View key={`${monthYear}-${index}`}>
                      {renderAttendanceItem({ item: record })}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No Records Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'All' 
                ? 'Start working out to see your attendance records here!'
                : `No ${selectedFilter.toLowerCase()} sessions found. Try a different filter.`
              }
            </Text>
          </View>
        )}
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
    padding: 20,
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
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  monthGroup: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },
  monthContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attendanceContent: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  attendanceTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default AttendanceRecordScreen;