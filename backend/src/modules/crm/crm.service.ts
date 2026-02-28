import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
import { PublicContactFormDto } from './dto/public-forms.dto';

// Accept both string and ObjectId inputs from controllers/DTOs.
type ContactPayload = Omit<Partial<CrmContact>, 'ownerId'> & {
  ownerId?: string | Types.ObjectId;
};

type DealPayload = Omit<
  Partial<CrmDeal>,
  'ownerId' | 'contactId' | 'companyId'
> & {
  ownerId?: string | Types.ObjectId;
  contactId?: string | Types.ObjectId;
  companyId?: string | Types.ObjectId;
};

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

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return new Types.ObjectId(value);
  }

  private toOptionalObjectId(
    value: string | undefined,
    fieldName: string,
  ): Types.ObjectId | undefined {
    if (!value) return undefined;
    return this.toObjectId(value, fieldName);
  }

  private pickFirstString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private pickFirstNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return undefined;
    return n;
  }

  private pickOptionalMongoId(value: unknown, fieldName: string): Types.ObjectId | undefined {
    const s = this.pickFirstString(value);
    if (!s) return undefined;
    return this.toObjectId(s, fieldName);
  }

  private async assertContactInTenant(tenantOid: Types.ObjectId, contactId: Types.ObjectId) {
    const exists = await this.contactModel
      .exists({ _id: contactId, tenantId: tenantOid })
      .exec();
    if (!exists) {
      throw new BadRequestException('contactId is invalid');
    }
  }

  private async assertCompanyInTenant(tenantOid: Types.ObjectId, companyId: Types.ObjectId) {
    const exists = await this.companyModel
      .exists({ _id: companyId, tenantId: tenantOid })
      .exec();
    if (!exists) {
      throw new BadRequestException('companyId is invalid');
    }
  }

  private async assertDealInTenant(tenantOid: Types.ObjectId, dealId: Types.ObjectId) {
    const exists = await this.dealModel
      .exists({ _id: dealId, tenantId: tenantOid })
      .exec();
    if (!exists) {
      throw new BadRequestException('dealId is invalid');
    }
  }

  async listContacts(tenantId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.contactModel
      .find({ tenantId: tenantOid })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getContactById(tenantId: string, id: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const contactId = this.toObjectId(id, 'contactId');

    const contact = await this.contactModel
      .findOne({ _id: contactId, tenantId: tenantOid })
      .lean()
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async createContact(tenantId: string, payload: ContactPayload) {
    if (!payload.name || !payload.email) {
      throw new BadRequestException('Name and email are required');
    }

    const normalizedEmail = String(payload.email).trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Name and email are required');
    }

    return this.contactModel.create({
      tenantId: this.toObjectId(tenantId, 'tenantId'),
      name: String(payload.name).trim(),
      email: normalizedEmail,
      phone: payload.phone,
      companyName: payload.companyName,
      source: payload.source,
      ownerId:
        typeof payload.ownerId === 'string'
          ? this.toOptionalObjectId(payload.ownerId, 'ownerId')
          : payload.ownerId,
    });
  }

  async updateContact(
    tenantId: string,
    id: string,
    patch: Record<string, unknown>,
  ) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const contactId = this.toObjectId(id, 'contactId');

    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};

    const name = this.pickFirstString(patch.name);
    if (patch.name !== undefined) {
      if (!name) throw new BadRequestException('name is invalid');
      set.name = name;
    }

    if (patch.email !== undefined) {
      const raw = this.pickFirstString(patch.email);
      if (!raw) throw new BadRequestException('email is invalid');
      const email = raw.toLowerCase();
      set.email = email;
    }

    if (patch.phone !== undefined) {
      const phone = this.pickFirstString(patch.phone);
      if (!phone) unset.phone = 1;
      else set.phone = phone;
    }

    if (patch.companyName !== undefined) {
      const companyName = this.pickFirstString(patch.companyName);
      if (!companyName) unset.companyName = 1;
      else set.companyName = companyName;
    }

    if (patch.source !== undefined) {
      const source = this.pickFirstString(patch.source);
      if (!source) unset.source = 1;
      else set.source = source;
    }

    if (patch.ownerId !== undefined) {
      if (patch.ownerId === null) {
        unset.ownerId = 1;
      } else {
        const ownerId = this.pickOptionalMongoId(patch.ownerId, 'ownerId');
        if (!ownerId) throw new BadRequestException('ownerId is invalid');
        set.ownerId = ownerId;
      }
    }

    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;

    const updated = await this.contactModel
      .findOneAndUpdate({ _id: contactId, tenantId: tenantOid }, update, {
        new: true,
      })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Contact not found');
    }

    return updated;
  }

  async deleteContact(tenantId: string, id: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const contactId = this.toObjectId(id, 'contactId');

    const res = await this.contactModel
      .deleteOne({ _id: contactId, tenantId: tenantOid })
      .exec();

    if (!res.deletedCount) {
      throw new NotFoundException('Contact not found');
    }

    return { success: true };
  }

  async listCompanies(tenantId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.companyModel
      .find({ tenantId: tenantOid })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createCompany(tenantId: string, payload: Partial<CrmCompany>) {
    if (!payload.name) {
      throw new BadRequestException('Name is required');
    }
    return this.companyModel.create({
      tenantId: this.toObjectId(tenantId, 'tenantId'),
      name: String(payload.name).trim(),
      website: payload.website,
      industry: payload.industry,
    });
  }

  async listDeals(tenantId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.dealModel
      .aggregate([
        { $match: { tenantId: tenantOid } },
        {
          $lookup: {
            from: 'crmcontacts',
            let: { contactId: '$contactId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$contactId'] },
                      { $eq: ['$tenantId', tenantOid] },
                    ],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
            as: 'contact',
          },
        },
        {
          $lookup: {
            from: 'crmcompanies',
            let: { companyId: '$companyId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$companyId'] },
                      { $eq: ['$tenantId', tenantOid] },
                    ],
                  },
                },
              },
              { $project: { name: 1 } },
            ],
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
      ])
      .exec();
  }

  async getDealById(tenantId: string, id: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const dealId = this.toObjectId(id, 'dealId');

    const rows = await this.dealModel
      .aggregate([
        { $match: { tenantId: tenantOid, _id: dealId } },
        {
          $lookup: {
            from: 'crmcontacts',
            let: { contactId: '$contactId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$contactId'] },
                      { $eq: ['$tenantId', tenantOid] },
                    ],
                  },
                },
              },
              { $project: { name: 1, email: 1, phone: 1, companyName: 1 } },
            ],
            as: 'contact',
          },
        },
        {
          $lookup: {
            from: 'crmcompanies',
            let: { companyId: '$companyId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$companyId'] },
                      { $eq: ['$tenantId', tenantOid] },
                    ],
                  },
                },
              },
              { $project: { name: 1, website: 1, industry: 1 } },
            ],
            as: 'company',
          },
        },
        { $unwind: { path: '$contact', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        { $limit: 1 },
      ])
      .exec();

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Deal not found');
    }

    return row;
  }

  async createDeal(tenantId: string, payload: DealPayload) {
    if (!payload.title) {
      throw new BadRequestException('Title is required');
    }

    const tenantOid = this.toObjectId(tenantId, 'tenantId');

    const contactId =
      typeof payload.contactId === 'string'
        ? this.toOptionalObjectId(payload.contactId, 'contactId')
        : payload.contactId;

    const companyId =
      typeof payload.companyId === 'string'
        ? this.toOptionalObjectId(payload.companyId, 'companyId')
        : payload.companyId;

    const ownerId =
      typeof payload.ownerId === 'string'
        ? this.toOptionalObjectId(payload.ownerId, 'ownerId')
        : payload.ownerId;

    if (contactId) {
      await this.assertContactInTenant(tenantOid, contactId);
    }

    if (companyId) {
      await this.assertCompanyInTenant(tenantOid, companyId);
    }

    const deal = await this.dealModel.create({
      tenantId: tenantOid,
      title: String(payload.title).trim(),
      value: payload.value ?? 0,
      contactId,
      companyId,
      stage: payload.stage ?? 'NEW',
      ownerId,
      source: payload.source,
    });

    // Fire notification for new deal creation (best-effort)
    Promise.resolve(
      this.crmNotificationService.notifyDealCreated(
        tenantId,
        deal as unknown as CrmDeal,
      ),
    ).catch(() => undefined);

    return deal;
  }

  async createLeadFromPublicContactForm(
    tenantId: string,
    payload: PublicContactFormDto,
  ): Promise<{ contact: CrmContact; deal: CrmDeal }> {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const phone = payload.phone ? String(payload.phone).trim() : undefined;
    const message = String(payload.message || '').trim();

    if (!name) {
      throw new BadRequestException('name is required');
    }
    if (!email) {
      throw new BadRequestException('email is required');
    }
    if (!message) {
      throw new BadRequestException('message is required');
    }

    const source = payload.source || 'website';
    const sourceLabel = source === 'vcard' ? 'vcard_form' : 'website_form';

    const existing = await this.contactModel
      .findOne({ tenantId: tenantOid, email })
      .lean()
      .exec();

    const contact = existing
      ? (existing as unknown as CrmContact)
      : await this.createContact(tenantId, {
          name,
          email,
          phone,
          source: sourceLabel,
        });

    const snippet = message.length > 120 ? `${message.slice(0, 120)}…` : message;
    const title = `Inbound lead: ${name} - ${snippet}`;

    const deal = await this.createDeal(tenantId, {
      title,
      contactId: (contact as any)._id,
      stage: 'NEW',
      source: sourceLabel,
    });

    return { contact, deal };
  }

  async updateDeal(
    tenantId: string,
    id: string,
    patch: Record<string, unknown>,
  ) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const dealId = this.toObjectId(id, 'dealId');

    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};

    if (patch.title !== undefined) {
      const title = this.pickFirstString(patch.title);
      if (!title) throw new BadRequestException('title is invalid');
      set.title = title;
    }

    if (patch.value !== undefined) {
      const value = this.pickFirstNumber(patch.value);
      if (value === undefined || value < 0) {
        throw new BadRequestException('value is invalid');
      }
      set.value = value;
    }

    if (patch.source !== undefined) {
      const source = this.pickFirstString(patch.source);
      if (!source) unset.source = 1;
      else set.source = source;
    }

    if (patch.contactId !== undefined) {
      if (patch.contactId === null) {
        unset.contactId = 1;
      } else {
        const contactId = this.pickOptionalMongoId(patch.contactId, 'contactId');
        if (!contactId) throw new BadRequestException('contactId is invalid');
        await this.assertContactInTenant(tenantOid, contactId);
        set.contactId = contactId;
      }
    }

    if (patch.companyId !== undefined) {
      if (patch.companyId === null) {
        unset.companyId = 1;
      } else {
        const companyId = this.pickOptionalMongoId(patch.companyId, 'companyId');
        if (!companyId) throw new BadRequestException('companyId is invalid');
        await this.assertCompanyInTenant(tenantOid, companyId);
        set.companyId = companyId;
      }
    }

    if (patch.ownerId !== undefined) {
      if (patch.ownerId === null) {
        unset.ownerId = 1;
      } else {
        const ownerId = this.pickOptionalMongoId(patch.ownerId, 'ownerId');
        if (!ownerId) throw new BadRequestException('ownerId is invalid');
        set.ownerId = ownerId;
      }
    }

    if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;

    const updated = await this.dealModel
      .findOneAndUpdate({ _id: dealId, tenantId: tenantOid }, update, {
        new: true,
      })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Deal not found');
    }

    return updated;
  }

  async deleteDeal(tenantId: string, id: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const dealId = this.toObjectId(id, 'dealId');

    const res = await this.dealModel
      .deleteOne({ _id: dealId, tenantId: tenantOid })
      .exec();

    if (!res.deletedCount) {
      throw new NotFoundException('Deal not found');
    }

    return { success: true };
  }

  async updateDealStage(tenantId: string, id: string, stage: CrmDeal['stage']) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const dealId = this.toObjectId(id, 'id');

    const existing = await this.dealModel
      .findOne({ _id: dealId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    if (existing.stage === stage) {
      return existing;
    }

    const updated = await this.dealModel
      .findOneAndUpdate(
        { _id: dealId, tenantId: tenantObjectId },
        { stage },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Deal not found');
    }

    // Fire notification for stage change (best-effort)
    Promise.resolve(
      this.crmNotificationService.notifyDealStageChanged(
        tenantId,
        updated as unknown as CrmDeal,
        existing.stage,
      ),
    ).catch(() => undefined);

    return updated;
  }

  async listMyTasks(tenantId: string, userId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const userOid = this.toObjectId(userId, 'userId');

    return this.taskModel
      .aggregate([
        {
          $match: {
            tenantId: tenantOid,
            assigneeId: userOid,
          },
        },
        {
          $lookup: {
            from: 'crmdeals',
            let: { dealId: '$dealId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$dealId'] },
                      { $eq: ['$tenantId', tenantOid] },
                    ],
                  },
                },
              },
              { $project: { title: 1 } },
            ],
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
      ])
      .exec();
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

    const dueDate = payload.dueDate ? new Date(payload.dueDate) : undefined;
    if (payload.dueDate && Number.isNaN(dueDate?.getTime())) {
      throw new BadRequestException('dueDate is invalid');
    }

    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const dealObjectId = this.toOptionalObjectId(payload.dealId, 'dealId');
    if (dealObjectId) {
      await this.assertDealInTenant(tenantOid, dealObjectId);
    }

    const task = await this.taskModel.create({
      tenantId: tenantOid,
      title: String(payload.title).trim(),
      description: payload.description,
      assigneeId: this.toObjectId(payload.assigneeId, 'assigneeId'),
      dueDate,
      dealId: dealObjectId,
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
    Promise.resolve(
      this.crmNotificationService.notifyTaskAssigned(
        tenantId,
        task as unknown as CrmTask,
      ),
    ).catch(() => undefined);

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
          _id: this.toObjectId(id, 'id'),
          tenantId: this.toObjectId(tenantId, 'tenantId'),
          assigneeId: this.toObjectId(userId, 'userId'),
        },
        { completed },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Task not found');
    }

    // Fire notification when a task is marked as completed (best-effort)
    if (completed) {
      Promise.resolve(
        this.crmNotificationService.notifyTaskCompleted(
          tenantId,
          updated as unknown as CrmTask,
        ),
      ).catch(() => undefined);
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
        _id: this.toObjectId(id, 'id'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
        assigneeId: this.toObjectId(userId, 'userId'),
      })
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException('Task not found');
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
    const tenantOid = this.toObjectId(tenantId, 'tenantId');

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
