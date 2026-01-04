import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
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

function getExpoProjectId(): string | undefined {
  const expoConfig: any = (Constants as any).expoConfig;
  const easConfig: any = (Constants as any).easConfig;
  return (
    easConfig?.projectId ||
    expoConfig?.extra?.eas?.projectId ||
    expoConfig?.extra?.eas?.projectId ||
    undefined
  );
}

export async function registerForPushNotificationsIfPossible(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const permission = await Notifications.getPermissionsAsync();
  let status = permission.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#024974",
    });
  }

  const projectId = getExpoProjectId();
  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return token.data;
}

export async function sendPushTokenToBackend(expoPushToken: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  if (!token) return;

  const response = await fetch(`${baseUrl}/api/v1/technician/auth/push-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: expoPushToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Authentication expired. Please login again.");
    }
    throw new Error(data?.message || "Failed to register push token");
  }
}

