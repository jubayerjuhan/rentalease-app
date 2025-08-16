import React, { useState, useEffect, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchTechnicianJobs, Job } from "@services/jobs";
import { useRouter } from "expo-router";
import { useTheme, Theme } from "../../contexts/ThemeContext";

export default function ActiveJobsPage() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(
    async (isRefresh = false, status = "Active") => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);

        const filters = status === "All" ? {} : { status };
        const data = await fetchTechnicianJobs({
          ...filters,
          page: 1,
          limit: 50,
        });

        setJobs(data.jobs || []);
      } catch (error: any) {
        console.log("[MyJobs] Error loading jobs:", error);
        setError(error.message || "Failed to load jobs");

        // Handle authentication errors specifically
        if (error.message?.includes("Authentication expired")) {
          Alert.alert("Session Expired", "Please login again to continue.", [
            { text: "OK", onPress: () => router.replace("/(auth)/login") },
          ]);
        } else {
          Alert.alert("Error", error.message || "Failed to load jobs");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadJobs(false, selectedStatus);
  }, [loadJobs, selectedStatus]);

  const onRefresh = useCallback(() => {
    loadJobs(true, selectedStatus);
  }, [loadJobs, selectedStatus]);

  const changeStatus = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      Scheduled: {
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "calendar-clock",
      },
      Pending: { color: "#F59E0B", bgColor: "#FEF3C7", icon: "clock-outline" },
      "In Progress": {
        color: "#10B981",
        bgColor: "#D1FAE5",
        icon: "play-circle",
      },
      Completed: { color: "#6B7280", bgColor: "#F3F4F6", icon: "check-circle" },
      Cancelled: { color: "#EF4444", bgColor: "#FEE2E2", icon: "close-circle" },
    };
    return (
      statusConfig[status] || {
        color: "#6B7280",
        bgColor: "#F3F4F6",
        icon: "help-circle",
      }
    );
  };

  const renderJobCard = useCallback(
    ({ item }: { item: Job }) => {
      const statusInfo = getStatusInfo(item.status);

      const getPropertyAddress = () => {
        if (typeof item.property?.address === "string") {
          return item.property.address;
        }
        return item.property?.address?.fullAddress || "Address not available";
      };

      const getTenantName = () => {
        return item.property?.currentTenant?.name || "Tenant not available";
      };

      const getTenantPhone = () => {
        return item.property?.currentTenant?.phone;
      };

      const handleJobPress = () => {
        router.push(`/job-details/${item.id}`);
      };

      const handlePhonePress = () => {
        const phone = getTenantPhone();
        if (phone) {
          // Handle phone call
          console.log("Calling:", phone);
        }
      };

      // Check if job can be completed (due date is today or past)
      const canCompleteJob = () => {
        const today = new Date();
        const dueDate = new Date(item.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= today;
      };

      return (
        <View
          style={[
            styles.jobCard,
            { backgroundColor: theme.card, borderLeftColor: theme.primary },
          ]}
        >
          <View style={styles.jobHeader}>
            <View style={styles.jobTitleRow}>
              <View
                style={[
                  styles.jobIdContainer,
                  {
                    backgroundColor: isDark ? theme.primary + "20" : "#F0F9FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="briefcase-outline"
                  size={16}
                  color={theme.primary}
                />
                <Text style={[styles.jobId, { color: theme.primary }]}>
                  {item.job_id}
                </Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: statusInfo.bgColor },
                ]}
              >
                <Text
                  style={[styles.priorityText, { color: statusInfo.color }]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={[styles.jobTitle, { color: theme.text }]}>
              {item.title || item.description || "Job Title"}
            </Text>
            <View style={styles.jobTypeContainer}>
              <MaterialCommunityIcons
                name="wrench"
                size={16}
                color={theme.success}
              />
              <Text style={[styles.jobType, { color: theme.success }]}>
                {item.jobType}
              </Text>
            </View>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {getPropertyAddress()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Due: {formatDate(item.dueDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="account"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {getTenantName()}
              </Text>
              {getTenantPhone() && (
                <TouchableOpacity
                  style={[
                    styles.phoneButton,
                    { backgroundColor: theme.background },
                  ]}
                  onPress={handlePhonePress}
                >
                  <MaterialCommunityIcons
                    name="phone"
                    size={16}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="account-hard-hat"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Technician: Juhan
              </Text>
            </View>
          </View>

          {item.description && (
            <Text
              style={[styles.jobDescription, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.jobActions}>
            {(item.status === "Scheduled" || item.status === "In Progress") &&
              canCompleteJob() && (
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.completeButtonText}>Complete Job</Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              style={[
                styles.viewButton,
                { backgroundColor: theme.surface, borderColor: theme.primary },
              ]}
              onPress={handleJobPress}
            >
              <MaterialCommunityIcons
                name="eye"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.viewButtonText, { color: theme.primary }]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [router, theme, isDark]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="clipboard-list"
          size={64}
          color={theme.textTertiary}
        />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No {selectedStatus} Jobs
        </Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {selectedStatus === "Active"
            ? "You don't have any active jobs at the moment"
            : `No ${selectedStatus.toLowerCase()} jobs found`}
        </Text>
      </View>
    ),
    [selectedStatus, theme]
  );

  const renderErrorState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.emptyTitle}>Error Loading Jobs</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadJobs(false, selectedStatus)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    ),
    [error, loadJobs, selectedStatus]
  );

  const statusOptions = ["Active", "Scheduled", "In Progress", "Completed"];
  const styles = createStyles(theme);

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusFilterContainer}
        style={styles.statusFilterScrollView}
      >
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              selectedStatus === status && styles.activeStatusFilter,
            ]}
            onPress={() => changeStatus(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === status && styles.activeStatusFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: 100 }, // Add bottom padding for tab navigation
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      )}
    </View>
  );
}

// Helper Functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours =
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 24,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    statusFilterScrollView: {
      paddingTop: 16,
      paddingBottom: 16,
    },
    statusFilterContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    statusFilterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    activeStatusFilter: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    statusFilterText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    activeStatusFilterText: {
      color: theme.surface,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    listContainer: {
      paddingTop: 8,
      paddingBottom: 20,
    },
    jobCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    jobHeader: {
      marginBottom: 12,
    },
    jobTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    jobIdContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F0F9FF",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    jobId: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.primary,
      marginLeft: 6,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: "500",
      color: "#1F2937",
    },
    jobTypeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    jobTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    jobType: {
      fontSize: 14,
      color: theme.success,
      fontWeight: "600",
      marginLeft: 6,
    },
    jobDetails: {
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    detailText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
    estimatedHours: {
      fontSize: 12,
      color: theme.textTertiary,
      marginLeft: 4,
    },
    phoneButton: {
      padding: 4,
      borderRadius: 4,
      backgroundColor: theme.background,
    },
    jobDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    jobActions: {
      flexDirection: "row",
      gap: 8,
    },
    completeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 8,
    },
    completeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 6,
    },
    viewButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: theme.primary,
      paddingVertical: 12,
      borderRadius: 8,
    },
    viewButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 6,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 100,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 32,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.surface,
      fontSize: 16,
      fontWeight: "600",
    },
  });
