import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import {
  getProfile,
  updateProfile,
  TechnicianProfile,
  ProfileUpdateData,
} from "../../services/profile";
import { useTheme, Theme } from "../../contexts/ThemeContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    experience: 0,
    address: {
      street: "",
      suburb: "",
      state: "",
      postcode: "",
      fullAddress: "",
    },
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);

      // Pre-fill form with existing data
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        experience: profileData.experience || 0,
        address: {
          street: profileData.address?.street || "",
          suburb: profileData.address?.suburb || "",
          state: profileData.address?.state || "",
          postcode: profileData.address?.postcode || "",
          fullAddress: profileData.address?.fullAddress || "",
        },
      });
    } catch (error: any) {
      console.log("[EditProfile] Error loading profile:", error);
      Alert.alert("Error", error.message || "Failed to load profile");

      if (error.message?.includes("Authentication expired")) {
        router.replace("/(auth)/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateFormData = (field: string, value: string | number) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const generateFullAddress = () => {
    const { street, suburb, state, postcode } = formData.address;
    const fullAddress = [street, suburb, state, postcode]
      .filter(Boolean)
      .join(", ");
    updateFormData("address.fullAddress", fullAddress);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Validation Error", "First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Validation Error", "Last name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Generate full address before saving
      generateFullAddress();

      const updateData: ProfileUpdateData = {
        ...formData,
        address: {
          ...formData.address,
          fullAddress: [
            formData.address.street,
            formData.address.suburb,
            formData.address.state,
            formData.address.postcode,
          ]
            .filter(Boolean)
            .join(", "),
        },
      };

      await updateProfile(updateData);

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.log("[EditProfile] Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");

      if (error.message?.includes("Authentication expired")) {
        router.replace("/(auth)/login");
      }
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerBackTitle: "More",
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.text,
          },
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData("firstName", value)}
                placeholder="Enter first name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData("lastName", value)}
                placeholder="Enter last name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => updateFormData("phone", value)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                value={formData.experience.toString()}
                onChangeText={(value) =>
                  updateFormData("experience", parseInt(value) || 0)
                }
                placeholder="Enter years of experience"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Address Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address.street}
                onChangeText={(value) =>
                  updateFormData("address.street", value)
                }
                placeholder="Enter street address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Suburb</Text>
              <TextInput
                style={styles.input}
                value={formData.address.suburb}
                onChangeText={(value) =>
                  updateFormData("address.suburb", value)
                }
                placeholder="Enter suburb"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address.state}
                  onChangeText={(value) =>
                    updateFormData("address.state", value)
                  }
                  placeholder="State"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.label}>Postcode</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address.postcode}
                  onChangeText={(value) =>
                    updateFormData("address.postcode", value)
                  }
                  placeholder="Postcode"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons
                  name="content-save"
                  size={20}
                  color="white"
                />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputRow: {
      flexDirection: "row",
      gap: 12,
    },
    inputHalf: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    saveButtonDisabled: {
      backgroundColor: theme.disabled,
      opacity: 0.7,
    },
    saveButtonText: {
      color: theme.surface,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
  });
