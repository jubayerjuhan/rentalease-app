import { Platform } from "react-native";
import { getToken } from "./secureStore";

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;

function getBaseUrl(): string {
  if (!RAW_BASE_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_BASE_URL. Set it in .env (e.g., http://localhost:4000) and restart the dev server."
    );
  }
  try {
    const url = new URL(RAW_BASE_URL);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      if (Platform.OS === "android") {
        url.hostname = "10.0.2.2";
      } else {
        url.hostname = "127.0.0.1";
      }
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return RAW_BASE_URL;
  }
}

export interface CalendarEvent {
  id: string;
  jobId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  jobType: string;
  priority: string;
  status: string;
  shift: string;
  estimatedDuration: number;
  location: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  property: {
    id: string;
    type: string;
  };
}

export interface CalendarResponse {
  status: string;
  message: string;
  data: {
    technician: {
      id: string;
      name: string;
    };
    events: CalendarEvent[];
    summary: {
      totalEvents: number;
      dateRange: {
        start: string;
        end: string;
      };
      statusCounts: Record<string, number>;
    };
  };
}

export interface CalendarFeedResponse {
  status: string;
  message: string;
  data: {
    feedUrl: string;
    instructions: {
      ios: string;
      android: string;
      outlook: string;
    };
  };
}

class CalendarApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getTechnicianCalendar(
    startDate?: string,
    endDate?: string,
    status?: string
  ): Promise<CalendarEvent[]> {
    try {
      const baseUrl = getBaseUrl();
      const headers = await this.getAuthHeaders();
      
      let url = `${baseUrl}/api/v1/calendar/my-calendar?format=json`;
      
      if (startDate) {
        url += `&startDate=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        url += `&endDate=${encodeURIComponent(endDate)}`;
      }
      if (status) {
        url += `&status=${encodeURIComponent(status)}`;
      }

      console.log('[CalendarApiService] Fetching calendar from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        
        // Provide more user-friendly error messages
        if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to access the calendar.';
        } else if (response.status === 404) {
          errorMessage = 'Calendar service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.status === 0 || !response.status) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        throw new Error(errorMessage);
      }

      const data: CalendarResponse = await response.json();
      console.log('[CalendarApiService] Calendar response:', data);
      
      // Validate response structure
      if (!data || !data.data || !Array.isArray(data.data.events)) {
        throw new Error('Invalid calendar data received from server');
      }
      
      return data.data.events;
    } catch (error: any) {
      console.error('[CalendarApiService] Error fetching calendar events:', error);
      
      // Handle specific error types
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('JSON')) {
        throw new Error('Server returned invalid data. Please try again later.');
      }
      
      throw new Error(error.message || 'Failed to retrieve calendar');
    }
  }

  async updateJobSchedule(
    jobId: string,
    scheduledStartTime: string,
    scheduledEndTime: string,
    shift: string
  ): Promise<any> {
    try {
      const baseUrl = getBaseUrl();
      const headers = await this.getAuthHeaders();
      
      const payload = {
        scheduledStartTime,
        scheduledEndTime,
        shift
      };

      console.log('[CalendarApiService] Updating job schedule:', { jobId, payload });

      const response = await fetch(`${baseUrl}/api/v1/calendar/jobs/${jobId}/schedule`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CalendarApiService] Job schedule updated:', data);
      
      return data;
    } catch (error: any) {
      console.error('[CalendarApiService] Error updating job schedule:', error);
      throw new Error(error.message || 'Failed to update job schedule');
    }
  }

  async getCalendarFeedUrl(): Promise<CalendarFeedResponse['data']> {
    try {
      const baseUrl = getBaseUrl();
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${baseUrl}/api/v1/calendar/my-calendar/feed-url`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: CalendarFeedResponse = await response.json();
      console.log('[CalendarApiService] Feed URL response:', data);
      
      return data.data;
    } catch (error: any) {
      console.error('[CalendarApiService] Error getting feed URL:', error);
      throw new Error(error.message || 'Failed to get calendar feed URL');
    }
  }

  async downloadCalendarICS(): Promise<string> {
    try {
      const baseUrl = getBaseUrl();
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${baseUrl}/api/v1/calendar/my-calendar/download`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      const icsContent = await response.text();
      console.log('[CalendarApiService] ICS content length:', icsContent.length);
      
      return icsContent;
    } catch (error: any) {
      console.error('[CalendarApiService] Error downloading ICS:', error);
      throw new Error(error.message || 'Failed to download calendar file');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Scheduled': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Completed': return '#2196F3';
      case 'Overdue': return '#F44336';
      case 'In Progress': return '#9C27B0';
      default: return '#9E9E9E';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  }

  formatEventTime(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  getShiftDisplayName(shift: string): string {
    switch (shift.toLowerCase()) {
      case 'morning': return 'Morning (9AM-12PM)';
      case 'afternoon': return 'Afternoon (1PM-5PM)';
      case 'evening': return 'Evening (6PM-9PM)';
      default: return shift;
    }
  }
}

export default new CalendarApiService();