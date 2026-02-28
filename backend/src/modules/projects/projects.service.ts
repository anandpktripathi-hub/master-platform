import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Project,
  ProjectDocument,
} from '../../database/schemas/project.schema';
import { Task, TaskDocument } from '../../database/schemas/task.schema';
import {
  TimesheetEntry,
  TimesheetEntryDocument,
} from '../../database/schemas/timesheet.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(TimesheetEntry.name)
    private readonly timesheetModel: Model<TimesheetEntryDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private sanitizeUpdatePayload(
    payload: Record<string, unknown>,
    forbiddenKeys: string[],
  ): Record<string, unknown> {
    const forbidden = new Set(forbiddenKeys);
    return Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) => !forbidden.has(key) && value !== undefined,
      ),
    );
  }

  private async assertProjectInTenant(
    tenantObjectId: Types.ObjectId,
    projectObjectId: Types.ObjectId,
  ) {
    const exists = await this.projectModel
      .exists({ _id: projectObjectId, tenantId: tenantObjectId })
      .exec();
    if (!exists) {
      throw new NotFoundException('Project not found');
    }
  }

  private async assertTaskInTenantAndProject(
    tenantObjectId: Types.ObjectId,
    taskObjectId: Types.ObjectId,
    projectObjectId: Types.ObjectId,
  ) {
    const exists = await this.taskModel
      .exists({ _id: taskObjectId, tenantId: tenantObjectId, projectId: projectObjectId })
      .exec();
    if (!exists) {
      throw new NotFoundException('Task not found');
    }
  }

  // Projects
  async listProjects(tenantId: string): Promise<Project[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.projectModel
      .find({ tenantId: tenantObjectId })
      .lean()
      .exec();
  }

  async getProjectById(tenantId: string, id: string): Promise<Project> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const projectObjectId = this.toObjectId(id, 'projectId');

    const project = await this.projectModel
      .findOne({ _id: projectObjectId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async createProject(
    tenantId: string,
    payload: Partial<Project>,
  ): Promise<Project> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    if (typeof payload.name !== 'string' || payload.name.trim().length === 0) {
      throw new BadRequestException('name is required');
    }
    const doc = new this.projectModel({
      ...payload,
      tenantId: tenantObjectId,
    });
    return doc.save();
  }

  async updateProject(
    tenantId: string,
    id: string,
    payload: Partial<Project>,
  ): Promise<Project | null> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const projectObjectId = this.toObjectId(id, 'projectId');

    const safeUpdate = this.sanitizeUpdatePayload(
      payload as unknown as Record<string, unknown>,
      ['tenantId', '_id'],
    );

    return this.projectModel
      .findOneAndUpdate(
        { _id: projectObjectId, tenantId: tenantObjectId },
        { $set: safeUpdate },
        { new: true },
      )
      .exec();
  }

  async deleteProject(tenantId: string, id: string) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const projectObjectId = this.toObjectId(id, 'projectId');

    /**
     * v1 lifecycle strategy (Option B - simplest, avoids orphaned history):
     * Hard-delete a project and physically delete related Tasks and TimesheetEntries.
     *
     * Rationale: current schemas do not include an `archived` flag/status for projects/tasks/timesheets.
     * When we add a true archive/soft-delete field in v1.1, we can switch this to
     * a safer “archive project + close tasks + retain timesheets” behavior.
     */

    // Ensure we never delete cross-tenant data.
    await this.assertProjectInTenant(tenantObjectId, projectObjectId);

    // Delete children first so we don't leave orphaned tasks/timesheets.
    await this.timesheetModel
      .deleteMany({ tenantId: tenantObjectId, projectId: projectObjectId })
      .exec();
    await this.taskModel
      .deleteMany({ tenantId: tenantObjectId, projectId: projectObjectId })
      .exec();

    const res = await this.projectModel
      .deleteOne({ _id: projectObjectId, tenantId: tenantObjectId })
      .exec();

    if (!res.deletedCount) {
      throw new NotFoundException('Project not found');
    }
    return { success: true };
  }

  // Tasks
  async listTasks(tenantId: string, projectId: string): Promise<Task[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const projectObjectId = this.toObjectId(projectId, 'projectId');

    await this.assertProjectInTenant(tenantObjectId, projectObjectId);

    return this.taskModel
      .find({
        tenantId: tenantObjectId,
        projectId: projectObjectId,
      })
      .lean()
      .exec();
  }

  async createTask(
    tenantId: string,
    projectId: string,
    payload: Omit<Partial<Task>, 'assigneeId'> & {
      assigneeId?: string | Types.ObjectId;
    },
  ): Promise<Task> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const projectObjectId = this.toObjectId(projectId, 'projectId');

    await this.assertProjectInTenant(tenantObjectId, projectObjectId);

    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      throw new BadRequestException('title is required');
    }

    const assigneeId =
      typeof payload.assigneeId === 'string'
        ? this.toObjectId(payload.assigneeId, 'assigneeId')
        : payload.assigneeId;

    const doc = new this.taskModel({
      ...payload,
      assigneeId,
      tenantId: tenantObjectId,
      projectId: projectObjectId,
    });
    return doc.save();
  }

  async updateTask(
    tenantId: string,
    id: string,
    payload: Omit<Partial<Task>, 'assigneeId'> & {
      assigneeId?: string | Types.ObjectId;
    },
  ): Promise<Task | null> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const taskObjectId = this.toObjectId(id, 'taskId');

    const safeUpdate = this.sanitizeUpdatePayload(
      payload as unknown as Record<string, unknown>,
      ['tenantId', 'projectId', '_id'],
    );

    if (typeof safeUpdate.assigneeId === 'string') {
      safeUpdate.assigneeId = this.toObjectId(
        safeUpdate.assigneeId,
        'assigneeId',
      );
    }

    return this.taskModel
      .findOneAndUpdate(
        { _id: taskObjectId, tenantId: tenantObjectId },
        { $set: safeUpdate },
        { new: true },
      )
      .exec();
  }

  // Timesheets
  async listTimesheets(
    tenantId: string,
    projectId?: string,
  ): Promise<TimesheetEntry[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const filter: { tenantId: Types.ObjectId; projectId?: Types.ObjectId } = {
      tenantId: tenantObjectId,
    };
    if (projectId) {
      filter.projectId = this.toObjectId(projectId, 'projectId');
    }
    return this.timesheetModel.find(filter).sort({ date: -1 }).lean().exec();
  }

  async logTime(
    tenantId: string,
    payload: {
      taskId: string;
      projectId: string;
      userId: string;
      date?: string;
      hours: number;
    },
  ): Promise<TimesheetEntry> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    if (!payload.userId) {
      throw new BadRequestException('userId is required');
    }

    const date = payload.date ? new Date(payload.date) : new Date();
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    if (!Number.isFinite(payload.hours) || payload.hours < 0) {
      throw new BadRequestException('hours must be a non-negative number');
    }

    const projectObjectId = this.toObjectId(payload.projectId, 'projectId');
    const taskObjectId = this.toObjectId(payload.taskId, 'taskId');

    await this.assertProjectInTenant(tenantObjectId, projectObjectId);
    await this.assertTaskInTenantAndProject(tenantObjectId, taskObjectId, projectObjectId);

    const doc = new this.timesheetModel({
      taskId: taskObjectId,
      projectId: projectObjectId,
      userId: this.toObjectId(payload.userId, 'userId'),
      tenantId: tenantObjectId,
      hours: payload.hours,
      date,
    });
    return doc.save();
  }

  async getSummary(tenantId: string): Promise<{
    activeProjects: number;
    overdueTasks: number;
    hoursLogged: number;
  }> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    const [activeProjects, overdueTasks, hoursAgg] = await Promise.all([
      this.projectModel
        .countDocuments({
          tenantId: tenantObjectId,
          status: { $in: ['planned', 'in_progress'] },
        })
        .exec(),
      this.taskModel
        .countDocuments({ tenantId: tenantObjectId, status: { $ne: 'done' } })
        .exec(),
      this.timesheetModel
        .aggregate([
          { $match: { tenantId: tenantObjectId } },
          { $group: { _id: null, total: { $sum: '$hours' } } },
        ])
        .exec(),
    ]);

    const hoursLogged = hoursAgg[0]?.total || 0;

    return { activeProjects, overdueTasks, hoursLogged };
  }
}
