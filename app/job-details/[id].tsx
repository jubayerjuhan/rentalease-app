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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>Job not found</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={loadJobDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = getStatusColor(job.status);
  const priorityColor = getPriorityColor(job.priority);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.jobIdContainer}>
            <Text style={styles.jobId}>{job.job_id}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {job.status}
              </Text>
            </View>
          </View>
          <View style={styles.jobTypeContainer}>
            <MaterialCommunityIcons
              name={getJobTypeIcon(job.jobType) as any}
              size={18}
              color="#10B981"
            />
            <Text style={styles.jobType}>{job.jobType}</Text>
          </View>
          <Text style={styles.jobDescription}>
            {job.title || job.description || "Job title not available"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#6B7280"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>{formatDate(job.dueDate)}</Text>
              </View>
            </View>

            {job.notes && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={20}
                  color="#6B7280"
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.infoValue}>{job.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#6B7280"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {job.property?.address?.fullAddress ||
                    "Address not available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="home" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Property Type</Text>
                <Text style={styles.infoValue}>
                  {job.property?.propertyType || "Property type not available"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map" size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Region</Text>
                <Text style={styles.infoValue}>
                  {job.property?.region || "Region not available"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {/* Tenant */}
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Tenant</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#6B7280"
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {job.property?.currentTenant?.name || "Tenant not available"}
                </Text>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.currentTenant?.phone &&
                      handleCall(job.property.currentTenant.phone)
                    }
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
                      {job.property?.currentTenant?.phone ||
                        "Phone not available"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.currentTenant?.email &&
                      handleEmail(job.property.currentTenant.email)
                    }
                  >
                    <MaterialCommunityIcons
                      name="email"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
                      {job.property?.currentTenant?.email ||
                        "Email not available"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Agency */}
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Managing Agency</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="office-building"
                size={20}
                color="#6B7280"
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {job.property?.agency?.companyName || "Agency not available"}
                </Text>
                <Text style={styles.contactPerson}>
                  Contact:{" "}
                  {job.property?.agency?.contactPerson ||
                    "Contact not available"}
                </Text>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.agency?.phone &&
                      handleCall(job.property.agency.phone)
                    }
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
                      {job.property?.agency?.phone || "Phone not available"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.agency?.email &&
                      handleEmail(job.property.agency.email)
                    }
                  >
                    <MaterialCommunityIcons
                      name="email"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
                      {job.property?.agency?.email || "Email not available"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Landlord */}
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Landlord</Text>
            <View style={styles.contactRow}>
              <MaterialCommunityIcons
                name="account-tie"
                size={20}
                color="#6B7280"
              />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {job.property?.currentLandlord?.name ||
                    "Landlord not available"}
                </Text>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.currentLandlord?.phone &&
                      handleCall(job.property.currentLandlord.phone)
                    }
                  >
                    <MaterialCommunityIcons
                      name="phone"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
                      {job.property?.currentLandlord?.phone ||
                        "Phone not available"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      job.property?.currentLandlord?.email &&
                      handleEmail(job.property.currentLandlord.email)
                    }
                  >
                    <MaterialCommunityIcons
                      name="email"
                      size={16}
                      color="#024974"
                    />
                    <Text style={styles.contactButtonText}>
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
                claimingJob && { backgroundColor: theme.disabled, opacity: 0.7 },
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
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerContent: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
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
});
