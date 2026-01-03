import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { requestCalendarPermissions, getDefaultCalendar, showCalendarSetupInstructions } from './calendarPermissions';
import { CalendarEvent } from './calendarApi';

const CALENDAR_ID_KEY = 'rentalease_calendar_id';
const EVENT_IDS_KEY = 'rentalease_event_ids';
const CALENDAR_NAME = 'RentalEase Work Schedule';

interface StoredEventMapping {
  [jobId: string]: string; // jobId -> eventId
}

class CalendarDeviceService {
  private calendarId: string | null = null;
  private eventMapping: StoredEventMapping = {};

  async initialize(): Promise<boolean> {
    try {
      const hasPermission = await requestCalendarPermissions();
      if (!hasPermission) {
        console.log('[CalendarDeviceService] Calendar permissions not granted');
        return false;
      }

      this.calendarId = await this.getOrCreateRentalEaseCalendar();
      if (!this.calendarId) {
        console.log('[CalendarDeviceService] Failed to create or get calendar');
        return false;
      }

      await this.loadEventMapping();
      console.log('[CalendarDeviceService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[CalendarDeviceService] Initialization error:', error);
      return false;
    }
  }

  private async getOrCreateRentalEaseCalendar(): Promise<string | null> {
    try {
      // Check if we already have a stored calendar ID
      const storedCalendarId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
      if (storedCalendarId) {
        // Verify the calendar still exists
        try {
          const calendars = await Calendar.getCalendarsAsync();
          const exists = calendars.find(cal => cal.id === storedCalendarId);
          if (exists) {
            console.log('[CalendarDeviceService] Using existing calendar:', storedCalendarId);
            return storedCalendarId;
          }
        } catch (error) {
          console.log('[CalendarDeviceService] Stored calendar no longer exists, creating new one');
        }
      }

      // Create new calendar
      const defaultCalendar = await getDefaultCalendar();
      if (!defaultCalendar) {
        throw new Error('No default calendar available');
      }

      const newCalendar: Calendar.CalendarCreateDetails = {
        title: CALENDAR_NAME,
        color: '#2196F3',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendar.source.id,
        source: defaultCalendar.source,
        name: CALENDAR_NAME,
        ownerAccount: defaultCalendar.ownerAccount,
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      };

      const calendarId = await Calendar.createCalendarAsync(newCalendar);
      await AsyncStorage.setItem(CALENDAR_ID_KEY, calendarId);
      
      console.log('[CalendarDeviceService] Created new calendar:', calendarId);
      return calendarId;
    } catch (error) {
      console.error('[CalendarDeviceService] Error creating calendar:', error);
      return null;
    }
  }

  private async loadEventMapping(): Promise<void> {
    try {
      const storedMapping = await AsyncStorage.getItem(EVENT_IDS_KEY);
      if (storedMapping) {
        this.eventMapping = JSON.parse(storedMapping);
        console.log('[CalendarDeviceService] Loaded event mapping:', Object.keys(this.eventMapping).length, 'events');
      }
    } catch (error) {
      console.error('[CalendarDeviceService] Error loading event mapping:', error);
      this.eventMapping = {};
    }
  }

  private async saveEventMapping(): Promise<void> {
    try {
      await AsyncStorage.setItem(EVENT_IDS_KEY, JSON.stringify(this.eventMapping));
      console.log('[CalendarDeviceService] Saved event mapping');
    } catch (error) {
      console.error('[CalendarDeviceService] Error saving event mapping:', error);
    }
  }

  async syncJobsToCalendar(jobs: CalendarEvent[]): Promise<boolean> {
    try {
      if (!this.calendarId) {
        const initialized = await this.initialize();
        if (!initialized) {
          console.log('[CalendarDeviceService] Failed to initialize for sync');
          return false;
        }
      }

      console.log('[CalendarDeviceService] Syncing', jobs.length, 'jobs to calendar');

      // Clear existing events first
      await this.clearExistingEvents();

      // Add new events
      let successCount = 0;
      for (const job of jobs) {
        const eventId = await this.createCalendarEvent(job);
        if (eventId) {
          this.eventMapping[job.id] = eventId;
          successCount++;
        }
      }

      // Save the new mapping
      await this.saveEventMapping();

      console.log('[CalendarDeviceService] Successfully synced', successCount, 'of', jobs.length, 'events');
      
      if (successCount > 0) {
        showCalendarSetupInstructions();
      }

      return successCount === jobs.length;
    } catch (error) {
      console.error('[CalendarDeviceService] Error syncing jobs to calendar:', error);
      return false;
    }
  }

