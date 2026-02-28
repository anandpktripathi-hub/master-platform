import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';

describe('SettingsService', () => {
  let service: SettingsService;

  const settingModelMock: any = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getModelToken(Setting.name),
          useValue: settingModelMock,
        },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('casts tenantId to ObjectId when reading a group', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    settingModelMock.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { key: 'k1', value: 'v1' },
        { key: 'k2', value: { nested: true } },
      ]),
    });

    const res = await service.getGroupAdmin('basic', 'en', tenantId);

    expect(settingModelMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        group: 'basic',
        tenantId: new Types.ObjectId(tenantId),
        locale: 'en',
      }),
    );
    expect(res.items.k1).toBe('v1');
    expect(res.items.k2).toEqual({ nested: true });
  });

  it('throws when tenantId is invalid', async () => {
    await expect(service.getGroupAdmin('basic', 'en', 'not-an-oid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('upsertGroup requires tenantId for TENANT scope entries', async () => {
    await expect(
      service.upsertGroup('ui', [
        {
          key: 'flag',
          scope: 'TENANT',
          value: true,
        },
      ] as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upsertGroup casts tenantId to ObjectId in filters and inserts', async () => {
    const tenantId = new Types.ObjectId().toHexString();

    settingModelMock.findOneAndUpdate.mockResolvedValue({});
    settingModelMock.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ key: 'k', value: 'v' }]),
    });

    await service.upsertGroup('ui', [
      {
        key: 'k',
        scope: 'TENANT',
        value: 'v',
        tenantId,
        locale: 'en',
      },
    ]);

    expect(settingModelMock.findOneAndUpdate).toHaveBeenCalledWith(
      {
        group: 'ui',
        key: 'k',
        scope: 'TENANT',
        tenantId: new Types.ObjectId(tenantId),
        locale: 'en',
      },
      expect.objectContaining({
        $set: expect.any(Object),
        $setOnInsert: expect.objectContaining({
          tenantId: new Types.ObjectId(tenantId),
        }),
      }),
      { upsert: true, new: true },
    );
  });

  it('getIntegrationSettings reads the integrations group and maps defaults', async () => {
    settingModelMock.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          key: 'integration.settings',
          value: {
            slack: { enabled: true, webhookUrl: 'https://slack.example/hook' },
          },
        },
      ]),
    });

    const res = await service.getIntegrationSettings('ignored-tenant');

    const query = settingModelMock.find.mock.calls[0][0];
    expect(query.group).toBe('integrations');
    expect(query.tenantId).toBeUndefined();
    expect(res).toEqual({
      slack: {
        enabled: true,
        webhookUrl: 'https://slack.example/hook',
      },
      telegram: {
        enabled: false,
        botToken: '',
        chatId: '',
      },
      twilio: {
        enabled: false,
        accountSid: '',
        authToken: '',
        fromNumber: '',
      },
    });
  });

  it('getWebhookSettings reads the webhooks group and maps hook entries', async () => {
    settingModelMock.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          key: 'webhook.settings',
          value: {
            hooks: {
              invoice_paid: {
                enabled: true,
                url: 'https://example.com/hook',
                secretHeaderName: 'x-secret',
                secretHeaderValue: 's3cr3t',
              },
            },
          },
        },
      ]),
    });

    const res = await service.getWebhookSettings('ignored-tenant');

    const query = settingModelMock.find.mock.calls[0][0];
    expect(query.group).toBe('webhooks');
    expect(query.tenantId).toBeUndefined();
    expect(res).toEqual({
      hooks: {
        invoice_paid: {
          enabled: true,
          url: 'https://example.com/hook',
          secretHeaderName: 'x-secret',
          secretHeaderValue: 's3cr3t',
        },
      },
    });
  });
});
