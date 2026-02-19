import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CrmContact,
  CrmContactDocument,
} from '../../database/schemas/crm-contact.schema';
import {
  CrmCompany,
  CrmCompanyDocument,
} from '../../database/schemas/crm-company.schema';
import {
  CrmDeal,
  CrmDealDocument,
} from '../../database/schemas/crm-deal.schema';
import {
  CrmTask,
  CrmTaskDocument,
} from '../../database/schemas/crm-task.schema';
import { CrmNotificationService } from './crm-notification.service';
import { CalendarService } from '../../common/calendar/calendar.service';

@Injectable()
export class CrmService {
  constructor(
    @InjectModel(CrmContact.name)
    private readonly contactModel: Model<CrmContactDocument>,
    @InjectModel(CrmCompany.name)
    private readonly companyModel: Model<CrmCompanyDocument>,
    @InjectModel(CrmDeal.name)
    private readonly dealModel: Model<CrmDealDocument>,
    @InjectModel(CrmTask.name)
    private readonly taskModel: Model<CrmTaskDocument>,
    private readonly crmNotificationService: CrmNotificationService,
    private readonly calendarService: CalendarService,
  ) {}

  async listContacts(tenantId: string) {
    return this.contactModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
  }

  async createContact(tenantId: string, payload: Partial<CrmContact>) {
    if (!payload.name || !payload.email) {
      throw new BadRequestException('Name and email are required');
    }
    return this.contactModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      companyName: payload.companyName,
      source: payload.source,
      ownerId: payload.ownerId,
    });
  }

  async listCompanies(tenantId: string) {
    return this.companyModel.find({ tenantId }).sort({ createdAt: -1 }).lean();
  }

  async createCompany(tenantId: string, payload: Partial<CrmCompany>) {
    if (!payload.name) {
      throw new BadRequestException('Name is required');
    }
    return this.companyModel.create({
      tenantId: new Types.ObjectId(tenantId),
      name: payload.name,
      website: payload.website,
      industry: payload.industry,
    });
  }

  async listDeals(tenantId: string) {
    return this.dealModel.aggregate([
      { $match: { tenantId: new Types.ObjectId(tenantId) } },
      {
        $lookup: {
          from: 'crmcontacts',
          localField: 'contactId',
          foreignField: '_id',
          as: 'contact',
        },
      },
      {
        $lookup: {
          from: 'crmcompanies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: { path: '$contact', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          value: 1,
          stage: 1,
          source: 1,
          contactId: 1,
          companyId: 1,
          contactName: '$contact.name',
          companyName: '$company.name',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async createDeal(tenantId: string, payload: Partial<CrmDeal>) {
    if (!payload.title) {
      throw new BadRequestException('Title is required');
    }
    const deal = await this.dealModel.create({
      tenantId: new Types.ObjectId(tenantId),
      title: payload.title,
      value: payload.value ?? 0,
      contactId: payload.contactId,
      companyId: payload.companyId,
      stage: payload.stage ?? 'NEW',
      ownerId: payload.ownerId,
      source: payload.source,
    });

    // Fire notification for new deal creation (best-effort)
    this.crmNotificationService
      .notifyDealCreated(tenantId, deal as unknown as CrmDeal)
      .catch(() => undefined);

    return deal;
  }

  async updateDealStage(tenantId: string, id: string, stage: CrmDeal['stage']) {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const existing = await this.dealModel
      .findOne({ _id: id, tenantId: tenantObjectId })
      .lean();

    if (!existing) {
      throw new BadRequestException('Deal not found');
    }

    if (existing.stage === stage) {
      return existing;
    }

    const updated = await this.dealModel
      .findOneAndUpdate(
        { _id: id, tenantId: tenantObjectId },
        { stage },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new BadRequestException('Deal not found');
    }

    // Fire notification for stage change (best-effort)
    this.crmNotificationService
      .notifyDealStageChanged(
        tenantId,
        updated as unknown as CrmDeal,
        existing.stage,
      )
      .catch(() => undefined);

    return updated;
  }

  async listMyTasks(tenantId: string, userId: string) {
    return this.taskModel.aggregate([
      {
        $match: {
          tenantId: new Types.ObjectId(tenantId),
          assigneeId: new Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'crmdeals',
          localField: 'dealId',
          foreignField: '_id',
          as: 'deal',
        },
      },
      { $unwind: { path: '$deal', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          dueDate: 1,
          completed: 1,
          dealId: 1,
          dealTitle: '$deal.title',
        },
      },
      { $sort: { dueDate: 1, createdAt: -1 } },
    ]);
  }

  async createTask(
    tenantId: string,
    payload: {
      title?: string;
      description?: string;
      assigneeId?: string;
      dueDate?: string;
      dealId?: string;
    },
  ) {
    if (!payload.title || !payload.assigneeId) {
      throw new BadRequestException('Title and assigneeId are required');
    }
    const task = await this.taskModel.create({
      tenantId: new Types.ObjectId(tenantId),
      title: payload.title,
      description: payload.description,
      assigneeId: new Types.ObjectId(payload.assigneeId),
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      dealId: payload.dealId ? new Types.ObjectId(payload.dealId) : undefined,
    });

    // Best-effort: create a corresponding Google Calendar event if integration is enabled
    try {
      if (task.dueDate) {
        const startIso = task.dueDate.toISOString();
        // Default to 30-minute duration for CRM tasks
        const endIso = new Date(
          task.dueDate.getTime() + 30 * 60 * 1000,
        ).toISOString();

        const event = await this.calendarService.createEvent({
          summary: task.title,
          description: task.description,
          start: startIso,
          end: endIso,
        });

        if (event && event.id) {
          // Persist the external calendar event ID for potential future updates/deletes
          await this.taskModel.updateOne(
            { _id: task._id },
            { $set: { calendarEventId: event.id } },
          );
        }
      }
    } catch {
      // Ignore calendar errors to avoid blocking task creation
    }

    // Fire notification for task assignment (best-effort)
    this.crmNotificationService
      .notifyTaskAssigned(tenantId, task as unknown as CrmTask)
      .catch(() => undefined);

    return task;
  }

  async setTaskCompleted(
    tenantId: string,
    userId: string,
    id: string,
    completed: boolean,
  ) {
    const updated = await this.taskModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
          assigneeId: new Types.ObjectId(userId),
        },
        { completed },
        { new: true },
      )
      .lean();
    if (!updated) {
      throw new BadRequestException('Task not found');
    }

    // Fire notification when a task is marked as completed (best-effort)
    if (completed) {
      this.crmNotificationService
        .notifyTaskCompleted(tenantId, updated as unknown as CrmTask)
        .catch(() => undefined);
    }

    // Best-effort: if the task has an associated calendar event, update it to reflect completion
    if (updated.calendarEventId) {
      try {
        await this.calendarService.updateEvent(updated.calendarEventId, {
          summary: updated.title,
          description: updated.description,
        });
      } catch {
        // Ignore calendar errors
      }
    }

    return updated;
  }

  async deleteTask(tenantId: string, userId: string, id: string) {
    const existing = await this.taskModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
        assigneeId: new Types.ObjectId(userId),
      })
      .lean();

    if (!existing) {
      throw new BadRequestException('Task not found');
    }

    await this.taskModel.deleteOne({ _id: existing._id });

    if (existing.calendarEventId) {
      try {
        await this.calendarService.deleteEvent(existing.calendarEventId);
      } catch {
        // Ignore calendar errors
      }
    }

    return { success: true };
  }

  // ===== Analytics =====

  async getAnalytics(tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);

    // Pipeline by stage
    const pipelineByStage = await this.dealModel.aggregate([
      { $match: { tenantId: tenantOid } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    // Revenue forecast (sum of all non-LOST deals)
    const revenueForecast = await this.dealModel.aggregate([
      {
        $match: {
          tenantId: tenantOid,
          stage: { $ne: 'LOST' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
        },
      },
    ]);

    // Task completion rate
    const taskStats = await this.taskModel.aggregate([
      { $match: { tenantId: tenantOid } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
        },
      },
    ]);

    return {
      pipelineByStage: pipelineByStage.map((item) => ({
        stage: item._id,
        count: item.count,
        totalValue: item.totalValue,
      })),
      revenueForecast: revenueForecast[0]?.total || 0,
      taskStats: {
        total: taskStats[0]?.total || 0,
        completed: taskStats[0]?.completed || 0,
        completionRate:
          taskStats[0]?.total > 0
            ? ((taskStats[0]?.completed / taskStats[0]?.total) * 100).toFixed(1)
            : '0.0',
      },
    };
  }
}
