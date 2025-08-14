import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart, BarChart } from "react-native-chart-kit";
import { fetchDashboardData, DashboardData } from "@services/dashboard";

const screenWidth = Dimensions.get("window").width;

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    loadDashboardData(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#024974" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No dashboard data available</Text>
      </View>
    );
  }

  // Prepare chart data
  const pieChartData = dashboardData.jobStatusDistribution.map((item, index) => ({
    name: item.status,
    count: item.count,
    color: getStatusColor(item.status, index),
    legendFontColor: "#1F2937",
    legendFontSize: 12,
  }));

  const barChartData = {
    labels: dashboardData.weeklyProgress.map(item => item.day),
    datasets: [
      {
        data: dashboardData.weeklyProgress.map(item => item.completed),
        color: (opacity = 1) => `rgba(2, 73, 116, ${opacity})`,
      },
      {
        data: dashboardData.weeklyProgress.map(item => item.scheduled),
        color: (opacity = 1) => `rgba(108, 196, 140, ${opacity})`,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#024974"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <StatCard
          title="Total Jobs"
          value={dashboardData.quickStats.totalJobs}
          icon="briefcase"
          color="#024974"
        />
        <StatCard
          title="Active Jobs"
          value={dashboardData.quickStats.activeJobs}
          icon="clock-outline"
          color="#6CC48C"
        />
        <StatCard
          title="Completed"
          value={dashboardData.quickStats.completedJobs}
          icon="check-circle"
          color="#10B981"
        />
        <StatCard
          title="Overdue"
          value={dashboardData.quickStats.overdueJobs}
          icon="alert-circle"
          color="#EF4444"
        />
      </View>

      {/* Job Status Distribution Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Job Status Distribution</Text>
        <PieChart
          data={pieChartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(2, 73, 116, ${opacity})`,
          }}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <Text style={styles.chartSubtitle}>Completed vs Scheduled Jobs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={barChartData}
            width={Math.max(screenWidth - 32, 400)}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(2, 73, 116, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={styles.chart}
            verticalLabelRotation={0}
          />
        </ScrollView>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#024974" }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#6CC48C" }]} />
            <Text style={styles.legendText}>Scheduled</Text>
          </View>
        </View>
      </View>

      {/* Payment Stats */}
      <View style={styles.paymentContainer}>
        <Text style={styles.sectionTitle}>Payment Overview</Text>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentCard}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color="#024974" />
            <Text style={styles.paymentLabel}>Total Amount</Text>
            <Text style={styles.paymentValue}>${dashboardData.paymentStats.totalAmount}</Text>
          </View>
          <View style={styles.paymentCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" />
            <Text style={styles.paymentLabel}>Pending Amount</Text>
            <Text style={styles.paymentValue}>${dashboardData.paymentStats.pendingAmount}</Text>
          </View>
        </View>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentCard}>
            <MaterialCommunityIcons name="file-document" size={24} color="#10B981" />
            <Text style={styles.paymentLabel}>Total Payments</Text>
            <Text style={styles.paymentValue}>{dashboardData.paymentStats.totalPayments}</Text>
          </View>
          <View style={styles.paymentCard}>
            <MaterialCommunityIcons name="file-clock" size={24} color="#EF4444" />
            <Text style={styles.paymentLabel}>Pending Payments</Text>
            <Text style={styles.paymentValue}>{dashboardData.paymentStats.pendingPayments}</Text>
          </View>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.recentJobsContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboardData.recentJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobInfo}>
              <Text style={styles.jobId}>{job.job_id}</Text>
              <Text style={styles.jobType}>{job.jobType}</Text>
              <Text style={styles.jobProperty}>{job.property}</Text>
            </View>
            <View style={styles.jobStatus}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColor(job.status) }
              ]}>
                <Text style={styles.statusText}>{job.status}</Text>
              </View>
              <Text style={styles.jobDate}>
                {formatDate(job.dueDate)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Last Updated */}
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Last updated: {formatDateTime(dashboardData.lastUpdated)}
        </Text>
      </View>
    </ScrollView>
  );
}

// Helper Components
const StatCard = ({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

// Helper Functions
const getStatusColor = (status: string, index: number) => {
  const colors = {
    "Completed": "#10B981",
    "Active": "#F59E0B", 
    "Scheduled": "#3B82F6",
    "Overdue": "#EF4444",
  };
  return colors[status] || `hsl(${index * 60}, 70%, 50%)`;
};

const getStatusBadgeColor = (status: string) => {
  const colors = {
    "Completed": "#D1FAE5",
    "Active": "#FEF3C7",
    "Scheduled": "#DBEAFE", 
    "Overdue": "#FEE2E2",
  };
  return colors[status] || "#F3F4F6";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#012D4F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (screenWidth - 48) / 2,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  recentJobsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  jobInfo: {
    flex: 1,
  },
  jobId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  jobType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  jobProperty: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  jobStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  jobDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});