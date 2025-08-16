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

export type Job = {
  id: string;
  job_id: string;
  jobType: string;
  status: "Available" | "Pending" | "Scheduled" | "In Progress" | "Active" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical" | "Urgent";
  title?: string;
  description: string;
  property: {
    address?: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      fullAddress: string;
    } | string;
    currentTenant?: {
      name: string;
      email: string;
      phone: string;
    };
    currentLandlord?: {
      name: string;
      email: string;
      phone: string;
    };
    propertyType?: string;
    region?: string;
    agency?: {
      _id: string;
      companyName: string;
      contactPerson: string;
      email: string;
      phone: string;
    };
  };
  createdAt: string;
  dueDate: string;
  estimatedDuration?: number;
  cost?: {
    materialCost: number;
    laborCost: number;
    totalCost: number;
  };
  notes?: string;
  assignedTechnician?: any;
  isOverdue?: boolean;
};

export type JobsResponse = {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type JobFilters = {
  status?: string;
  jobType?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// Fetch available jobs
export async function fetchAvailableJobs(
  filters: JobFilters = {}
): Promise<JobsResponse> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  // Default to pending jobs if no status filter specified
  if (!filters.status) {
    queryParams.append("status", "Pending");
  }

  // Default query parameters for available jobs
  if (!filters.limit) {
    queryParams.append("limit", "50");
  }
  if (!filters.sortBy) {
    queryParams.append("sortBy", "dueDate");
  }
  if (!filters.sortOrder) {
    queryParams.append("sortOrder", "asc");
  }

  try {
    const url = `${baseUrl}/api/v1/jobs/available-jobs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("[fetchAvailableJobs] URL:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    console.log(json, "JSON Response...");
    console.log(JSON.stringify(json), "JSON Stringify Response...");
    console.log(
      "First job structure:",
      JSON.stringify(json.data?.jobs?.[0], null, 2)
    );

    if (!res.ok) {
      throw new Error(json?.message || "Failed to fetch available jobs");
    }

    return json.data;
  } catch (e: any) {
    console.log("[fetchAvailableJobs] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

// Fetch technician's assigned jobs
export async function fetchTechnicianJobs(
  filters: JobFilters = {}
): Promise<JobsResponse> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  // Set default pagination if not provided
  if (!filters.page) {
    queryParams.append("page", "1");
  }
  if (!filters.limit) {
    queryParams.append("limit", "50");
  }

  try {
    const url = `${baseUrl}/api/v1/technicians/jobs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("[fetchTechnicianJobs] URL:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    console.log("[fetchTechnicianJobs] Response:", JSON.stringify(json, null, 2));

    if (!res.ok) {
      // Handle specific authentication errors
      if (res.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error(json?.message || "Failed to fetch technician jobs");
    }

    if (json.status !== "success") {
      throw new Error(json?.message || "API returned error status");
    }

    return json.data;
  } catch (e: any) {
    console.log("[fetchTechnicianJobs] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

// Claim a job
export async function claimJob(jobId: string): Promise<{ message: string }> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/claim`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.message || "Failed to claim job");
    }

    return json;
  } catch (e: any) {
    console.log("[claimJob] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

// Get job details
export async function fetchJobDetails(jobId: string): Promise<Job> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    console.log("[fetchJobDetails] Response:", JSON.stringify(json, null, 2));

    if (!res.ok) {
      throw new Error(json?.message || "Failed to fetch job details");
    }

    return json.data.job;
  } catch (e: any) {
    console.log("[fetchJobDetails] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}

// Complete a job with optional report and invoice
export async function completeJob(
  jobId: string,
  completionData: {
    reportFile?: {
      uri: string;
      name: string;
      type: string;
      size: number;
    };
    hasInvoice: boolean;
    invoiceData?: {
      description: string;
      lineItems: Array<{
        id: string;
        name: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
      taxPercentage: number;
      subtotal: number;
      taxAmount: number;
      total: number;
      notes?: string;
    };
  }
): Promise<{ message: string; job: Job }> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add invoice flag
    formData.append("hasInvoice", completionData.hasInvoice.toString());
    
    // Add invoice data if provided
    if (completionData.hasInvoice && completionData.invoiceData) {
      const invoiceDataString = JSON.stringify(completionData.invoiceData);
      console.log("[completeJob] Invoice data string:", invoiceDataString);
      formData.append("invoiceData", invoiceDataString);
    }
    
    // Add report file if provided
    if (completionData.reportFile) {
      formData.append("reportFile", {
        uri: completionData.reportFile.uri,
        type: completionData.reportFile.type,
        name: completionData.reportFile.name,
      } as any);
    }

    console.log("[completeJob] Sending completion data for job:", jobId);

    const res = await fetch(`${baseUrl}/api/v1/jobs/${jobId}/complete`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    const json = await res.json();
    console.log("[completeJob] Response:", JSON.stringify(json, null, 2));

    if (!res.ok) {
      throw new Error(json?.message || "Failed to complete job");
    }

    return json.data || json;
  } catch (e: any) {
    console.log("[completeJob] error", {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw new Error(e?.message || "Network request failed");
  }
}
