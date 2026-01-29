import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CalendarService } from './calendar.service';
import { SettingsService } from '../../modules/settings/settings.service';

jest.mock('../../modules/settings/mappers/calendar-settings-mappers', () => ({
  entriesToCalendarDto: jest.fn(() => ({
    enabled: true,
    googleCalendarId: 'primary-calendar',
    googleServiceAccountJson: JSON.stringify({
      client_email: 'svc@example.com',
      private_key: 'KEY',
      project_id: 'project-id',
    }),
  })),
}));

jest.mock('googleapis', () => {
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          /* auth client stub */
        })),
      },
      calendar: jest.fn().mockReturnValue({
        events: {
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        },
      }),
    },
    _mocks: { mockInsert, mockUpdate, mockDelete },
  };
});

const { mockInsert, mockUpdate, mockDelete } = (jest.requireMock('googleapis') as {
  _mocks: {
    mockInsert: jest.Mock;
    mockUpdate: jest.Mock;
    mockDelete: jest.Mock;
  };
})._mocks;

describe('CalendarService', () => {
  let service: CalendarService;
  let settingsService: SettingsService;
  let configService: ConfigService;

  beforeEach(async () => {
    settingsService = {
      getGroupAdmin: jest.fn().mockResolvedValue({ items: [] } as any),
    } as unknown as SettingsService;

    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;

    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockDelete.mockReset();

    mockInsert.mockResolvedValue({ data: { id: 'evt-1', summary: 'Summary' } });
    mockUpdate.mockResolvedValue({ data: { id: 'evt-1' } });
    mockDelete.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: SettingsService, useValue: settingsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(CalendarService);
  });

  it('creates an event via googleapis when enabled and configured', async () => {
    const result = await service.createEvent({
      summary: 'Call with client',
      description: 'Discuss proposal',
      start: '2025-01-01T10:00:00.000Z',
      end: '2025-01-01T10:30:00.000Z',
      attendees: [{ email: 'user@example.com' }],
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'evt-1', summary: 'Summary' });
  });

  it('updates an event via googleapis when enabled and configured', async () => {
    const result = await service.updateEvent('evt-1', {
      summary: 'Updated title',
      description: 'Updated description',
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'evt-1' });
  });

  it('deletes an event via googleapis when enabled and configured', async () => {
    const result = await service.deleteEvent('evt-1');

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('returns null and does not call googleapis when disabled in settings', async () => {
    const m = require('../../modules/settings/mappers/calendar-settings-mappers') as {
      entriesToCalendarDto: jest.Mock;
    };

    m.entriesToCalendarDto.mockReturnValueOnce({
      enabled: false,
      googleCalendarId: '',
      googleServiceAccountJson: '',
    });

    const result = await service.createEvent({
      summary: 'Should not be sent',
      start: '2025-01-01T10:00:00.000Z',
      end: '2025-01-01T10:30:00.000Z',
    } as any);

    expect(result).toBeNull();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
