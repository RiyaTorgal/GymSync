import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Svg, { Circle, Text as SvgText, Polyline } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#ffffff',
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#2563eb"
  },
  propsForLabels: {
    fontSize: 12,
    fontFamily: "System"
  }
};

interface AttendanceRecord {
  date: string;
  dayName: string;
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

// Calendar Heatmap Component
const CalendarHeatmap: React.FC<{ data: AttendanceRecord[] }> = ({ data }) => {
  const getHeatmapData = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    
    const attendanceMap = data.reduce((acc, record) => {
      const date = new Date(record.date).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const weeks = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const weekData = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toDateString();
        const count = attendanceMap[dateStr] || 0;
        weekData.push({
          date: new Date(currentDate),
          count,
          intensity: count > 0 ? Math.min(count / 2, 1) : 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekData);
      if (currentDate > today) break;
    }
    
    return weeks.slice(-12);
  };

  const weeks = getHeatmapData();

  return (
    <View style={styles.heatmapContainer}>
      <Text style={styles.chartTitle}>6-Month Activity</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmapGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.heatmapWeek}>
              {week.map((day, dayIndex) => (
                <View
                  key={dayIndex}
                  style={[
                    styles.heatmapDay,
                    {
                      backgroundColor: day.intensity > 0 
                        ? `rgba(37, 99, 235, ${0.2 + day.intensity * 0.8})`
                        : '#f3f4f6'
                    }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Circular Progress Component
const CircularProgress: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  text: string;
  subtext: string;
}> = ({ progress, size, strokeWidth, color, backgroundColor, text, subtext }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <SvgText
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#1f2937"
        >
          {text}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
        >
          {subtext}
        </SvgText>
      </Svg>
    </View>
  );
};

// Sparkline Component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width="60" height="20" style={styles.sparkline}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
};

const AttendanceRecordScreen: React.FC<AttendanceRecordScreenProps> = ({ user }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(true);

  const filters = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
        if (token) {
          fetchAttendanceDataWithToken(token);
        }
      } catch (error) {
        console.error('Failed to fetch auth token from storage:', error);
      }
    };
    fetchToken();
  }, []);

  const fetchAttendanceDataWithToken = async (token: string) => {
    try {
      const response = await fetch(`http://192.168.1.10:5000/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAttendanceData(data.user.attendance || []);
      }
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData();
  }, [authToken]);

  const fetchAttendanceData = async () => {
    if (!authToken) return;
    try {
      const response = await fetch(`http://192.168.1.10:5000/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
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

  // Chart Data Preparation
  const getWeeklyPatternData = () => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayCount = attendanceData.reduce((acc, record) => {
      const day = record.dayName;
      if (day) {
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    const data = dayNames.map(day => {
      const fullDay = day === 'Mon' ? 'Monday' : 
                     day === 'Tue' ? 'Tuesday' :
                     day === 'Wed' ? 'Wednesday' :
                     day === 'Thu' ? 'Thursday' :
                     day === 'Fri' ? 'Friday' :
                     day === 'Sat' ? 'Saturday' : 'Sunday';
      return dayCount[fullDay] || 0;
    });

    return {
      labels: dayNames,
      datasets: [{ data }]
    };
  };

  const getMonthlyTrendData = () => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()].slice(0, 3);
      
      const count = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === date.getFullYear() && 
               recordDate.getMonth() === date.getMonth();
      }).length;
      
      last6Months.push({ month: monthName, count });
    }

    return {
      labels: last6Months.map(m => m.month),
      datasets: [{
        data: last6Months.map(m => m.count),
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }],
      legend: ["Gym Visits"]
    };
  };

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

    const monthlyGoal = 20;
    const monthlyProgress = Math.min((thisMonthCount / monthlyGoal) * 100, 100);

    const last6MonthsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(thisYear, thisMonth - i, 1);
      const count = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === date.getFullYear() && 
               recordDate.getMonth() === date.getMonth();
      }).length;
      last6MonthsData.push(count);
    }

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      total: attendanceData.length,
      monthlyProgress,
      sparklineData: last6MonthsData,
      monthlyGoal
    };
  };

  const filteredAttendance = attendanceData.filter(record => 
    selectedFilter === 'All' || record.dayName === selectedFilter
  );

  const stats = getAttendanceStats();
  const weeklyData = getWeeklyPatternData();
  const monthlyTrendData = getMonthlyTrendData();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Attendance Analytics</Text>
          <Text style={styles.subtitle}>Visual insights into your gym habits</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowCharts(!showCharts)}
        >
          <Ionicons 
            name={showCharts ? 'list' : 'analytics'} 
            size={20} 
            color="#2563eb" 
          />
          <Text style={styles.toggleText}>
            {showCharts ? 'List View' : 'Chart View'}
          </Text>
        </TouchableOpacity>
      </View>

      {showCharts ? (
        <>
          {/* Enhanced Stats Cards with Sparklines */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="calendar" size={20} color="#2563eb" />
                <Sparkline data={stats.sparklineData} color="#2563eb" />
              </View>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#10b981" />
                <Sparkline data={stats.sparklineData} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="trending-up" size={20} color="#f59e0b" />
                <Sparkline data={stats.sparklineData} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>
                {stats.thisMonth - stats.lastMonth > 0 ? '+' : ''}
                {stats.thisMonth - stats.lastMonth}
              </Text>
              <Text style={styles.statLabel}>vs Last Month</Text>
            </View>
          </View>

          {/* Calendar Heatmap */}
          {/* {attendanceData.length > 0 && (
            <View style={styles.chartSection}>
              <CalendarHeatmap data={attendanceData} />
            </View>
          )} */}

          {/* Circular Progress for Monthly Goal */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Monthly Goal Progress</Text>
            <View style={styles.progressContainer}>
              <CircularProgress
                progress={stats.monthlyProgress}
                size={120}
                strokeWidth={8}
                color="#2563eb"
                backgroundColor="#e5e7eb"
                text={`${stats.thisMonth}`}
                subtext={`of ${stats.monthlyGoal}`}
              />
              <View style={styles.progressText}>
                <Text style={styles.progressLabel}>Days this month</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(stats.monthlyProgress)}% complete
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Pattern Bar Chart */}
          {attendanceData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Weekly Activity Pattern</Text>
              <View style={styles.chartWrapper}>
                <BarChart
                  data={weeklyData}
                  width={screenWidth - 60}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars={true}
                  fromZero={true}
                />
              </View>
            </View>
          )}

          {/* Monthly Trend Line Chart */}
          {attendanceData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>6-Month Trend</Text>
              <View style={styles.chartWrapper}>
                <LineChart
                  data={monthlyTrendData}
                  width={screenWidth - 60}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  bezier={true}
                />
              </View>
            </View>
          )}
        </>
      ) : (
        <>
          {/* Original List View */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#2563eb" />
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{stats.thisMonth}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter by Day</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {filters.map(filter => (
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
              ))}
            </ScrollView>
          </View>

          {/* Attendance List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedFilter === 'All' ? 'All Days' : `${selectedFilter} Sessions`}
              </Text>
              <Text style={styles.resultCount}>
                {filteredAttendance.length} days
              </Text>
            </View>

            {filteredAttendance.length > 0 ? (
              filteredAttendance.slice(0, 10).map((record, index) => (
                <View key={index} style={styles.attendanceItem}>
                  <View style={styles.attendanceContent}>
                    <Text style={styles.dayName}>{record.dayName || 'Unknown'}</Text>
                    <Text style={styles.attendanceDate}>
                      {new Date(record.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-clear" size={64} color="#d1d5db" />
                <Text style={styles.emptyStateTitle}>No Records Found</Text>
                <Text style={styles.emptyStateText}>
                  Start visiting the gym to see your records here!
                </Text>
              </View>
            )}
          </View>
        </>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
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
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
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
  sparkline: {
    marginLeft: 8,
  },
  chartSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
    marginStart: -23,
  },
  heatmapContainer: {
    alignItems: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  heatmapWeek: {
    marginRight: 2,
  },
  heatmapDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressContainer: {
    alignItems: 'center',
  },
  progressText: {
    marginLeft: 20,
    alignItems: 'flex-start',
  },
  progressLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  attendanceContent: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  attendanceDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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