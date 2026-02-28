import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  UserNotification,
  UserNotificationDocument,
} from '../../database/schemas/user-notification.schema';
import { NotificationsService } from './notifications.service';
import { SlackIntegrationService } from '../../common/integrations/slack-integration.service';
import { TelegramIntegrationService } from '../../common/integrations/telegram-integration.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const saveMock = jest.fn();

  const mockNotificationModel: any = Object.assign(
    jest.fn().mockImplementation(() => ({ save: saveMock })),
    {
      find: jest.fn(),
      updateMany: jest.fn(),
    },
  );

  const mockSlack = {
    sendMessage: jest.fn(async () => undefined),
  };

  const mockTelegram = {
    sendMessage: jest.fn(async () => undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(UserNotification.name),
          useValue: mockNotificationModel,
        },
        {
          provide: SlackIntegrationService,
          useValue: mockSlack,
        },
        {
          provide: TelegramIntegrationService,
          useValue: mockTelegram,
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listForUser throws BadRequestException for invalid ObjectIds', async () => {
    await expect(service.listForUser('not-an-oid', 'also-bad')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('listForUser queries by tenantId + userId', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();

    const docs = [{ title: 'x' }] as unknown as UserNotificationDocument[];

    mockNotificationModel.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: () => ({
            exec: async () => docs,
          }),
        }),
      }),
    });

    const res = await service.listForUser(tenantId, userId, { limit: 10 });

    expect(mockNotificationModel.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
    });
    expect(res).toEqual(docs);
  });

  it('markAllRead returns modifiedCount', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();

    mockNotificationModel.updateMany.mockReturnValue({
      exec: async () => ({ modifiedCount: 3 }),
    });

    const updated = await service.markAllRead(tenantId, userId);
    expect(updated).toBe(3);
  });
});
