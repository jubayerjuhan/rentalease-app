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
  firstName?: string;
  lastName?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  experience?: number;
  hourlyRate?: number;
  address?: {
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    fullAddress?: string;
  };
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

// Get technician profile
export async function getProfile(): Promise<TechnicianProfile> {
  const baseUrl = getBaseUrl();
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
  const baseUrl = getBaseUrl();
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
  const baseUrl = getBaseUrl();
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

// Update technician profile image (multipart/form-data)
export async function updateProfileImage(image: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<TechnicianProfile> {
  const baseUrl = getBaseUrl();
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const candidates = ["profileImage", "image", "file"];

    const attemptUpload = async (fieldName: string) => {
      const form = new FormData();
      form.append(fieldName, {
        uri: image.uri,
        name: image.name || "profile.jpg",
        type: image.type || "image/jpeg",
      } as any);

      const response = await fetch(
        `${baseUrl}/api/v1/technician/auth/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return { response, data };
    };

    let lastError: string | undefined;
    for (const fieldName of candidates) {
      const { response, data } = await attemptUpload(fieldName);

      console.log(
        "[Profile] Update profile image response:",
        JSON.stringify({ fieldName, status: response.status, body: data }, null, 2)
      );

      if (response.ok && data?.status === "success") {
        return data.data.technician;
      }

      if (response.status === 401) {
        throw new Error("Authentication expired. Please login again.");
      }

      const message =
        data?.message ||
        (typeof data === "string" ? data : undefined) ||
        "Failed to update profile image";
      lastError = message;

      // Multer-style error; retry with alternate field name.
      if (String(message).toLowerCase().includes("unexpected field")) {
        continue;
      }

      throw new Error(message);
    }

    throw new Error(lastError || "Failed to update profile image");
  } catch (error: any) {
    console.log("[Profile] Update profile image error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    throw new Error(error?.message || "Network request failed");
  }
}
