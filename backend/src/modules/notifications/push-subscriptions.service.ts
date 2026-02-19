import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from '../../database/schemas/push-subscription.schema';

export interface SavePushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
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
    const filter = {
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
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
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean<PushSubscriptionDocument[]>();
  }

  async getForUser(
    tenantId: string,
    userId: string,
  ): Promise<PushSubscription[]> {
    return this.subscriptionModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .lean<PushSubscriptionDocument[]>();
  }

  async removeByEndpoint(tenantId: string, endpoint: string): Promise<void> {
    await this.subscriptionModel
      .deleteMany({
        tenantId: new Types.ObjectId(tenantId),
        endpoint,
      })
      .exec();
  }
}
