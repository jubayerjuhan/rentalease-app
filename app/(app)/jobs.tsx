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
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchAvailableJobs, claimJob, Job, JobFilters } from "@services/jobs";
import { useTheme } from "../../contexts/ThemeContext";

// Helper Functions
const getPriorityColor = (priority: string) => {
  const colors = {
    Low: "#D1FAE5",
    Medium: "#FEF3C7", 
    High: "#FED7AA",
    Critical: "#FEE2E2",
  };
  return colors[priority] || "#F3F4F6";
};

const getJobTypeIcon = (jobType: string) => {
  const icons = {
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function JobsPage() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [claimingJobs, setClaimingJobs] = useState<Set<string>>(new Set());

  const loadJobs = async (isRefresh = false, filters: JobFilters = {}) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (filters.page === 1) setLoading(true);
      
      const data = await fetchAvailableJobs({
        ...filters,
        page: filters.page || 1,
        limit: 15,
        search: searchQuery || undefined,
      });
      
      if (filters.page === 1 || isRefresh) {
        setJobs(data.jobs);
      } else {
        setJobs(prev => [...prev, ...data.jobs]);
      }
      
      setPagination(data.pagination);
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
    loadJobs(true, { page: 1 });
  };

  const onSearch = () => {
    loadJobs(false, { page: 1 });
  };

  const onLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      setLoadingMore(true);
      loadJobs(false, { page: pagination.currentPage + 1 }).finally(() => {
        setLoadingMore(false);
      });
    }
  };

  const handleClaimJob = async (jobId: string) => {
    if (claimingJobs.has(jobId)) return;
    
    Alert.alert(
      "Claim Job",
      "Are you sure you want to claim this job?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Claim",
          onPress: async () => {
            try {
              setClaimingJobs(prev => new Set(prev).add(jobId));
              console.log("[JobsPage] Claiming job:", jobId);
              await claimJob(jobId);
              console.log("[JobsPage] Job claimed successfully");
              Alert.alert("Success", "Job claimed successfully!");
              onRefresh();
            } catch (error: any) {
              console.log("[JobsPage] Error claiming job:", error);
              Alert.alert("Error", error.message || "Failed to claim job");
            } finally {
              setClaimingJobs(prev => {
                const newSet = new Set(prev);
                newSet.delete(jobId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterModal(false);
    const filterMap: Record<string, JobFilters> = {
      "All": {},
      "High Priority": { priority: "High" },
      "Medium Priority": { priority: "Medium" },
      "Smoke": { jobType: "Smoke" },
      "Gas": { jobType: "Gas" },
      "Electrical": { jobType: "Electrical" },
    };
    loadJobs(false, { ...filterMap[filter], page: 1 });
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <View style={[styles.jobCard, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleRow}>
          <View style={[styles.jobIdContainer, { backgroundColor: isDark ? theme.primary + '20' : '#F0F9FF' }]}>
            <MaterialCommunityIcons name="briefcase-outline" size={16} color={theme.primary} />
            <Text style={[styles.jobId, { color: theme.primary }]}>{item.job_id}</Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) }
          ]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
        </View>
        <Text style={[styles.jobTitle, { color: theme.text }]}>{item.title || item.description}</Text>
        <View style={styles.jobTypeContainer}>
          <MaterialCommunityIcons 
            name={getJobTypeIcon(item.jobType)} 
            size={16} 
            color={theme.success} 
          />
          <Text style={[styles.jobType, { color: theme.success }]}>{item.jobType}</Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {item.property.address.fullAddress}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            Due: {formatDate(item.dueDate)}
          </Text>
        </View>


        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{item.property.currentTenant.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="office-building" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>{item.property.currentLandlord.name}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={[styles.jobDescription, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesText, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      )}

      <View style={styles.jobActions}>
        <TouchableOpacity
          style={[
            styles.claimButton, 
            { backgroundColor: theme.primary },
            claimingJobs.has(item.id) && { backgroundColor: theme.disabled, opacity: 0.7 }
          ]}
          onPress={() => handleClaimJob(item.id)}
          disabled={claimingJobs.has(item.id)}
        >
          {claimingJobs.has(item.id) ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="account-plus" size={20} color="white" />
          )}
          <Text style={styles.claimButtonText}>
            {claimingJobs.has(item.id) ? "Claiming..." : "Claim Job"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.viewButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
          onPress={() => router.push(`/job-details/${item.id}`)}
        >
          <MaterialCommunityIcons name="eye" size={20} color={theme.primary} />
          <Text style={[styles.viewButtonText, { color: theme.primary }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="briefcase-search" size={64} color={theme.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Available Jobs</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {searchQuery ? "Try adjusting your search or filters" : "Check back later for new opportunities"}
      </Text>
    </View>
  );

  const filterOptions = ["All", "High Priority", "Medium Priority", "Smoke", "Gas", "Electrical"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Available Jobs</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{pagination.totalItems} jobs available</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search jobs..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.surface }]}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialCommunityIcons name="filter" size={20} color={theme.primary} />
          <Text style={[styles.filterButtonText, { color: theme.primary }]}>{selectedFilter}</Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      {loading && jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) => `${item.id}-${item.job_id}-${index}`}
          renderItem={renderJobCard}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingMoreText, { color: theme.textSecondary }]}>Loading more jobs...</Text>
              </View>
            ) : pagination.hasNextPage ? (
              <TouchableOpacity style={[styles.loadMoreButton, { backgroundColor: theme.surface, borderColor: theme.primary }]} onPress={onLoadMore}>
                <Text style={[styles.loadMoreText, { color: theme.primary }]}>Load More Jobs</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={theme.primary} />
              </TouchableOpacity>
            ) : jobs.length > 0 ? (
              <View style={styles.endOfList}>
                <Text style={[styles.endOfListText, { color: theme.textTertiary }]}>You've reached the end</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable style={[styles.modalOverlay, { backgroundColor: theme.overlay }]} onPress={() => setShowFilterModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filter Jobs</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  selectedFilter === option && { backgroundColor: isDark ? theme.primary + '20' : '#F0F9FF' }
                ]}
                onPress={() => applyFilter(option)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: theme.text },
                  selectedFilter === option && { color: theme.primary, fontWeight: '500' }
                ]}>
                  {option}
                </Text>
                {selectedFilter === option && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#024974',
    fontWeight: '500',
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
    paddingTop: 8,
    paddingBottom: 20,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#024974',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 16,
    color: '#024974',
    fontWeight: '600',
    marginRight: 8,
  },
  endOfList: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  endOfListText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#024974',
  },
  jobHeader: {
    marginBottom: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  jobId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#024974',
    marginLeft: 6,
  },
  jobTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 6,
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
  jobDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#024974',
    paddingVertical: 12,
    borderRadius: 8,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#024974',
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#024974',
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    maxWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedFilterOption: {
    backgroundColor: '#F0F9FF',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  selectedFilterOptionText: {
    color: '#024974',
    fontWeight: '500',
  },
});