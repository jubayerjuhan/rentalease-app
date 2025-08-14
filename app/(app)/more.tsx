import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { technicianLogout } from "../../services/auth";

export default function MorePage() {
  const router = useRouter();

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
      title: "Profile Settings",
      icon: "account-edit",
      onPress: () => Alert.alert("Profile Settings", "Profile settings coming soon..."),
    },
    {
      title: "Notifications",
      icon: "bell-outline",
      onPress: () => Alert.alert("Notifications", "Notification settings coming soon..."),
    },
    {
      title: "Job History",
      icon: "history",
      onPress: () => Alert.alert("Job History", "Job history coming soon..."),
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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#024974" />
        </View>
        <Text style={styles.profileName}>John Technician</Text>
        <Text style={styles.profileEmail}>john.tech@rentalease.com</Text>
        <Text style={styles.profileRole}>Senior Technician</Text>
        
        <TouchableOpacity style={styles.editProfileButton}>
          <MaterialCommunityIcons name="pencil" size={16} color="#024974" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu List */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name={item.icon} size={24} color="#6B7280" />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileSection: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#6CC48C',
    fontWeight: '600',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#024974',
  },
  editProfileText: {
    color: '#024974',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingVertical: 8,
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
    color: '#1F2937',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 16,
    fontWeight: '600',
  },
});