import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../../database/schemas/push-subscription.schema';

type SavePushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function toObjectId(value: string, fieldName: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) {
    throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
  }
  return new Types.ObjectId(value);
}

@Injectable()
export class PushSubscriptionsService {
  constructor(
    @InjectModel(PushSubscription.name)
    private readonly subscriptionModel: Model<PushSubscriptionDocument>,
  ) {}

  async saveOrUpdateForUser(
    tenantId: string,
    userId: string,
    input: SavePushSubscriptionInput,
  ): Promise<PushSubscription> {
    if (!input?.endpoint) {
      throw new BadRequestException('endpoint is required');
    }
    if (!input?.keys?.p256dh || !input?.keys?.auth) {
      throw new BadRequestException('keys.p256dh and keys.auth are required');
    }

    const filter = {
      tenantId: toObjectId(tenantId, 'tenantId'),
      userId: toObjectId(userId, 'userId'),
      endpoint: input.endpoint,
    };

    const update = {
      $set: {
        keys: input.keys,
      },
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    } as const;

    const doc = await this.subscriptionModel
      .findOneAndUpdate(filter, update, options)
      .lean<PushSubscriptionDocument>()
      .exec();

    return doc as unknown as PushSubscription;
  }

  async getForTenant(tenantId: string): Promise<PushSubscription[]> {
    return this.subscriptionModel
      .find({ tenantId: toObjectId(tenantId, 'tenantId') })
      .lean<PushSubscriptionDocument[]>()
      .exec();
  }

  async getForUser(
    tenantId: string,
    userId: string,
  ): Promise<PushSubscription[]> {
    return this.subscriptionModel
      .find({
        tenantId: toObjectId(tenantId, 'tenantId'),
        userId: toObjectId(userId, 'userId'),
      })
      .lean<PushSubscriptionDocument[]>()
      .exec();
  }

  async removeByEndpoint(
    tenantId: string,
    endpoint: string,
    userId?: string,
  ): Promise<void> {
    if (!endpoint) {
      throw new BadRequestException('endpoint is required');
    }

    const filter: Record<string, unknown> = {
      tenantId: toObjectId(tenantId, 'tenantId'),
      endpoint,
    };

    if (userId) {
      filter.userId = toObjectId(userId, 'userId');
    }

    await this.subscriptionModel
      .deleteMany(filter)
      .exec();
  }
}
