import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IncomingWebhookEvent,
  IncomingWebhookEventDocument,
  IncomingWebhookProvider,
} from '../../database/schemas/incoming-webhook-event.schema';

export type AcquireSlotState = 'acquired' | 'duplicate_processed' | 'in_progress';

@Injectable()
export class IncomingWebhookEventsService {
  private readonly ttlDays = 30;
  private readonly processingLeaseMs = 10 * 60 * 1000; // 10 minutes

  constructor(
    @InjectModel(IncomingWebhookEvent.name)
    private readonly model: Model<IncomingWebhookEventDocument>,
  ) {}

  async acquireProcessingSlot(params: {
    provider: IncomingWebhookProvider;
    eventId: string;
    eventType: string;
    accountId?: string;
    payloadHash: string;
  }): Promise<{ state: AcquireSlotState; docId?: string }> {
    const now = new Date();
    const lockUntil = new Date(now.getTime() + this.processingLeaseMs);
    const expiresAt = new Date(now.getTime() + this.ttlDays * 86400_000);

    try {
      const doc = await this.model
        .findOneAndUpdate(
          {
            provider: params.provider,
            eventId: params.eventId,
            // Only acquire if not already processed and not currently locked.
            status: { $ne: 'processed' },
            $or: [
              { processingLockUntil: { $exists: false } },
              { processingLockUntil: { $lte: now } },
            ],
          },
          {
            $setOnInsert: {
              provider: params.provider,
              eventId: params.eventId,
              eventType: params.eventType,
              accountId: params.accountId,
              payloadHash: params.payloadHash,
              receivedAt: now,
              expiresAt,
              status: 'received',
              attempts: 0,
            },
            $set: {
              lastAttemptAt: now,
              processingLockUntil: lockUntil,
            },
            $inc: { attempts: 1 },
          },
          {
            upsert: true,
            new: true,
          },
        )
        .exec();

      if (doc?._id) {
        return { state: 'acquired', docId: doc._id.toString() };
      }
    } catch (err: any) {
      // Possible duplicate key during racing upsert.
      if (err?.code !== 11000) {
        throw err;
      }
    }

    const existing = await this.model
      .findOne({ provider: params.provider, eventId: params.eventId })
      .select({ status: 1, processingLockUntil: 1 })
      .exec();

    if (existing?.status === 'processed') {
      return { state: 'duplicate_processed' };
    }

    return { state: 'in_progress' };
  }

  async markProcessed(docId: string): Promise<void> {
    const now = new Date();
    await this.model
      .updateOne(
        { _id: docId },
        {
          $set: {
            status: 'processed',
            processedAt: now,
            processingLockUntil: undefined,
          },
        },
      )
      .exec();
  }

  async markFailed(docId: string, err: unknown): Promise<void> {
    const now = new Date();
    const e = err as any;
    await this.model
      .updateOne(
        { _id: docId },
        {
          $set: {
            status: 'failed',
            processingLockUntil: undefined,
            lastError: {
              message: typeof e?.message === 'string' ? e.message : 'Unknown error',
              name: typeof e?.name === 'string' ? e.name : undefined,
              stack: typeof e?.stack === 'string' ? e.stack : undefined,
            },
            lastAttemptAt: now,
          },
        },
      )
      .exec();
  }
}
