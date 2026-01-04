import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { changePassword } from "../../services/profile";
import { PasswordInputField, PrimaryButton } from "../../components/UI";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing details", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please confirm your new password.");
      return;
    }

    try {
      setLoading(true);
      const message = await changePassword({ currentPassword, newPassword });
      Alert.alert("Success", message || "Password changed successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const message = e?.message || "Failed to change password";
      if (message.includes("Authentication expired")) {
        Alert.alert("Session Expired", "Please login again to continue.", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") },
        ]);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Change Password",
          headerShown: true,
          headerStyle: { backgroundColor: theme.surface },
          headerTitleStyle: { color: theme.text, fontWeight: "700" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color={theme.primary}
              />
              <Text style={{ color: theme.primary, fontWeight: "700", marginLeft: 2 }}>
                Back
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.heroCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.heroIconWrap}>
              <View
                style={[
                  styles.heroIcon,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-check"
                  size={26}
                  color={theme.primary}
                />
              </View>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Update Password
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Use a strong password you don’t use anywhere else.
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Password Details
            </Text>
            <PasswordInputField
              placeholder="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={{ marginBottom: 16 }}
            />
            <PasswordInputField
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={{ marginBottom: 16 }}
            />
            <PasswordInputField
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ marginBottom: 8 }}
            />

            <PrimaryButton
              title={loading ? "Updating..." : "Update Password"}
              onPress={onSubmit}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 6 }}
            />
            <Text style={[styles.hint, { color: theme.textTertiary }]}>
              Tip: Longer passwords are stronger.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  heroCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  heroIconWrap: { alignItems: "flex-start", marginBottom: 12 },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 18 },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 10 },
  hint: { marginTop: 10, fontSize: 12, fontWeight: "600" },
});
