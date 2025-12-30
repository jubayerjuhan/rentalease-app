import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface HelpOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const helpOptions: HelpOption[] = [
    {
      title: 'FAQ',
      description: 'Frequently asked questions and quick answers',
      icon: 'frequently-asked-questions',
      route: '/help/faq',
      color: theme.primary,
    },
    {
      title: 'User Guide',
      description: 'Step-by-step guides for using the app',
      icon: 'book-open-page-variant',
      route: '/help/user-guide',
      color: theme.success,
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'headset',
      route: '/help/contact-support',
      color: theme.warning,
    },
  ];

  const quickHelp = [
    {
      title: 'How to accept jobs',
      icon: 'briefcase-plus',
      description: 'Learn how to browse and accept available jobs',
    },
    {
      title: 'Upload job photos',
      icon: 'camera',
      description: 'How to document and upload completion photos',
    },
    {
      title: 'Track payments',
      icon: 'wallet',
      description: 'Monitor your earnings and payment status',
    },
    {
      title: 'Update profile',
      icon: 'account-edit',
      description: 'Keep your technician profile current',
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help & Support',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="help-circle" size={48} color={theme.primary} />
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerSubtitle}>
            Find answers, guides, and get support for RentalEase Technician
          </Text>
        </View>

        {/* Main Help Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.helpOptionsContainer}>
            {helpOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.helpOption}
                onPress={() => router.push(option.route)}
              >
                <View style={[styles.helpOptionIcon, { backgroundColor: `${option.color}15` }]}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={32}
                    color={option.color}
                  />
                </View>
                <View style={styles.helpOptionContent}>
                  <Text style={styles.helpOptionTitle}>{option.title}</Text>
                  <Text style={styles.helpOptionDescription}>{option.description}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help Topics</Text>
          <View style={styles.quickHelpContainer}>
            {quickHelp.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickHelpItem}
                onPress={() => router.push('/help/user-guide')}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.quickHelpContent}>
                  <Text style={styles.quickHelpTitle}>{item.title}</Text>
                  <Text style={styles.quickHelpDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <MaterialCommunityIcons name="alert-circle" size={24} color={theme.error} />
              <Text style={styles.emergencyTitle}>Emergency Support</Text>
            </View>
            <Text style={styles.emergencyDescription}>
              For urgent technical issues or safety concerns during a job
            </Text>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => router.push('/help/contact-support')}
            >
              <MaterialCommunityIcons name="phone" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Contact Emergency Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoTitle}>RentalEase Technician</Text>
            <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
            <Text style={styles.appInfoDescription}>
              Your mobile companion for rental service management
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: theme.surface,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  helpOptionsContainer: {
    gap: 12,
  },
  helpOption: {
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  helpOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpOptionContent: {
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  helpOptionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  quickHelpContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  quickHelpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  quickHelpContent: {
    flex: 1,
    marginLeft: 12,
  },
  quickHelpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  quickHelpDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  emergencyCard: {
    backgroundColor: `${theme.error}10`,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.error}30`,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.error,
    marginLeft: 8,
  },
  emergencyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    backgroundColor: theme.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  appInfoDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
