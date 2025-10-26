import { BASE_URL } from "../config/api";
import { getToken } from "./secureStore";

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
  const baseUrl = BASE_URL;
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