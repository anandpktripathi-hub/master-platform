import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { CrmDeal } from '../../database/schemas/crm-deal.schema';
import { CrmTask } from '../../database/schemas/crm-task.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { SettingsService } from '../settings/settings.service';
import { EmailService, SendEmailOptions } from '../settings/email.service';
import { entriesToNotificationDto } from '../settings/mappers/notification-settings-mappers';
import { NotificationsService } from '../notifications/notifications.service';

const CRM_EVENT_DEAL_CREATED = 'crm.deal.created';
const CRM_EVENT_DEAL_STAGE_CHANGED = 'crm.deal.stage_changed';
const CRM_EVENT_TASK_ASSIGNED = 'crm.task.assigned';
const CRM_EVENT_TASK_COMPLETED = 'crm.task.completed';

@Injectable()
export class CrmNotificationService {
  private readonly logger = new Logger(CrmNotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    private readonly notifications: NotificationsService,
  ) {}

  async notifyDealCreated(tenantId: string, deal: CrmDeal): Promise<void> {
    try {
      if (!deal.ownerId) {
        return;
      }

      const appName = this.getAppName();
      const baseUrl = this.getAppBaseUrl();
      const dealsUrl = `${baseUrl}/app/crm/deals`;

      const [owner, tenant] = await Promise.all([
        this.userModel.findById(deal.ownerId).lean(),
        this.findTenantSafe(tenantId),
      ]);

      if (!owner || !owner.email) {
        return;
      }

      const subject = `${appName}: New deal assigned – ${deal.title}`;

      const html = this.renderHtmlWrapper(
        `New deal assigned to you`,
        `<p>Hi ${this.getUserDisplayName(owner)},</p>
         <p>A new deal <strong>${deal.title}</strong> has been created and assigned to you.</p>
         <p>
           <strong>Value:</strong> ${deal.value ?? 0}<br/>
           <strong>Stage:</strong> ${deal.stage}<br/>
           ${tenant ? `<strong>Tenant:</strong> ${tenant.name}<br/>` : ''}
         </p>
         <p>
           You can review and update this deal from your CRM deals list.
         </p>
         <p>
           <a href="${dealsUrl}">Open CRM Deals</a>
         </p>`,
      );

      const text = `New deal assigned to you: ${deal.title} (stage: ${deal.stage}, value: ${
        deal.value ?? 0
      }).`;

      const channel = await this.getChannel(CRM_EVENT_DEAL_CREATED);
      const emailEnabled = !channel || Boolean(channel.email);
      const inAppEnabled = Boolean(channel?.inApp);

      if (emailEnabled) {
        await this.sendEmailToUser(owner._id, { subject, html, text });
      }

      if (inAppEnabled && owner && owner._id) {
        await this.notifications
          .createForUser({
            tenantId,
            userId: String(owner._id),
            eventKey: CRM_EVENT_DEAL_CREATED,
            title: 'New CRM deal assigned to you',
            message: `Deal ${deal.title} has been assigned to you.`,
            linkUrl: dealsUrl,
          })
          .catch(() => undefined);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send CRM deal created notification for deal ${
          deal && (deal as any)._id
        }: ${(error as Error).message || error}`,
      );
    }
  }

  async notifyDealStageChanged(
    tenantId: string,
    deal: CrmDeal,
    previousStage: CrmDeal['stage'],
  ): Promise<void> {
    try {
      if (!deal.ownerId || previousStage === deal.stage) {
        return;
      }

      const appName = this.getAppName();
      const baseUrl = this.getAppBaseUrl();
      const dealsUrl = `${baseUrl}/app/crm/deals`;

      const [owner, tenant] = await Promise.all([
        this.userModel.findById(deal.ownerId).lean(),
        this.findTenantSafe(tenantId),
      ]);

      if (!owner || !owner.email) {
        return;
      }

      const subject = `${appName}: Deal stage updated – ${deal.title}`;

      const html = this.renderHtmlWrapper(
        `Deal stage updated`,
        `<p>Hi ${this.getUserDisplayName(owner)},</p>
         <p>Your deal <strong>${deal.title}</strong> has moved stages.</p>
         <p>
           <strong>Previous stage:</strong> ${previousStage}<br/>
           <strong>Current stage:</strong> ${deal.stage}<br/>
           ${tenant ? `<strong>Tenant:</strong> ${tenant.name}<br/>` : ''}
           <strong>Value:</strong> ${deal.value ?? 0}
         </p>
         <p>
           You can review the deal and next actions from your CRM deals list.
         </p>
         <p>
           <a href="${dealsUrl}">Open CRM Deals</a>
         </p>`,
      );

      const text = `Deal stage updated for ${deal.title}: ${previousStage} → ${deal.stage}.`;

      const channel = await this.getChannel(CRM_EVENT_DEAL_STAGE_CHANGED);
      const emailEnabled = !channel || Boolean(channel.email);
      const inAppEnabled = Boolean(channel?.inApp);

      if (emailEnabled) {
        await this.sendEmailToUser(deal.ownerId, { subject, html, text });
      }

      if (inAppEnabled && deal.ownerId) {
        await this.notifications
          .createForUser({
            tenantId,
            userId: String(deal.ownerId),
            eventKey: CRM_EVENT_DEAL_STAGE_CHANGED,
            title: 'CRM deal stage updated',
            message: `Deal ${deal.title} moved from ${previousStage} to ${deal.stage}.`,
            linkUrl: dealsUrl,
          })
          .catch(() => undefined);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send CRM deal stage change notification for deal ${
          deal && (deal as any)._id
        }: ${(error as Error).message || error}`,
      );
    }
  }

