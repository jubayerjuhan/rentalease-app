import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { technicianLogout } from "../../services/auth";
import { getProfile, TechnicianProfile } from "../../services/profile";
import { useTheme, Theme } from "../../contexts/ThemeContext";

export default function MorePage() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error: any) {
      console.log("[More] Error loading profile:", error);
      setError(error.message || "Failed to load profile");
      
      // Handle authentication errors
      if (error.message?.includes("Authentication expired")) {
        Alert.alert(
          "Session Expired", 
          "Please login again to continue.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await technicianLogout();
              router.replace("/(auth)/login");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
              console.error("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: "Edit Profile",
      icon: "account-edit",
      onPress: () => router.push("/profile/edit"),
    },
    {
      title: "Change Password",
      icon: "lock-outline",
      onPress: () => router.push("/profile/change-password"),
    },
    {
      title: "My Payments",
      icon: "wallet-outline",
      onPress: () => router.push("/(app)/payments"),
    },
    {
      title: "Notifications",
      icon: "bell-outline",
      onPress: () => Alert.alert("Notifications", "Notification settings coming soon..."),
    },
    {
      title: "Job History",
      icon: "history",
      onPress: () => router.push("/completed-jobs"),
    },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => Alert.alert("Help", "Help & Support coming soon..."),
    },
    {
      title: "Terms & Privacy",
      icon: "shield-check-outline",
      onPress: () => Alert.alert("Terms", "Terms & Privacy coming soon..."),
    },
    {
      title: "About",
      icon: "information-outline",
      onPress: () => Alert.alert("About", "About RentalEase Technician v1.0.0"),
    },
  ];

  const handleThemeToggle = () => {
    // Immediate haptic feedback
    try {
      const Haptics = require('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }

    // Immediate theme toggle
    toggleTheme();
  };

  const settingsItems = [
    {
      title: "Dark Mode",
      icon: isDark ? "weather-night" : "weather-sunny",
      isToggle: true,
      value: isDark,
      onToggle: handleThemeToggle,
    },
  ];

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {profile?.profileImage?.cloudinaryUrl ? (
            <View style={styles.profileImageContainer}>
              {/* TODO: Add Image component when image upload is implemented */}
              <MaterialCommunityIcons name="account-circle" size={80} color={theme.primary} />
            </View>
          ) : (
            <MaterialCommunityIcons name="account-circle" size={80} color={theme.primary} />
          )}
        </View>
        
        <Text style={styles.profileName}>
          {profile?.fullName || "Technician Name"}
        </Text>
        <Text style={styles.profileEmail}>
          {profile?.email || "email@example.com"}
        </Text>
        <Text style={styles.profileRole}>
          {profile?.availabilityStatus || "Technician"} • {profile?.experience || 0} years exp
        </Text>
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push("/profile/edit")}
        >
          <MaterialCommunityIcons name="pencil" size={16} color={theme.primary} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {settingsItems.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name={item.icon} size={24} color={theme.textSecondary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              thumbColor={item.value ? theme.primary : theme.disabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
            />
          </View>
        ))}
      </View>

      {/* Menu List */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name={item.icon} size={24} color={theme.textSecondary} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={theme.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 110, // Ensure content doesn't hide under tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  profileSection: {
    backgroundColor: theme.surface,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: theme.success,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  editProfileText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    backgroundColor: theme.surface,
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  logoutText: {
    fontSize: 16,
    color: theme.error,
    marginLeft: 16,
    fontWeight: '600',
  },
});