import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Calendar Permission Required',
        'RentalEase needs calendar access to sync your work schedule with your device calendar. This helps you stay organized and never miss a job.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permission', 
            onPress: async () => {
              const { status: newStatus } = await Calendar.requestCalendarPermissionsAsync();
              return newStatus === 'granted';
            }
          }
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    Alert.alert(
      'Permission Error',
      'Unable to request calendar permissions. Please check your device settings.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

export const getDefaultCalendar = async (): Promise<Calendar.Calendar | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Try to find the default calendar
    const defaultCalendar = calendars.find(cal => 
      cal.source.name === 'Default' || 
      cal.isPrimary || 
      cal.allowsModifications
    );
    
    if (defaultCalendar) {
      return defaultCalendar;
    }
    
    // Fall back to first writable calendar
    const writableCalendar = calendars.find(cal => cal.allowsModifications);
    return writableCalendar || calendars[0] || null;
  } catch (error) {
    console.error('Error getting default calendar:', error);
    return null;
  }
};

export const checkCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking calendar permissions:', error);
    return false;
  }
};

export const getCalendarSourceInfo = async () => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars.map(cal => ({
      id: cal.id,
      title: cal.title,
      source: cal.source.name,
      type: cal.source.type,
      allowsModifications: cal.allowsModifications,
      isPrimary: cal.isPrimary,
      color: cal.color,
    }));
  } catch (error) {
    console.error('Error getting calendar info:', error);
    return [];
  }
};

export const showCalendarSetupInstructions = () => {
  const instructions = Platform.select({
    ios: "Your events have been added to your iPhone's Calendar app. You can find them by opening the Calendar app on your device.",
    android: "Your events have been added to your device calendar. You can view them in your default calendar app (Google Calendar, Samsung Calendar, etc.).",
    default: "Your events have been added to your device calendar."
  });

  Alert.alert(
    'Calendar Sync Complete',
    instructions,
    [{ text: 'Got it!' }]
  );
};