  async notifyTaskAssigned(tenantId: string, task: CrmTask): Promise<void> {
    try {
      const appName = this.getAppName();
      const baseUrl = this.getAppBaseUrl();
      const tasksUrl = `${baseUrl}/app/crm/tasks`;

      const [assignee, tenant] = await Promise.all([
        this.userModel.findById(task.assigneeId).lean(),
        this.findTenantSafe(tenantId),
      ]);

      if (!assignee || !assignee.email) {
        return;
      }

      const subject = `${appName}: New CRM task assigned – ${task.title}`;

      const dueText = task.dueDate
        ? `Due on ${task.dueDate.toLocaleDateString()}`
        : 'No due date set';

      const html = this.renderHtmlWrapper(
        `New CRM task assigned to you`,
        `<p>Hi ${this.getUserDisplayName(assignee)},</p>
         <p>A new CRM task has been assigned to you.</p>
         <p>
           <strong>Title:</strong> ${task.title}<br/>
           ${task.description ? `<strong>Description:</strong> ${task.description}<br/>` : ''}
           ${tenant ? `<strong>Tenant:</strong> ${tenant.name}<br/>` : ''}
           <strong>${dueText}</strong>
         </p>
         <p>
           You can view and update this task from your CRM tasks list.
         </p>
         <p>
           <a href="${tasksUrl}">Open My Tasks</a>
         </p>`,
      );

      const text = `New CRM task assigned: ${task.title}. ${dueText}.`;

      const channel = await this.getChannel(CRM_EVENT_TASK_ASSIGNED);
      const emailEnabled = !channel || Boolean(channel.email);
      const inAppEnabled = Boolean(channel?.inApp);

      if (emailEnabled) {
        await this.sendEmailToUser(task.assigneeId, { subject, html, text });
      }

      if (inAppEnabled && task.assigneeId) {
        await this.notifications
          .createForUser({
            tenantId,
            userId: String(task.assigneeId),
            eventKey: CRM_EVENT_TASK_ASSIGNED,
            title: 'New CRM task assigned',
            message: `Task ${task.title} has been assigned to you.`,
            linkUrl: tasksUrl,
          })
          .catch(() => undefined);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send CRM task assigned notification for task ${
          task && (task as any)._id
        }: ${(error as Error).message || error}`,
      );
    }
  }

  async notifyTaskCompleted(tenantId: string, task: CrmTask): Promise<void> {
    try {
      if (!task.completed) {
        return;
      }

      const appName = this.getAppName();
      const baseUrl = this.getAppBaseUrl();
      const tasksUrl = `${baseUrl}/app/crm/tasks`;

      const [assignee, tenant] = await Promise.all([
        this.userModel.findById(task.assigneeId).lean(),
        this.findTenantSafe(tenantId),
      ]);

      if (!assignee || !assignee.email) {
        return;
      }

      const subject = `${appName}: Task completed – ${task.title}`;

      const html = this.renderHtmlWrapper(
        `CRM task completed`,
        `<p>Hi ${this.getUserDisplayName(assignee)},</p>
         <p>The CRM task <strong>${task.title}</strong> has been marked as completed.</p>
         ${tenant ? `<p><strong>Tenant:</strong> ${tenant.name}</p>` : ''}
         <p>
           You can review completed tasks from your CRM tasks list.
         </p>
         <p>
           <a href="${tasksUrl}">Open My Tasks</a>
         </p>`,
      );

      const text = `CRM task completed: ${task.title}.`;

      const channel = await this.getChannel(CRM_EVENT_TASK_COMPLETED);
      const emailEnabled = !channel || Boolean(channel.email);
      const inAppEnabled = Boolean(channel?.inApp);

      if (emailEnabled) {
        await this.sendEmailToUser(task.assigneeId, { subject, html, text });
      }

      if (inAppEnabled && task.assigneeId) {
        await this.notifications
          .createForUser({
            tenantId,
            userId: String(task.assigneeId),
            eventKey: CRM_EVENT_TASK_COMPLETED,
            title: 'CRM task completed',
            message: `Task ${task.title} has been marked as completed.`,
            linkUrl: tasksUrl,
          })
          .catch(() => undefined);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send CRM task completed notification for task ${
          task && (task as any)._id
        }: ${(error as Error).message || error}`,
      );
    }
  }

