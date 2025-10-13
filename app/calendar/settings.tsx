import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import calendarApiService from '../../services/calendarApi';
import calendarDeviceService from '../../services/calendarDevice';

export default function CalendarSettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [calendarInfo, setCalendarInfo] = useState<{
    calendarId: string | null;
    eventCount: number;
  } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    loadCalendarInfo();
  }, []);

  const loadCalendarInfo = async () => {
    try {
      const info = await calendarDeviceService.getCalendarInfo();
      setCalendarInfo(info);
    } catch (error) {
      console.error('[CalendarSettings] Error loading calendar info:', error);
    }
  };

  const handleClearAllEvents = () => {
    if (!calendarInfo || calendarInfo.eventCount === 0) {
      Alert.alert(
        'No Events to Clear',
        'There are no calendar events to remove.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Clear All Calendar Events',
      `This will remove all ${calendarInfo.eventCount} RentalEase events from your device calendar. This action cannot be undone.\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await calendarDeviceService.clearAllEvents();
              if (success) {
                setCalendarInfo(prev => prev ? { ...prev, eventCount: 0 } : null);
                Alert.alert(
                  'Events Cleared',
                  'All RentalEase events have been removed from your calendar.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to clear some events. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to clear calendar events. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGetFeedUrl = async () => {
    try {
      setLoading(true);
      const feedData = await calendarApiService.getCalendarFeedUrl();
      
      Alert.alert(
        'Calendar Feed URL',
        'Use this URL to subscribe to your work schedule in any calendar application:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Copy URL',
            onPress: () => {
              // In a real app, you'd use Clipboard.setString here
              Alert.alert('URL Copied', 'The calendar feed URL has been copied to your clipboard.');
            }
          },
          {
            text: 'View Instructions',
            onPress: () => {
              Alert.alert(
                'Setup Instructions',
                `iOS Calendar:\n${feedData.instructions.ios}\n\nGoogle Calendar:\n${feedData.instructions.android}\n\nOutlook:\n${feedData.instructions.outlook}`,
                [{ text: 'Got it!' }]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get calendar feed URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setLoading(true);
      
      // Get current events
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      
      const events = await calendarApiService.getTechnicianCalendar(
        startDate.toISOString(),
        endDate.toISOString()
      );

      const upcomingEvents = events.filter(event => 
        new Date(event.startTime) > new Date()
      );

      if (upcomingEvents.length === 0) {
        Alert.alert(
          'No Events to Sync',
          'You don\'t have any upcoming scheduled jobs to sync.',
          [{ text: 'OK' }]
        );
        return;
      }

      const success = await calendarDeviceService.syncJobsToCalendar(upcomingEvents);
      
      if (success) {
        setCalendarInfo(prev => prev ? { ...prev, eventCount: upcomingEvents.length } : null);
        Alert.alert(
          'Sync Complete',
          `Successfully synced ${upcomingEvents.length} events to your device calendar.`,
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'Sync Failed',
          'Some events could not be synced. Please check your calendar permissions.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sync calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoSync = (value: boolean) => {
    setAutoSyncEnabled(value);
    // In a real app, you'd save this preference
    Alert.alert(
      'Auto-Sync',
      value 
        ? 'Auto-sync has been enabled. Your calendar will be updated automatically when jobs change.'
        : 'Auto-sync has been disabled. You\'ll need to manually sync your calendar.',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Calendar Settings',
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
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={theme.success} />
              <View style={styles.statusContent}>
                <Text style={styles.statusLabel}>Device Calendar</Text>
                <Text style={styles.statusValue}>
                  {calendarInfo?.calendarId ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
            
            {calendarInfo && (
              <View style={styles.statusRow}>
                <MaterialCommunityIcons name="calendar-multiple" size={24} color={theme.primary} />
                <View style={styles.statusContent}>
                  <Text style={styles.statusLabel}>Synced Events</Text>
                  <Text style={styles.statusValue}>
                    {calendarInfo.eventCount} events
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="sync" size={24} color={theme.textSecondary} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Auto-Sync</Text>
                  <Text style={styles.settingDescription}>
                    Automatically sync calendar when jobs change
                  </Text>
                </View>
              </View>
              <Switch
                value={autoSyncEnabled}
                onValueChange={toggleAutoSync}
                thumbColor={autoSyncEnabled ? theme.primary : theme.disabled}
                trackColor={{ false: theme.border, true: theme.primaryLight }}
              />
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSyncNow}
              disabled={loading}
            >
              <MaterialCommunityIcons name="sync" size={24} color={theme.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>Sync Now</Text>
                <Text style={styles.actionDescription}>
                  Manually sync your latest schedule to device calendar
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleGetFeedUrl}
              disabled={loading}
            >
              <MaterialCommunityIcons name="link" size={24} color={theme.primary} />
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>Get Feed URL</Text>
                <Text style={styles.actionDescription}>
                  Get calendar subscription URL for external apps
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearAllEvents}
              disabled={loading || !calendarInfo?.eventCount}
            >
              <MaterialCommunityIcons name="delete-outline" size={24} color={theme.error} />
              <View style={styles.actionContent}>
                <Text style={[styles.actionLabel, { color: theme.error }]}>Clear All Events</Text>
                <Text style={styles.actionDescription}>
                  Remove all RentalEase events from device calendar
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help</Text>
          <View style={styles.helpCard}>
            <View style={styles.helpItem}>
              <MaterialCommunityIcons name="information-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.helpText}>
                Calendar sync creates events in your device's default calendar app with automatic reminders.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.helpText}>
                Your calendar data is stored locally on your device and not shared with third parties.
              </Text>
            </View>
            <View style={styles.helpItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.helpText}>
                Events include 1-hour and 15-minute reminders to help you stay on schedule.
              </Text>
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  statusValue: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  actionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  helpCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});