import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { fetchJobDetails, claimJob, Job } from "@services/jobs";
import { useTheme } from "../../contexts/ThemeContext";

// Countdown Timer Component
const CountdownTimer = ({
  dueDate,
  status,
}: {
  dueDate: string;
  status: string;
}) => {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();

      // Handle invalid date
      if (isNaN(due)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOverdue: false,
        });
        return;
      }

      const difference = due - now;

      if (difference > 0) {
        // Job is not due yet
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isOverdue: false });
      } else {
        // Job is overdue
        const overdue = Math.abs(difference);
        const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((overdue % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isOverdue: true });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  // Only show countdown for scheduled or in progress jobs
  if (status !== "Scheduled" && status !== "In Progress") {
    return null;
  }

  // Handle invalid date
  if (isNaN(new Date(dueDate).getTime())) {
    return (
      <View style={[styles.countdownCard, { backgroundColor: theme.card }]}>
        <View style={styles.countdownHeader}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={theme.error}
          />
          <Text style={[styles.countdownTitle, { color: theme.text }]}>
            INVALID DUE DATE
          </Text>
        </View>
        <Text style={[styles.countdownSubtext, { color: theme.textSecondary }]}>
          Please check the job due date
        </Text>
      </View>
    );
  }

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value.toString().padStart(2, "0")}${unit}`;
  };

  const getCountdownColor = () => {
    if (timeLeft.isOverdue) {
      return theme.error;
    }
    if (timeLeft.days === 0 && timeLeft.hours < 24) {
      return theme.warning || "#F59E0B";
    }
    return theme.success;
  };

  const getCountdownText = () => {
    if (timeLeft.isOverdue) {
      return "OVERDUE";
    }
    return "DUE IN";
  };

  return (
    <View style={[styles.countdownCard, { backgroundColor: theme.card }]}>
      <View style={styles.countdownHeader}>
        <MaterialCommunityIcons
          name={timeLeft.isOverdue ? "alert-circle" : "clock-outline"}
          size={24}
          color={getCountdownColor()}
        />
        <Text style={[styles.countdownTitle, { color: theme.text }]}>
          {getCountdownText()}
        </Text>
      </View>

      <View style={styles.countdownTimer}>
        {timeLeft.days > 0 && (
          <View style={styles.timeUnit}>
            <Text style={[styles.timeValue, { color: getCountdownColor() }]}>
              {timeLeft.days}
            </Text>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
              {timeLeft.days === 1 ? "DAY" : "DAYS"}
            </Text>
          </View>
        )}

        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, { color: getCountdownColor() }]}>
            {formatTimeUnit(timeLeft.hours, "")}
          </Text>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
            HOURS
          </Text>
        </View>

        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, { color: getCountdownColor() }]}>
            {formatTimeUnit(timeLeft.minutes, "")}
          </Text>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
            MINUTES
          </Text>
        </View>

        <View style={styles.timeUnit}>
          <Text style={[styles.timeValue, { color: getCountdownColor() }]}>
            {formatTimeUnit(timeLeft.seconds, "")}
          </Text>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
            SECONDS
          </Text>
        </View>
      </View>

      <Text style={[styles.countdownSubtext, { color: theme.textSecondary }]}>
        {timeLeft.isOverdue
          ? `Overdue by ${
              timeLeft.days > 0
                ? `${timeLeft.days} day${timeLeft.days > 1 ? "s" : ""} `
                : ""
            }${timeLeft.hours}h ${timeLeft.minutes}m`
          : `Due on ${new Date(dueDate).toLocaleDateString()}`}
      </Text>
    </View>
  );
};

// Helper Functions
const formatDate = (dateString: string) => {
  if (!dateString) return "Date not available";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "#FEF3C7", text: "#F59E0B" },
    Scheduled: { bg: "#DBEAFE", text: "#3B82F6" },
    "In Progress": { bg: "#D1FAE5", text: "#10B981" },
    Completed: { bg: "#F3F4F6", text: "#6B7280" },
  };
  return colors[status] || { bg: "#F3F4F6", text: "#6B7280" };
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Low: { bg: "#D1FAE5", text: "#10B981" },
    Medium: { bg: "#FEF3C7", text: "#F59E0B" },
    High: { bg: "#FED7AA", text: "#F97316" },
    Critical: { bg: "#FEE2E2", text: "#EF4444" },
    Urgent: { bg: "#FEE2E2", text: "#EF4444" },
  };
  return colors[priority] || { bg: "#F3F4F6", text: "#6B7280" };
};

const getJobTypeIcon = (jobType: string) => {
  const icons: Record<string, string> = {
    Smoke: "smoke-detector",
    Gas: "gas-cylinder",
    Electrical: "lightning-bolt",
    Plumbing: "pipe-wrench",
    HVAC: "air-conditioner",
    "Pool Safety": "pool",
    "Routine Inspection": "clipboard-check",
    Repairs: "tools",
  };
  return icons[jobType] || "briefcase";
};

export default function JobDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingJob, setClaimingJob] = useState(false);

  const loadJobDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log("[JobDetails] Loading job with ID:", id);
      const jobData = await fetchJobDetails(id);
      console.log(
        "[JobDetails] Received job data:",
        JSON.stringify(jobData, null, 2)
      );
      setJob(jobData);
    } catch (error: any) {
      console.log("[JobDetails] Error loading job:", error);
      Alert.alert("Error", error.message || "Failed to load job details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  const handleClaimJob = async () => {
    if (!job || claimingJob) return;

    Alert.alert("Claim Job", "Are you sure you want to claim this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Claim",
        onPress: async () => {
          try {
            setClaimingJob(true);
            console.log("[JobDetails] Claiming job:", job.id);
            await claimJob(job.id);
            console.log("[JobDetails] Job claimed successfully");
            Alert.alert("Success", "Job claimed successfully!", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (error: any) {
            console.log("[JobDetails] Error claiming job:", error);
            Alert.alert("Error", error.message || "Failed to claim job");
          } finally {
            setClaimingJob(false);
          }
        },
      },
    ]);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading job details...
        </Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.error }]}>
          Job not found
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={loadJobDetails}
        >
          <Text style={[styles.retryButtonText, { color: theme.surface }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(job.status);
  const priorityColor = getPriorityColor(job.priority);

  // Check if job is due (overdue)
  const isJobDue = () => {
    const today = new Date();
    const dueDate = new Date(job.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return (
      dueDate < today &&
      (job.status === "Scheduled" || job.status === "In Progress")
    );
  };

  const isDue = isJobDue();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Job ${job.job_id}`,
          headerBackTitle: "Jobs",
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.text,
          },
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Job Header Info */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={styles.jobIdContainer}>
              <Text style={[styles.jobId, { color: theme.primary }]}>{job.job_id}</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {isDue && (
                  <View
                    style={[styles.dueBadge, { backgroundColor: theme.error }]}
                  >
                    <MaterialCommunityIcons
                      name="alert"
                      size={12}
                      color="white"
                    />
                    <Text style={styles.dueText}>DUE</Text>
                  </View>
                )}
                {job.status === "Completed" ? (
                  <View
                    style={[styles.completedBadge, { backgroundColor: "#10B981" }]}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={12}
                      color="white"
                    />
                    <Text style={styles.completedText}>COMPLETED</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusColor.text }]}
                    >
                      {job.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.jobTypeContainer}>
              <MaterialCommunityIcons
                name={getJobTypeIcon(job.jobType) as any}
                size={18}
                color={theme.success}
              />
              <Text style={[styles.jobType, { color: theme.success }]}>
                {job.jobType}
              </Text>
            </View>
            <Text
              style={[styles.jobDescription, { color: theme.textSecondary }]}
            >
              {job.title || job.description || "Job title not available"}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Countdown Timer */}
          <View style={styles.section}>
            <CountdownTimer dueDate={job.dueDate} status={job.status} />
          </View>

          {/* Job Information */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="clipboard-text"
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Job Information
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Due Date
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {formatDate(job.dueDate)}
                  </Text>
                </View>
              </View>

              {job.notes && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="note-text"
                    size={20}
                    color={theme.textSecondary}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[styles.infoLabel, { color: theme.textSecondary }]}
                    >
                      Notes
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {job.notes}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Property Details
              </Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Address
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {typeof job.property?.address === "string"
                      ? job.property.address
                      : job.property?.address?.fullAddress ||
                        "Address not available"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Property Type
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {job.property?.propertyType ||
                      "Property type not available"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text
                    style={[styles.infoLabel, { color: theme.textSecondary }]}
                  >
                    Region
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {job.property?.region || "Region not available"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color={theme.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Contact Information
              </Text>
            </View>

            {/* Tenant */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>
                Tenant
              </Text>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.text }]}>
                    {job.property?.currentTenant?.name ||
                      "Tenant not available"}
                  </Text>
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.currentTenant?.phone &&
                        handleCall(job.property.currentTenant.phone)
                      }
                    >
                      <MaterialCommunityIcons
                        name="phone"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.currentTenant?.phone ||
                          "Phone not available"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.currentTenant?.email &&
                        handleEmail(job.property.currentTenant.email)
                      }
                    >
                      <MaterialCommunityIcons
                        name="email"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.currentTenant?.email ||
                          "Email not available"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Agency */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>
                Managing Agency
              </Text>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.text }]}>
                    {job.property?.agency?.companyName ||
                      "Agency not available"}
                  </Text>
                  <Text
                    style={[
                      styles.contactPerson,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Contact:{" "}
                    {job.property?.agency?.contactPerson ||
                      "Contact not available"}
                  </Text>
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.agency?.phone &&
                        handleCall(job.property.agency.phone)
                      }
                    >
                      <MaterialCommunityIcons
                        name="phone"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.agency?.phone || "Phone not available"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.agency?.email &&
                        handleEmail(job.property.agency.email)
                      }
                    >
                      <MaterialCommunityIcons
                        name="email"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.agency?.email || "Email not available"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Landlord */}
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>
                Landlord
              </Text>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons
                  name="account-tie"
                  size={20}
                  color={theme.textSecondary}
                />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.text }]}>
                    {job.property?.currentLandlord?.name ||
                      "Landlord not available"}
                  </Text>
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.currentLandlord?.phone &&
                        handleCall(job.property.currentLandlord.phone)
                      }
                    >
                      <MaterialCommunityIcons
                        name="phone"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.currentLandlord?.phone ||
                          "Phone not available"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.contactButton,
                        {
                          backgroundColor: isDark
                            ? theme.primary + "20"
                            : "#F0F9FF",
                        },
                      ]}
                      onPress={() =>
                        job.property?.currentLandlord?.email &&
                        handleEmail(job.property.currentLandlord.email)
                      }
                    >
                      <MaterialCommunityIcons
                        name="email"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.contactButtonText,
                          { color: theme.primary },
                        ]}
                      >
                        {job.property?.currentLandlord?.email ||
                          "Email not available"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          {job.status === "Pending" && (
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  { backgroundColor: theme.primary },
                  claimingJob && {
                    backgroundColor: theme.disabled,
                    opacity: 0.7,
                  },
                ]}
                onPress={handleClaimJob}
                disabled={claimingJob}
              >
                {claimingJob ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={24}
                    color="white"
                  />
                )}
                <Text style={styles.claimButtonText}>
                  {claimingJob ? "Claiming..." : "Claim This Job"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    // paddingHorizontal: 16,
  },
  jobIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobId: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  jobTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  jobType: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 8,
  },
  jobDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  priorityContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  priorityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    backgroundColor: "#10B981",
  },
  completedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  contactPerson: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  contactActions: {
    gap: 6,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F0F9FF",
    borderRadius: 6,
    marginBottom: 4,
  },
  contactButtonText: {
    fontSize: 14,
    color: "#024974",
    marginLeft: 6,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  claimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  claimButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  countdownCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  countdownTimer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  timeUnit: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  countdownSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
