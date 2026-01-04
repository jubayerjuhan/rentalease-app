import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import {
  AppNotification,
  NotificationStatus,
  archiveNotification,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications";

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [unreadCount, setUnreadCount] = useState(0);

  const statusFilter: NotificationStatus | undefined = useMemo(() => {
    if (filter === "Unread") return "Unread";
    return undefined;
  }, [filter]);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [list, count] = await Promise.all([
          getNotifications({ status: statusFilter, limit: 50, skip: 0 }),
          getUnreadCount().catch(() => unreadCount),
        ]);
        setItems(list.notifications || []);
        setUnreadCount(typeof count === "number" ? count : unreadCount);
      } catch (e: any) {
        const message = e?.message || "Failed to load notifications";
        if (message.includes("Authentication expired")) {
          Alert.alert("Session Expired", "Please login again to continue.", [
            { text: "OK", onPress: () => router.replace("/(auth)/login") },
          ]);
        } else {
          Alert.alert("Error", message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, statusFilter, unreadCount]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const onRefresh = () => load(true);

  const handleOpen = async (n: AppNotification) => {
    try {
      if (n.status === "Unread") {
        setBusyId(n.id);
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, status: "Read" } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      const jobId = n.data?.jobId || n.data?.job?._id || n.data?.job?.id;
      if (jobId) {
        router.push(`/job-details/${jobId}`);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to open notification");
    } finally {
      setBusyId(null);
    }
  };

  const handleActions = (n: AppNotification) => {
    Alert.alert(n.title, n.message, [
      n.status === "Unread"
        ? {
            text: "Mark as Read",
            onPress: async () => {
              try {
                setBusyId(n.id);
                await markNotificationRead(n.id);
                setItems((prev) =>
                  prev.map((item) =>
                    item.id === n.id ? { ...item, status: "Read" } : item
                  )
                );
                setUnreadCount((c) => Math.max(0, c - 1));
              } catch (e: any) {
                Alert.alert("Error", e?.message || "Failed to mark as read");
              } finally {
                setBusyId(null);
              }
            },
          }
        : undefined,
      {
        text: "Archive",
        onPress: async () => {
          try {
            setBusyId(n.id);
            await archiveNotification(n.id);
            setItems((prev) => prev.filter((item) => item.id !== n.id));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to archive");
          } finally {
            setBusyId(null);
          }
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setBusyId(n.id);
            await deleteNotification(n.id);
            setItems((prev) => prev.filter((item) => item.id !== n.id));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete");
          } finally {
            setBusyId(null);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ].filter(Boolean) as any);
  };

  const markAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, status: "Read" })));
      setUnreadCount(0);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isUnread = item.status === "Unread";
    return (
      <TouchableOpacity
        onPress={() => handleOpen(item)}
        onLongPress={() => handleActions(item)}
        activeOpacity={0.85}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isUnread ? theme.primary : theme.border,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: theme.text, fontWeight: isUnread ? "800" : "700" },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {isUnread && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
          </View>
          {busyId === item.id && (
            <ActivityIndicator size="small" color={theme.primary} />
          )}
        </View>

        <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>

        <Text style={[styles.meta, { color: theme.textTertiary }]}>
          {formatTime(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  const empty = (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="bell-outline" size={60} color={theme.textTertiary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications</Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {filter === "Unread" ? "You’re all caught up." : "Notifications will appear here."}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerShown: true,
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.text, fontWeight: "700" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={markAllRead}
              style={{ paddingHorizontal: 12, paddingVertical: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Mark all read"
            >
              <Text style={{ color: theme.primary, fontWeight: "700" }}>Mark all</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFilter("All")}
          style={[
            styles.filterPill,
            {
              backgroundColor: filter === "All" ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={{ color: filter === "All" ? "white" : theme.text, fontWeight: "700" }}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("Unread")}
          style={[
            styles.filterPill,
            {
              backgroundColor: filter === "Unread" ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={{ color: filter === "Unread" ? "white" : theme.text, fontWeight: "700" }}>
            Unread
          </Text>
        </TouchableOpacity>

        <View style={styles.countWrap}>
          <MaterialCommunityIcons name="bell" size={18} color={theme.textSecondary} />
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {unreadCount} unread
          </Text>
        </View>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={empty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          contentContainerStyle={[styles.listContent, items.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  countWrap: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: { fontSize: 13, fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titleRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  message: { marginTop: 6, fontSize: 14, lineHeight: 18 },
  meta: { marginTop: 8, fontSize: 12 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { marginTop: 10, fontSize: 15, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 6, fontSize: 14, textAlign: "center" },
});

