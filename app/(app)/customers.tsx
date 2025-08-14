import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchTechnicianJobs, Job } from "@services/jobs";

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");

  const loadJobs = async (isRefresh = false, status = "Active") => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const filters = status === "All" ? {} : { status };
      const data = await fetchTechnicianJobs({
        ...filters,
        page: 1,
        limit: 50,
      });
      
      setJobs(data.jobs);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onRefresh = () => {
    loadJobs(true, selectedStatus);
  };

  const changeStatus = (status: string) => {
    setSelectedStatus(status);
    loadJobs(false, status);
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      "Scheduled": { color: "#3B82F6", bgColor: "#DBEAFE", icon: "calendar-clock" },
      "Pending": { color: "#F59E0B", bgColor: "#FEF3C7", icon: "clock-outline" },
      "In Progress": { color: "#10B981", bgColor: "#D1FAE5", icon: "play-circle" },
      "Completed": { color: "#6B7280", bgColor: "#F3F4F6", icon: "check-circle" },
      "Cancelled": { color: "#EF4444", bgColor: "#FEE2E2", icon: "close-circle" },
    };
    return statusConfig[status] || { color: "#6B7280", bgColor: "#F3F4F6", icon: "help-circle" };
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <Pressable style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleRow}>
            <Text style={styles.jobId}>{item.job_id}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.bgColor }
            ]}>
              <MaterialCommunityIcons 
                name={statusInfo.icon as any} 
                size={14} 
                color={statusInfo.color} 
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobType}>{item.jobType}</Text>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.property.address}, {item.property.city}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Due: {formatDate(item.dueDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#6B7280" />
            <Text style={styles.detailText}>${item.paymentAmount}</Text>
            <Text style={styles.estimatedHours}>
              ({item.estimatedHours}h estimated)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.customer.name}</Text>
            <TouchableOpacity style={styles.phoneButton}>
              <MaterialCommunityIcons name="phone" size={16} color="#024974" />
            </TouchableOpacity>
          </View>
        </View>

        {item.description && (
          <Text style={styles.jobDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.jobActions}>
          {item.status === "Scheduled" && (
            <TouchableOpacity style={styles.startButton}>
              <MaterialCommunityIcons name="play" size={18} color="white" />
              <Text style={styles.startButtonText}>Start Job</Text>
            </TouchableOpacity>
          )}
          
          {item.status === "In Progress" && (
            <TouchableOpacity style={styles.completeButton}>
              <MaterialCommunityIcons name="check" size={18} color="white" />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.detailsButton}>
            <MaterialCommunityIcons name="eye" size={18} color="#024974" />
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-list" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No {selectedStatus} Jobs</Text>
      <Text style={styles.emptyText}>
        {selectedStatus === "Active" 
          ? "You don't have any active jobs at the moment"
          : `No ${selectedStatus.toLowerCase()} jobs found`
        }
      </Text>
    </View>
  );

  const statusOptions = ["Active", "Scheduled", "In Progress", "Completed"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <Text style={styles.subtitle}>
          {jobs.length} {selectedStatus.toLowerCase()} jobs
        </Text>
      </View>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              selectedStatus === status && styles.activeStatusFilter
            ]}
            onPress={() => changeStatus(status)}
          >
            <Text style={[
              styles.statusFilterText,
              selectedStatus === status && styles.activeStatusFilterText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Jobs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#024974" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#024974"]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

// Helper Functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeStatusFilter: {
    backgroundColor: '#024974',
    borderColor: '#024974',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeStatusFilterText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    marginBottom: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
    color: '#6CC48C',
    fontWeight: '500',
  },
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  estimatedHours: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  phoneButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#F0F9FF',
  },
  jobDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#024974',
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#024974',
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#024974',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});