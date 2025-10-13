import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface ContactMethod {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

export default function ContactSupportScreen() {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });
  const styles = createStyles(theme);

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@rentalease.com?subject=Technician App Support');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+1-800-RENTAL');
  };

  const handleChatPress = () => {
    Alert.alert('Live Chat', 'Live chat feature will be available soon!');
  };

  const handleSubmitTicket = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Support Ticket Submitted',
        'Your support ticket has been submitted successfully. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => {
          setFormData({ subject: '', message: '', priority: 'medium' });
        }}]
      );
    }, 2000);
  };

  const contactMethods: ContactMethod[] = [
    {
      title: 'Email Support',
      description: 'Get help via email\nsupport@rentalease.com',
      icon: 'email-outline',
      action: handleEmailPress,
      color: theme.primary,
    },
    {
      title: 'Phone Support',
      description: 'Call our support team\n1-800-RENTAL',
      icon: 'phone-outline',
      action: handlePhonePress,
      color: theme.success,
    },
    {
      title: 'Live Chat',
      description: 'Chat with support\nComing soon',
      icon: 'chat-outline',
      action: handleChatPress,
      color: theme.warning,
    },
  ];

  const priorities = [
    { label: 'Low', value: 'low', color: theme.success },
    { label: 'Medium', value: 'medium', color: theme.warning },
    { label: 'High', value: 'high', color: theme.error },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Contact Support',
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
          <MaterialCommunityIcons name="headset" size={48} color={theme.primary} />
          <Text style={styles.headerTitle}>Need Help?</Text>
          <Text style={styles.headerSubtitle}>
            Our support team is here to assist you with any questions or issues
          </Text>
        </View>

        {/* Quick Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.contactMethodsContainer}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactMethod}
                onPress={method.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${method.color}15` }]}>
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={28}
                    color={method.color}
                  />
                </View>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDescription}>{method.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Ticket Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Support Ticket</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                placeholder="Brief description of your issue"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority.value && {
                        backgroundColor: priority.color,
                        borderColor: priority.color,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, priority: priority.value })}
                  >
                    <Text style={[
                      styles.priorityText,
                      formData.priority === priority.value && { color: 'white' },
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="send" size={20} color="white" />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Hours</Text>
          <View style={styles.supportHours}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Monday - Friday</Text>
              <Text style={styles.hoursValue}>9:00 AM - 6:00 PM EST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Saturday</Text>
              <Text style={styles.hoursValue}>10:00 AM - 4:00 PM EST</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursLabel}>Sunday</Text>
              <Text style={styles.hoursValue}>Closed</Text>
            </View>
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
  contactMethodsContainer: {
    gap: 12,
  },
  contactMethod: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
  },
  messageInput: {
    minHeight: 120,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  submitButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: theme.disabled,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  supportHours: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoursLabel: {
    fontSize: 16,
    color: theme.text,
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});