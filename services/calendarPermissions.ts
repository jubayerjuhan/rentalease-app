import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

/**
 * Requests calendar permissions. Returns true if granted.
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      // iOS sometimes requires reminder permission for alarms to work reliably
      if (Platform.OS === 'ios') {
        await Calendar.requestRemindersPermissionsAsync().catch(() => undefined);
      }
      return true;
    }
  } catch (error) {
    console.error('[CalendarPermissions] Failed to request permissions', error);
  }
  return false;
}

/**
 * Returns the default calendar or the first available event calendar.
 */
export async function getDefaultCalendar(): Promise<Calendar.Calendar | null> {
  try {
    if (Calendar.getDefaultCalendarAsync) {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      if (defaultCalendar) {
        return defaultCalendar;
      }
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars.find((cal) => cal.allowsModifications) || calendars[0] || null;
  } catch (error) {
    console.error('[CalendarPermissions] Failed to fetch default calendar', error);
    return null;
  }
}

/**
 * Shows a short guide on how to view the synced events in the device calendar app.
 */
export function showCalendarSetupInstructions(): void {
  const message =
    Platform.OS === 'ios'
      ? 'Events were added to your iPhone calendar. Open the Calendar app and ensure the "RentalEase Work Schedule" calendar is checked under Calendars.'
      : 'Events were added to your device calendar. Open Google Calendar (or your default calendar app) and ensure the "RentalEase Work Schedule" calendar is visible.';

  Alert.alert('Calendar Synced', message);
}
