import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { ExternalAccountClientOptions, JWTInput } from 'google-auth-library';
import { SettingsService } from '../../modules/settings/settings.service';
import { entriesToCalendarDto } from '../../modules/settings/mappers/calendar-settings-mappers';

/**
 * CalendarService – Sync events to Google Calendar
 *
 * This service loads calendar settings from the database and, when enabled,
 * uses googleapis to create or update events in a configured Google Calendar.
 *
 * Required Settings (stored in the 'calendar' group):
 *  - enabled (boolean)
 *  - googleCalendarId (string)
 *  - googleServiceAccountJson (string, base64-encoded or raw JSON)
 *
 * Environment Overrides:
 *  - GOOGLE_CALENDAR_ID
 *  - GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * Usage: await calendarService.createEvent({ summary, start, end })
 */
type GoogleAuthCredentials = JWTInput | ExternalAccountClientOptions;

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Create an event in the configured Google Calendar.
   *
   * @param eventData The event summary, start/end times, and optional attendees
   * @returns Google Calendar event object, or null if disabled/unconfigured
   */
  async createEvent(eventData: {
    summary: string;
    description?: string;
    start: string; // ISO8601 string or 'YYYY-MM-DD' for all-day
    end: string;
    attendees?: Array<{ email: string }>;
  }): Promise<calendar_v3.Schema$Event | null> {
    const settings = await this.getCalendarSettings();
    if (!settings.enabled) {
      this.logger.warn('Google Calendar integration is disabled in settings.');
      return null;
    }

    const calendarId =
      settings.googleCalendarId ||
      this.configService.get<string>('GOOGLE_CALENDAR_ID');
    const serviceAccountJson =
      settings.googleServiceAccountJson ||
      this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');

    if (!calendarId || !serviceAccountJson) {
      this.logger.error(
        'Google Calendar integration is enabled but calendarId or service account is missing.',
      );
      return null;
    }

    // Parse service account credentials
    let credentials: GoogleAuthCredentials;
    try {
      // If base64-encoded, decode first
      const raw = serviceAccountJson.startsWith('{')
        ? serviceAccountJson
        : Buffer.from(serviceAccountJson, 'base64').toString('utf8');
      const parsed: unknown = JSON.parse(raw);
      credentials = parsed as GoogleAuthCredentials;
    } catch {
      this.logger.error('Failed to parse Google service account JSON');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    try {
      const event = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          start: { dateTime: eventData.start },
          end: { dateTime: eventData.end },
          attendees: eventData.attendees,
        },
      });

      this.logger.log(
        `Created Google Calendar event: ${event.data.id} (${event.data.summary})`,
      );
      return event.data;
    } catch {
      this.logger.error('Failed to create Google Calendar event');
      return null;
    }
  }

  /**
   * Update an existing Google Calendar event.
   *
   * @param eventId The Google Calendar event ID
   * @param updates Partial event data to update
   * @returns Updated event data, or null if disabled/unconfigured/error
   */
  async updateEvent(
    eventId: string,
    updates: {
      summary?: string;
      description?: string;
      start?: string;
      end?: string;
      attendees?: Array<{ email: string }>;
    },
  ): Promise<calendar_v3.Schema$Event | null> {
    const settings = await this.getCalendarSettings();
    if (!settings.enabled) {
      this.logger.warn('Google Calendar integration is disabled in settings.');
      return null;
    }

    const calendarId =
      settings.googleCalendarId ||
      this.configService.get<string>('GOOGLE_CALENDAR_ID');
    const serviceAccountJson =
      settings.googleServiceAccountJson ||
      this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');

    if (!calendarId || !serviceAccountJson) {
      this.logger.error(
        'Google Calendar integration is enabled but calendarId or service account is missing.',
      );
      return null;
    }

    let credentials: GoogleAuthCredentials;
    try {
      const raw = serviceAccountJson.startsWith('{')
        ? serviceAccountJson
        : Buffer.from(serviceAccountJson, 'base64').toString('utf8');
      const parsed: unknown = JSON.parse(raw);
      credentials = parsed as GoogleAuthCredentials;
    } catch {
      this.logger.error('Failed to parse Google service account JSON');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    try {
      const event = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: {
          summary: updates.summary,
          description: updates.description,
          start: updates.start ? { dateTime: updates.start } : undefined,
          end: updates.end ? { dateTime: updates.end } : undefined,
          attendees: updates.attendees,
        },
      });

      this.logger.log(`Updated Google Calendar event: ${event.data.id}`);
      return event.data;
    } catch {
      this.logger.error('Failed to update Google Calendar event');
      return null;
    }
  }

  /**
   * Delete an event from the configured Google Calendar.
   *
   * @param eventId The Google Calendar event ID to delete
   * @returns True if deletion succeeded, false if disabled/unconfigured/error
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    const settings = await this.getCalendarSettings();
    if (!settings.enabled) {
      this.logger.warn('Google Calendar integration is disabled in settings.');
      return false;
    }

    const calendarId =
      settings.googleCalendarId ||
      this.configService.get<string>('GOOGLE_CALENDAR_ID');
    const serviceAccountJson =
      settings.googleServiceAccountJson ||
      this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');

    if (!calendarId || !serviceAccountJson) {
      this.logger.error(
        'Google Calendar integration is enabled but calendarId or service account is missing.',
      );
      return false;
    }

    let credentials: GoogleAuthCredentials;
    try {
      const raw = serviceAccountJson.startsWith('{')
        ? serviceAccountJson
        : Buffer.from(serviceAccountJson, 'base64').toString('utf8');
      const parsed: unknown = JSON.parse(raw);
      credentials = parsed as GoogleAuthCredentials;
    } catch {
      this.logger.error('Failed to parse Google service account JSON');
      return false;
    }
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });

      this.logger.log(`Deleted Google Calendar event: ${eventId}`);
      return true;
    } catch {
      this.logger.error(`Failed to delete Google Calendar event: ${eventId}`);
      return false;
    }
  }

  /**
   * Load calendar settings from the database using the existing settings
   * infrastructure and mappers.
   */
  private async getCalendarSettings() {
    const res = await this.settingsService.getGroupAdmin('calendar');
    return entriesToCalendarDto(res.items);
  }
}
