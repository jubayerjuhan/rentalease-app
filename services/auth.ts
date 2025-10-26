import { Platform } from "react-native";
import { deleteToken } from "./secureStore";

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;

function getBaseUrl(): string {
  if (!RAW_BASE_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_BASE_URL. Set it in .env (e.g., http://localhost:4000) and restart the dev server."
    );
  }
  try {
    const url = new URL(RAW_BASE_URL);
    console.log(url.hostname, "URL Hostname...");
    // Normalize localhost for simulators/emulators
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      if (Platform.OS === "android") {
        // Android emulator maps host machine to 10.0.2.2
        url.hostname = "10.0.2.2";
      } else {
        // iOS simulator works with 127.0.0.1
        url.hostname = "127.0.0.1";
      }
    }
    // Remove trailing slash
    return url.toString().replace(/\/$/, "");
  } catch {
    return RAW_BASE_URL;
  }
}

export type Technician = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "Active" | string;
  availabilityStatus: string;
  currentJobs: number;
  maxJobs: number;
  owner: { ownerType: "Agency" | "SuperUser"; ownerId: string };
};

export async function technicianLogin(
  email: string,
  password: string
): Promise<{ technician: Technician; token: string }> {
  const baseUrl = getBaseUrl();
  const payload = { email, password };
  console.log("[technicianLogin] base", baseUrl);
  console.log("[technicianLogin] payload", payload);
  console.log("[technicianLogin] payload stringified", JSON.stringify(payload));
  try {
    const res = await fetch(`${baseUrl}/api/v1/technician/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("[technicianLogin] status", res.status);
    const json = await res.json();
    console.log("[technicianLogin] response", json);
    if (!res.ok) throw new Error(json?.message || "Login failed");
    return json.data;
  } catch (e: any) {
    console.log("[technicianLogin] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

export async function technicianForgotPassword(email: string): Promise<string> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/technician/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Failed to send OTP");
    return json.message;
  } catch (e: any) {
    console.log("[technicianForgotPassword] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

export async function technicianResetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<string> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/technician/auth/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Failed to reset password");
    return json.message;
  } catch (e: any) {
    console.log("[technicianResetPassword] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

export async function technicianLogout(): Promise<void> {
  try {
    await deleteToken();
    console.log("[technicianLogout] Token deleted successfully");
  } catch (error) {
    console.log("[technicianLogout] Error deleting token:", error);
    throw error;
  }
}