  private async createCalendarEvent(job: CalendarEvent): Promise<string | null> {
    if (!this.calendarId) return null;

    try {
      const location = job.location 
        ? `${job.location.street}, ${job.location.city}, ${job.location.state} ${job.location.zipCode}`
        : '';

      const eventDetails: Calendar.EventRecurrence = {
        title: job.title,
        startDate: new Date(job.startTime),
        endDate: new Date(job.endTime),
        notes: `${job.description}\n\nJob ID: ${job.jobId}\nJob Type: ${job.jobType}\nPriority: ${job.priority}\nStatus: ${job.status}\nShift: ${job.shift}`,
        location: location,
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -15 }   // 15 minutes before
        ],
        calendarId: this.calendarId,
      };

      const eventId = await Calendar.createEventAsync(this.calendarId, eventDetails);
      console.log('[CalendarDeviceService] Created event:', eventId, 'for job:', job.jobId);
      
      return eventId;
    } catch (error) {
      console.error('[CalendarDeviceService] Error creating calendar event for job', job.jobId, ':', error);
      return null;
    }
  }

  private async clearExistingEvents(): Promise<void> {
    try {
      const eventIds = Object.values(this.eventMapping);
      
      console.log('[CalendarDeviceService] Clearing', eventIds.length, 'existing events');
      
      for (const eventId of eventIds) {
        try {
          await Calendar.deleteEventAsync(eventId);
        } catch (error) {
          // Event might already be deleted, continue
          console.log('[CalendarDeviceService] Event', eventId, 'already deleted or not found');
        }
      }

      // Clear the mapping
      this.eventMapping = {};
      await AsyncStorage.removeItem(EVENT_IDS_KEY);
      
      console.log('[CalendarDeviceService] Cleared all existing events');
    } catch (error) {
      console.error('[CalendarDeviceService] Error clearing events:', error);
    }
  }

  async updateSingleEvent(job: CalendarEvent): Promise<boolean> {
    try {
      if (!this.calendarId) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Delete existing event if it exists
      const existingEventId = this.eventMapping[job.id];
      if (existingEventId) {
        try {
          await Calendar.deleteEventAsync(existingEventId);
          delete this.eventMapping[job.id];
        } catch (error) {
          console.log('[CalendarDeviceService] Existing event already deleted');
        }
      }

      // Create new event
      const eventId = await this.createCalendarEvent(job);
      if (eventId) {
        this.eventMapping[job.id] = eventId;
        await this.saveEventMapping();
        return true;
      }

      return false;
    } catch (error) {
      console.error('[CalendarDeviceService] Error updating single event:', error);
      return false;
    }
  }

  async removeSingleEvent(jobId: string): Promise<boolean> {
    try {
      const eventId = this.eventMapping[jobId];
      if (!eventId) {
        console.log('[CalendarDeviceService] No event found for job:', jobId);
        return true; // Consider it successful if event doesn't exist
      }

      await Calendar.deleteEventAsync(eventId);
      delete this.eventMapping[jobId];
      await this.saveEventMapping();
      
      console.log('[CalendarDeviceService] Removed event for job:', jobId);
      return true;
    } catch (error) {
      console.error('[CalendarDeviceService] Error removing single event:', error);
      return false;
    }
  }

  async clearAllEvents(): Promise<boolean> {
    try {
      await this.clearExistingEvents();
      return true;
    } catch (error) {
      console.error('[CalendarDeviceService] Error clearing all events:', error);
      return false;
    }
  }

  async getCalendarInfo(): Promise<{ calendarId: string | null; eventCount: number } | null> {
    try {
      if (!this.calendarId) {
        await this.initialize();
      }

      return {
        calendarId: this.calendarId,
        eventCount: Object.keys(this.eventMapping).length
      };
    } catch (error) {
      console.error('[CalendarDeviceService] Error getting calendar info:', error);
      return null;
    }
  }

  async showSyncConfirmation(eventCount: number): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Sync to Device Calendar',
        `This will add ${eventCount} work events to your device's calendar app with reminders. Your existing RentalEase events will be replaced.\n\nContinue?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Sync Events',
            onPress: () => resolve(true)
          },
        ]
      );
    });
  }
}

export default new CalendarDeviceService();
