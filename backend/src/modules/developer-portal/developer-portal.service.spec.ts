import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DeveloperPortalService } from './developer-portal.service';

describe('DeveloperPortalService', () => {
  const makeApiKeyModel = () => {
    const save = jest.fn();
    const ctor = function (this: any, doc: any) {
      Object.assign(this, doc);
      this.save = save;
    } as any;
    ctor.find = jest.fn();
    ctor.findOne = jest.fn();
    ctor.deleteOne = jest.fn();
    ctor.__save = save;
    return ctor;
  };

  const makeWebhookLogModel = () => {
    return {
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOne: jest.fn(),
    };
  };

  it('throws BadRequest on invalid tenantId for listApiKeys', async () => {
    const apiKeyModel = makeApiKeyModel();
    const webhookModel = makeWebhookLogModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeveloperPortalService,
        { provide: getModelToken('DeveloperApiKey'), useValue: apiKeyModel },
        { provide: getModelToken('WebhookDeliveryLog'), useValue: webhookModel },
      ],
    }).compile();

    const service = moduleRef.get(DeveloperPortalService);
    await expect(service.listApiKeys('nope')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates createApiKey inputs and trims name', async () => {
    const apiKeyModel = makeApiKeyModel();
    const webhookModel = makeWebhookLogModel();

    apiKeyModel.__save.mockResolvedValue({
      _id: '507f1f77bcf86cd799439099',
      name: 'My Key',
      keyPrefix: 'sk_1234567890',
      scopes: [],
      expiresAt: undefined,
      createdAt: new Date('2024-01-01'),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeveloperPortalService,
        { provide: getModelToken('DeveloperApiKey'), useValue: apiKeyModel },
        { provide: getModelToken('WebhookDeliveryLog'), useValue: webhookModel },
      ],
    }).compile();

    const service = moduleRef.get(DeveloperPortalService);

    await expect(
      service.createApiKey('bad', '507f1f77bcf86cd799439012', { name: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const created = await service.createApiKey(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      { name: '  My Key  ' },
    );

    expect(created.name).toBe('My Key');
  });

  it('clamps limit/skip for listWebhookDeliveryLogs', async () => {
    const apiKeyModel = makeApiKeyModel();
    const webhookModel = makeWebhookLogModel();

    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    webhookModel.find.mockReturnValue(chain);
    webhookModel.countDocuments.mockResolvedValue(0);

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeveloperPortalService,
        { provide: getModelToken('DeveloperApiKey'), useValue: apiKeyModel },
        { provide: getModelToken('WebhookDeliveryLog'), useValue: webhookModel },
      ],
    }).compile();

    const service = moduleRef.get(DeveloperPortalService);
    await service.listWebhookDeliveryLogs('507f1f77bcf86cd799439011', {
      limit: 9999,
      skip: -5,
    });

    expect(chain.limit).toHaveBeenCalledWith(100);
    expect(chain.skip).toHaveBeenCalledWith(0);
  });

  it('getWebhookDeliveryLog throws NotFound when missing', async () => {
    const apiKeyModel = makeApiKeyModel();
    const webhookModel = makeWebhookLogModel();

    webhookModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        DeveloperPortalService,
        { provide: getModelToken('DeveloperApiKey'), useValue: apiKeyModel },
        { provide: getModelToken('WebhookDeliveryLog'), useValue: webhookModel },
      ],
    }).compile();

    const service = moduleRef.get(DeveloperPortalService);
    await expect(
      service.getWebhookDeliveryLog(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439099',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
