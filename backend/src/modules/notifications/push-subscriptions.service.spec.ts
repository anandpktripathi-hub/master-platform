import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../../database/schemas/push-subscription.schema';
import { PushSubscriptionsService } from './push-subscriptions.service';

describe('PushSubscriptionsService', () => {
  let service: PushSubscriptionsService;
  let model: jest.Mocked<Model<PushSubscriptionDocument>>;

  beforeEach(async () => {
    const mockModel = {
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      deleteMany: jest.fn(),
    } as any as jest.Mocked<Model<PushSubscriptionDocument>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushSubscriptionsService,
        {
          provide: getModelToken(PushSubscription.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get(PushSubscriptionsService);
    model = module.get(getModelToken(PushSubscription.name));
  });

  it('should save or update subscription for user', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const input = {
      endpoint: 'https://example.com/push/1',
      keys: { p256dh: 'p', auth: 'a' },
    };

    const returnedDoc = {
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      endpoint: input.endpoint,
      keys: input.keys,
    } as any;

    model.findOneAndUpdate.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(returnedDoc) }),
    } as any);

    const result = await service.saveOrUpdateForUser(tenantId, userId, input);

    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(result.endpoint).toBe(input.endpoint);
  });

  it('should list subscriptions for tenant', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const docs = [{ endpoint: 'e1' }, { endpoint: 'e2' }] as any;

    model.find.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(docs) }),
    } as any);

    const result = await service.getForTenant(tenantId);

    expect(model.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
    });
    expect(result).toEqual(docs);
  });

  it('should list subscriptions for user', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();
    const docs = [{ endpoint: 'e1' }] as any;

    model.find.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(docs) }),
    } as any);

    const result = await service.getForUser(tenantId, userId);

    expect(model.find).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
    });
    expect(result).toEqual(docs);
  });

  it('should remove subscription by endpoint', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const endpoint = 'https://example.com/push/1';

    model.deleteMany.mockReturnValue({ exec: () => Promise.resolve() } as any);

    await service.removeByEndpoint(tenantId, endpoint);

    expect(model.deleteMany).toHaveBeenCalledWith({
      tenantId: new Types.ObjectId(tenantId),
      endpoint,
    });
  });
});
