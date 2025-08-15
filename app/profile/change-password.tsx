import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { changePassword } from "../../services/profile";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim()) {
      Alert.alert("Validation Error", "Current password is required");
      return false;
    }
    
    if (!formData.newPassword.trim()) {
      Alert.alert("Validation Error", "New password is required");
      return false;
    }
    
    if (formData.newPassword.length < 6) {
      Alert.alert("Validation Error", "New password must be at least 6 characters long");
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Validation Error", "New password and confirmation password do not match");
      return false;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert("Validation Error", "New password must be different from current password");
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      Alert.alert(
        "Success",
        "Password changed successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.log("[ChangePassword] Error:", error);
      Alert.alert("Error", error.message || "Failed to change password");
      
      if (error.message?.includes("Authentication expired")) {
        router.replace("/(auth)/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    field: string,
    showPassword: boolean,
    toggleShow: () => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={(text) => updateFormData(field, text)}
          placeholder={placeholder}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={toggleShow}>
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: true,
        title: "Change Password",
        headerStyle: { backgroundColor: "#024974" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }} />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="lock-outline" size={48} color="#024974" />
              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.subtitle}>
                Enter your current password and choose a new secure password
              </Text>
            </View>

            {renderPasswordInput(
              "Current Password *",
              formData.currentPassword,
              "currentPassword",
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword),
              "Enter your current password"
            )}

            {renderPasswordInput(
              "New Password *",
              formData.newPassword,
              "newPassword",
              showNewPassword,
              () => setShowNewPassword(!showNewPassword),
              "Enter your new password"
            )}

            {renderPasswordInput(
              "Confirm New Password *",
              formData.confirmPassword,
              "confirmPassword",
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword),
              "Confirm your new password"
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirement}>
                <MaterialCommunityIcons 
                  name={formData.newPassword.length >= 6 ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={formData.newPassword.length >= 6 ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.requirementText,
                  formData.newPassword.length >= 6 && styles.requirementMet
                ]}>
                  At least 6 characters long
                </Text>
              </View>
              <View style={styles.requirement}>
                <MaterialCommunityIcons 
                  name={formData.newPassword !== formData.currentPassword && formData.newPassword.length > 0 ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={formData.newPassword !== formData.currentPassword && formData.newPassword.length > 0 ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.requirementText,
                  formData.newPassword !== formData.currentPassword && formData.newPassword.length > 0 && styles.requirementMet
                ]}>
                  Different from current password
                </Text>
              </View>
              <View style={styles.requirement}>
                <MaterialCommunityIcons 
                  name={formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 ? "check-circle" : "circle-outline"} 
                  size={16} 
                  color={formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 ? "#10B981" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.requirementText,
                  formData.newPassword === formData.confirmPassword && formData.newPassword.length > 0 && styles.requirementMet
                ]}>
                  Passwords match
                </Text>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={[styles.changeButton, loading && styles.changeButtonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="lock-reset" size={20} color="white" />
              )}
              <Text style={styles.changeButtonText}>
                {loading ? "Changing Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeButton: {
    padding: 12,
  },
  requirementsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  requirementMet: {
    color: "#10B981",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#024974",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  changeButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  changeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});