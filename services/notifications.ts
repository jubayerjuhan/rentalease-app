import { Platform } from "react-native";
import { getToken } from "./secureStore";

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;

function getBaseUrl(): string {
  if (!RAW_BASE_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_BASE_URL. Set it in .env (e.g., http://localhost:4000) and restart the dev server."
    );
  }
  try {
    const url = new URL(RAW_BASE_URL);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      if (Platform.OS === "android") {
        url.hostname = "10.0.2.2";
      } else {
        url.hostname = "127.0.0.1";
      }
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return RAW_BASE_URL;
  }
}

export type NotificationStatus = "Unread" | "Read" | "Archived";
export type NotificationPriority = "Low" | "Medium" | "High" | "Urgent" | "Normal";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  createdAt: string;
  readAt?: string | null;
  data?: Record<string, any>;
};

export async function getNotifications(options?: {
  status?: NotificationStatus;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: -1 | 1;
}): Promise<{ notifications: AppNotification[]; unreadCount?: number }> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 50));
  params.set("skip", String(options?.skip ?? 0));
  params.set("sortBy", options?.sortBy ?? "createdAt");
  params.set("sortOrder", String(options?.sortOrder ?? -1));
  if (options?.status) params.set("status", options.status);

  const response = await fetch(`${baseUrl}/api/v1/notifications?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to fetch notifications");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }

  return {
    notifications: data.data.notifications || [],
    unreadCount: data.data.unreadCount,
  };
}

export async function getUnreadCount(): Promise<number> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${baseUrl}/api/v1/notifications/unread-count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to fetch unread count");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }

  return data.data.unreadCount || 0;
}

export async function markNotificationRead(notificationId: string): Promise<AppNotification> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${baseUrl}/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to mark notification as read");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }

  return data.data.notification;
}

export async function markAllNotificationsRead(): Promise<number> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${baseUrl}/api/v1/notifications/mark-all-read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to mark all notifications as read");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }

  return data.data.modifiedCount || 0;
}

export async function archiveNotification(notificationId: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${baseUrl}/api/v1/notifications/${notificationId}/archive`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to archive notification");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${baseUrl}/api/v1/notifications/${notificationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to delete notification");
  }

  if (data.status !== "success") {
    throw new Error(data?.message || "API returned error status");
  }
}

