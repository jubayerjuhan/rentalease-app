import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface GuideSection {
  id: number;
  title: string;
  icon: string;
  color: string;
  steps: GuideStep[];
}

interface GuideStep {
  id: number;
  title: string;
  description: string;
  tip?: string;
}

export default function UserGuideScreen() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<number>(1);
  const styles = createStyles(theme);

  const guideSections: GuideSection[] = [
    {
      id: 1,
      title: 'Getting Started',
      icon: 'rocket-launch',
      color: theme.primary,
      steps: [
        {
          id: 1,
          title: 'Create Your Profile',
          description: 'Complete your technician profile with skills, experience, and availability. This helps match you with suitable jobs.',
          tip: 'Add a professional photo and detailed skills for better job matches.',
        },
        {
          id: 2,
          title: 'Set Your Availability',
          description: 'Update your availability status to receive job notifications when you\'re ready to work.',
          tip: 'Keep your availability updated to maximize earning opportunities.',
        },
        {
          id: 3,
          title: 'Browse Available Jobs',
          description: 'Navigate to the "Available Jobs" tab to see jobs that match your skills and location.',
        },
      ],
    },
    {
      id: 2,
      title: 'Managing Jobs',
      icon: 'briefcase-check',
      color: theme.success,
      steps: [
        {
          id: 1,
          title: 'Accept a Job',
          description: 'Review job details including location, requirements, and payment. Tap "Accept Job" to add it to your schedule.',
          tip: 'Read job descriptions carefully and ensure you have the required tools.',
        },
        {
          id: 2,
          title: 'Navigate to Job Site',
          description: 'Use the built-in maps integration to get directions to your job location.',
        },
        {
          id: 3,
          title: 'Update Job Status',
          description: 'Keep clients informed by updating your job status: "On the way", "In Progress", or "Completed".',
          tip: 'Regular status updates improve client satisfaction and your rating.',
        },
        {
          id: 4,
          title: 'Complete the Job',
          description: 'When finished, mark the job as completed and upload proof-of-work photos.',
        },
      ],
    },
    {
      id: 3,
      title: 'Job Completion',
      icon: 'check-circle',
      color: theme.warning,
      steps: [
        {
          id: 1,
          title: 'Upload Photos',
          description: 'Take clear before and after photos of your work. This serves as proof of completion.',
          tip: 'Good lighting and multiple angles make the best documentation.',
        },
        {
          id: 2,
          title: 'Create Invoice',
          description: 'Generate an itemized invoice for parts and labor. Be detailed and accurate.',
          tip: 'Keep receipts for all parts purchased during the job.',
        },
        {
          id: 3,
          title: 'Submit for Review',
          description: 'Submit your completed work for client review and approval.',
        },
        {
          id: 4,
          title: 'Receive Payment',
          description: 'Once approved, payment will be processed according to your payment schedule.',
        },
      ],
    },
    {
      id: 4,
      title: 'Payments & Earnings',
      icon: 'wallet',
      color: theme.error,
      steps: [
        {
          id: 1,
          title: 'Track Earnings',
          description: 'Monitor your earnings in the "Payments" tab. View pending, processing, and completed payments.',
        },
        {
          id: 2,
          title: 'Payment Schedule',
          description: 'Payments are processed weekly after job completion and client approval.',
          tip: 'Set up direct deposit for faster payment processing.',
        },
        {
          id: 3,
          title: 'Payment History',
          description: 'Access detailed payment history and download invoices for tax purposes.',
        },
      ],
    },
    {
      id: 5,
      title: 'Tips for Success',
      icon: 'star',
      color: theme.primary,
      steps: [
        {
          id: 1,
          title: 'Maintain High Ratings',
          description: 'Provide quality work, communicate clearly, and arrive on time to maintain high customer ratings.',
          tip: 'High ratings lead to more job opportunities and better pay.',
        },
        {
          id: 2,
          title: 'Professional Communication',
          description: 'Always communicate professionally with clients. Use the in-app messaging system for all communications.',
        },
        {
          id: 3,
          title: 'Stay Updated',
          description: 'Keep your skills and certifications current. Update your profile when you gain new qualifications.',
        },
        {
          id: 4,
          title: 'Safety First',
          description: 'Always follow safety protocols and wear appropriate protective equipment.',
          tip: 'Report any safety concerns immediately through the support system.',
        },
      ],
    },
  ];

  const activeGuide = guideSections.find(section => section.id === activeSection);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'User Guide',
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
      <View style={styles.container}>
        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {guideSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.tab,
                activeSection === section.id && [
                  styles.activeTab,
                  { borderBottomColor: section.color }
                ],
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <MaterialCommunityIcons
                name={section.icon}
                size={20}
                color={activeSection === section.id ? section.color : theme.textSecondary}
              />
              <Text style={[
                styles.tabText,
                activeSection === section.id && { color: section.color }
              ]}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {activeGuide && (
            <View style={styles.guideContainer}>
              <View style={styles.guideHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${activeGuide.color}15` }]}>
                  <MaterialCommunityIcons
                    name={activeGuide.icon}
                    size={32}
                    color={activeGuide.color}
                  />
                </View>
                <Text style={styles.guideTitle}>{activeGuide.title}</Text>
              </View>

              <View style={styles.stepsContainer}>
                {activeGuide.steps.map((step, index) => (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      {step.tip && (
                        <View style={styles.tipContainer}>
                          <MaterialCommunityIcons
                            name="lightbulb"
                            size={16}
                            color={theme.warning}
                          />
                          <Text style={styles.tipText}>{step.tip}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabsContainer: {
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  guideContainer: {
    padding: 20,
  },
  guideHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  stepsContainer: {
    gap: 24,
  },
  stepItem: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.warning}10`,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.warning,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
