import { Injectable } from '@nestjs/common';
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

  // Projects
  async listProjects(tenantId: string): Promise<Project[]> {
    return this.projectModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }

  async createProject(
    tenantId: string,
    payload: Partial<Project>,
  ): Promise<Project> {
    const doc = new this.projectModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async updateProject(
    tenantId: string,
    id: string,
    payload: Partial<Project>,
  ): Promise<Project | null> {
    return this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  // Tasks
  async listTasks(tenantId: string, projectId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        projectId: new Types.ObjectId(projectId),
      })
      .lean()
      .exec();
  }

  async createTask(
    tenantId: string,
    projectId: string,
    payload: Partial<Task>,
  ): Promise<Task> {
    const doc = new this.taskModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
      projectId: new Types.ObjectId(projectId),
    });
    return doc.save();
  }

  async updateTask(
    tenantId: string,
    id: string,
    payload: Partial<Task>,
  ): Promise<Task | null> {
    return this.taskModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  // Timesheets
  async listTimesheets(
    tenantId: string,
    projectId?: string,
  ): Promise<TimesheetEntry[]> {
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (projectId) {
      filter.projectId = new Types.ObjectId(projectId);
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
    const date = payload.date ? new Date(payload.date) : new Date();
    const doc = new this.timesheetModel({
      taskId: new Types.ObjectId(payload.taskId),
      projectId: new Types.ObjectId(payload.projectId),
      userId: new Types.ObjectId(payload.userId),
      tenantId: new Types.ObjectId(tenantId),
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
    const tenantObjectId = new Types.ObjectId(tenantId);

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