  private async getChannel(eventKey: string) {
    try {
      const res = await this.settingsService.getGroupAdmin('notifications');
      const dto = entriesToNotificationDto(res.items);
      return dto.events[eventKey];
    } catch (error) {
      this.logger.error(
        `Failed to read notification settings for ${eventKey}: ${
          (error as Error).message || error
        }`,
      );
      return undefined;
    }
  }

  private async sendEmailToUser(
    userId: Types.ObjectId | string | undefined,
    payload: Pick<SendEmailOptions, 'subject' | 'html' | 'text'>,
  ): Promise<void> {
    if (!userId) {
      return;
    }

    const user = await this.userModel
      .findById(new Types.ObjectId(String(userId)))
      .lean();

    if (!user || !user.email) {
      return;
    }

    const options: SendEmailOptions = {
      to: user.email,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    };

    await this.emailService.sendEmail(options);
  }

  private async findTenantSafe(tenantId: string): Promise<Tenant | null> {
    try {
      if (!tenantId) return null;
      const oid = new Types.ObjectId(String(tenantId));
      const tenant = await this.tenantModel.findById(oid).lean();
      return (tenant as Tenant) || null;
    } catch {
      return null;
    }
  }

  private getUserDisplayName(user: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (user.name) {
      return user.name;
    }
    return user.email || 'there';
  }

  private getAppName(): string {
    return this.configService.get<string>('APP_NAME') || 'Master Platform';
  }

  private getAppBaseUrl(): string {
    const base =
      this.configService.get<string>('PUBLIC_APP_URL') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    return base.replace(/\/$/, '');
  }

  private renderHtmlWrapper(title: string, body: string): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body>
    ${body}
  </body>
</html>`;
  }
}
