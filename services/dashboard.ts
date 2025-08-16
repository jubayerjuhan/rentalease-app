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
    // Normalize localhost for simulators/emulators
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      if (Platform.OS === "android") {
        url.hostname = "10.0.2.2";
      } else {
        url.hostname = "127.0.0.1";
      }
    }
    // Remove trailing slash
    return url.toString().replace(/\/$/, "");
  } catch {
    return RAW_BASE_URL;
  }
}

export type QuickStats = {
  totalJobs: number;
  activeJobs: number;
  scheduledJobs: number;
  completedJobs: number;
  overdueJobs: number;
};

export type JobStatusDistribution = {
  status: string;
  count: number;
  percentage: number;
};

export type WeeklyProgress = {
  day: string;
  completed: number;
  scheduled: number;
};

export type RecentJob = {
  id: string;
  job_id: string;
  jobType: string;
  status: string;
  dueDate: string;
  updatedAt: string;
  property: string | {
    address?: string | {
      fullAddress?: string;
      street?: string;
      suburb?: string;
      state?: string;
      postcode?: string;
    };
  };
};

export type PaymentStats = {
  totalPayments: number;
  pendingPayments: number;
  totalAmount: number;
  pendingAmount: number;
};

export type DashboardData = {
  quickStats: QuickStats;
  jobStatusDistribution: JobStatusDistribution[];
  weeklyProgress: WeeklyProgress[];
  recentJobs: RecentJob[];
  paymentStats: PaymentStats;
  lastUpdated: string;
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const baseUrl = getBaseUrl();
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token found");
  }
  
  try {
    const res = await fetch(`${baseUrl}/api/v1/technicians/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    
    const json = await res.json();
    
    if (!res.ok) {
      throw new Error(json?.message || "Failed to fetch dashboard data");
    }
    
    return json.data;
  } catch (e: any) {
    console.log("[fetchDashboardData] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}