import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserNotification,
  UserNotificationDocument,
} from '../../database/schemas/user-notification.schema';
import { SlackIntegrationService } from '../../common/integrations/slack-integration.service';
import { TelegramIntegrationService } from '../../common/integrations/telegram-integration.service';

export interface CreateNotificationInput {
  tenantId: string;
  userId: string;
  eventKey: string;
  title: string;
  message: string;
  linkUrl?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(UserNotification.name)
    private readonly notificationModel: Model<UserNotificationDocument>,
    private readonly slack: SlackIntegrationService,
    private readonly telegram: TelegramIntegrationService,
  ) {}

  async createForUser(
    input: CreateNotificationInput,
  ): Promise<UserNotification> {
    const doc = new this.notificationModel({
      tenantId: new Types.ObjectId(input.tenantId),
      userId: new Types.ObjectId(input.userId),
      eventKey: input.eventKey,
      title: input.title,
      message: input.message,
      linkUrl: input.linkUrl,
      read: false,
    });

    const saved = await doc.save();

    const summary = `Notification: ${input.title}`;

    void this.slack.sendMessage(input.tenantId, summary).catch(() => undefined);

    void this.telegram
      .sendMessage(input.tenantId, summary, { disableNotification: false })
      .catch(() => undefined);

    return saved.toObject() as UserNotification;
  }

  async listForUser(
    tenantId: string,
    userId: string,
    opts?: { limit?: number },
  ): Promise<UserNotification[]> {
    const limit = opts?.limit && opts.limit > 0 ? opts.limit : 50;

    return this.notificationModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markAllRead(tenantId: string, userId: string): Promise<number> {
    const res = await this.notificationModel.updateMany(
      {
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        read: false,
      },
      { $set: { read: true } },
    );
    return res.modifiedCount ?? 0;
  }
}
