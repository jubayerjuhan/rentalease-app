import { BASE_URL } from "../config/api";
import { getToken } from "./secureStore";

export type TechnicianProfile = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  hourlyRate: number;
  availabilityStatus: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    fullAddress: string;
  };
  documents: any[];
  createdAt: string;
  profileImage?: {
    cloudinaryId: string;
    cloudinaryUrl: string;
    uploadDate: string;
  };
};

export type ProfileUpdateData = {
  firstName: string;
  lastName: string;
  phone: string;
  experience: number;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    fullAddress: string;
  };
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

// Get technician profile
export async function getProfile(): Promise<TechnicianProfile> {
  const baseUrl = BASE_URL;
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/technician/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("[Profile] Get profile response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error(data?.message || "Failed to get profile");
    }

    if (data.status !== "success") {
      throw new Error(data?.message || "API returned error status");
    }

    return data.data.technician;
  } catch (error: any) {
    console.log("[Profile] Get profile error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(error?.message || "Network request failed");
  }
}

// Update technician profile
export async function updateProfile(profileData: ProfileUpdateData): Promise<TechnicianProfile> {
  const baseUrl = BASE_URL;
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/technician/auth/profile`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    console.log("[Profile] Update profile response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error(data?.message || "Failed to update profile");
    }

    if (data.status !== "success") {
      throw new Error(data?.message || "API returned error status");
    }

    return data.data.technician;
  } catch (error: any) {
    console.log("[Profile] Update profile error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(error?.message || "Network request failed");
  }
}

// Change password
export async function changePassword(passwordData: ChangePasswordData): Promise<string> {
  const baseUrl = BASE_URL;
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/technician/auth/change-password`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();
    console.log("[Profile] Change password response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error(data?.message || "Failed to change password");
    }

    if (data.status !== "success") {
      throw new Error(data?.message || "API returned error status");
    }

    return data.message || "Password changed successfully";
  } catch (error: any) {
    console.log("[Profile] Change password error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(error?.message || "Network request failed");
  }
}