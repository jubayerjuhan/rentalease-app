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

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: 'How do I accept a job?',
    answer: 'Navigate to the "Available Jobs" tab, browse the available jobs, and tap on a job to view details. Then tap the "Accept Job" button to add it to your job list.',
  },
  {
    id: 2,
    question: 'How do I update my job status?',
    answer: 'Go to "My Jobs" tab, select the job you want to update, and tap on the status dropdown to change it from "In Progress" to "Completed" or other available statuses.',
  },
  {
    id: 3,
    question: 'How do I upload job completion photos?',
    answer: 'When marking a job as completed, you\'ll be prompted to upload photos as proof of completion. Tap the camera icon and either take a new photo or select from your gallery.',
  },
  {
    id: 4,
    question: 'When will I receive payment?',
    answer: 'Payments are processed weekly after job completion verification. You can track your payment status in the "Payments" tab.',
  },
  {
    id: 5,
    question: 'How do I change my availability status?',
    answer: 'Go to "More" > "Edit Profile" and update your availability status. This helps the system match you with appropriate jobs.',
  },
  {
    id: 6,
    question: 'What should I do if I encounter an issue during a job?',
    answer: 'Contact support immediately through the "Help & Support" section. Document the issue with photos and provide a detailed description.',
  },
  {
    id: 7,
    question: 'How do I view my job history?',
    answer: 'Navigate to "More" > "Job History" to view all your completed jobs, earnings, and performance metrics.',
  },
  {
    id: 8,
    question: 'Can I cancel a job after accepting it?',
    answer: 'Jobs should only be cancelled in emergency situations. Contact support to cancel a job, as this may affect your rating.',
  },
  {
    id: 9,
    question: 'How do I update my profile information?',
    answer: 'Go to "More" > "Edit Profile" to update your personal information, skills, experience, and contact details.',
  },
  {
    id: 10,
    question: 'What if I forget my password?',
    answer: 'On the login screen, tap "Forgot Password?" and follow the instructions to reset your password via email.',
  },
];

export default function FAQScreen() {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const styles = createStyles(theme);

  const toggleExpanded = (id: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id);
    } else {
      newExpandedItems.add(id);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'FAQ',
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
        <View style={styles.header}>
          <MaterialCommunityIcons name="frequently-asked-questions" size={48} color={theme.primary} />
          <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
          <Text style={styles.headerSubtitle}>
            Find answers to common questions about using RentalEase Technician
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqData.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Can't find what you're looking for?
          </Text>
          <Text style={styles.footerSubtext}>
            Contact our support team for personalized assistance.
          </Text>
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  faqList: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginRight: 12,
    lineHeight: 22,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  answerText: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginTop: 16,
  },
  footer: {
    backgroundColor: theme.surface,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});