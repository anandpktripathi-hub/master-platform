import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Employee,
  EmployeeDocument,
} from '../../database/schemas/employee.schema';
import {
  Attendance,
  AttendanceDocument,
} from '../../database/schemas/attendance.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from '../../database/schemas/leave-request.schema';
import {
  JobPosting,
  JobPostingDocument,
} from '../../database/schemas/job-posting.schema';
import {
  TrainingSession,
  TrainingSessionDocument,
} from '../../database/schemas/training-session.schema';
import {
  CreateEmployeeDto,
  CreateJobPostingDto,
  CreateLeaveRequestDto,
  CreateTrainingSessionDto,
  RecordAttendanceDto,
  UpdateEmployeeDto,
} from './dto/hrm.dto';

@Injectable()
export class HrmService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(LeaveRequest.name)
    private readonly leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(JobPosting.name)
    private readonly jobPostingModel: Model<JobPostingDocument>,
    @InjectModel(TrainingSession.name)
    private readonly trainingModel: Model<TrainingSessionDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private parseDate(value: string, fieldName: string): Date {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return d;
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

  private async assertEmployeeInTenant(
    tenantObjectId: Types.ObjectId,
    employeeId: string,
  ): Promise<Types.ObjectId> {
    const employeeObjectId = this.toObjectId(employeeId, 'employeeId');
    const exists = await this.employeeModel
      .findOne({ _id: employeeObjectId, tenantId: tenantObjectId })
      .select({ _id: 1 })
      .lean()
      .exec();
    if (!exists) {
      throw new NotFoundException('Employee not found');
    }
    return employeeObjectId;
  }

  // Employees
  async listEmployees(tenantId: string): Promise<Employee[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.employeeModel
      .find({ tenantId: tenantObjectId })
      .lean()
      .exec();
  }

  async getEmployeeById(tenantId: string, id: string): Promise<Employee> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const employeeObjectId = this.toObjectId(id, 'employeeId');

    const employee = await this.employeeModel
      .findOne({ _id: employeeObjectId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async createEmployee(
    tenantId: string,
    payload: CreateEmployeeDto,
  ): Promise<Employee> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    try {
      return await this.employeeModel.create({
        ...payload,
        tenantId: tenantObjectId,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Employee email already exists');
      }
      throw err;
    }
  }

  async updateEmployee(
    tenantId: string,
    id: string,
    payload: UpdateEmployeeDto,
  ): Promise<Employee> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const employeeObjectId = this.toObjectId(id, 'employeeId');

    const safeUpdate = this.sanitizeUpdatePayload(
      payload as unknown as Record<string, unknown>,
      ['tenantId', '_id'],
    );

    if (Object.keys(safeUpdate).length === 0) {
      return this.getEmployeeById(tenantId, id);
    }

    try {
      const updated = await this.employeeModel
        .findOneAndUpdate(
          { _id: employeeObjectId, tenantId: tenantObjectId },
          { $set: safeUpdate },
          { new: true },
        )
        .lean()
        .exec();

      if (!updated) {
        throw new NotFoundException('Employee not found');
      }

      return updated;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Employee email already exists');
      }
      throw err;
    }
  }

  async deleteEmployee(tenantId: string, id: string): Promise<{ success: true }> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const employeeObjectId = this.toObjectId(id, 'employeeId');

    const res = await this.employeeModel
      .deleteOne({ _id: employeeObjectId, tenantId: tenantObjectId })
      .exec();

    if (!res.deletedCount) {
      throw new NotFoundException('Employee not found');
    }

    return { success: true };
  }

  // Attendance
  async listAttendance(tenantId: string, date?: string): Promise<Attendance[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const filter: any = { tenantId: tenantObjectId };
    if (date) {
      const d = this.parseDate(date, 'date');
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    return this.attendanceModel.find(filter).lean().exec();
  }

  async recordAttendance(
    tenantId: string,
    payload: RecordAttendanceDto,
  ): Promise<Attendance> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const employeeObjectId = await this.assertEmployeeInTenant(
      tenantObjectId,
      payload.employeeId,
    );
    const date = payload.date ? this.parseDate(payload.date, 'date') : new Date();
    try {
      return await this.attendanceModel.create({
        employeeId: employeeObjectId,
        tenantId: tenantObjectId,
        status: payload.status,
        date,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Attendance already recorded for this day');
      }
      throw err;
    }
  }

  // Leave requests
  async listLeaveRequests(tenantId: string): Promise<LeaveRequest[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.leaveRequestModel
      .find({ tenantId: tenantObjectId })
      .lean()
      .exec();
  }

  async createLeaveRequest(
    tenantId: string,
    payload: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const employeeObjectId = await this.assertEmployeeInTenant(
      tenantObjectId,
      payload.employeeId,
    );
    const startDate = this.parseDate(payload.startDate, 'startDate');
    const endDate = this.parseDate(payload.endDate, 'endDate');
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('Invalid date range');
    }

    return this.leaveRequestModel.create({
      employeeId: employeeObjectId,
      tenantId: tenantObjectId,
      startDate,
      endDate,
      type: payload.type,
      reason: payload.reason,
    });
  }

  async updateLeaveStatus(
    tenantId: string,
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<LeaveRequest | null> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const leaveId = this.toObjectId(id, 'id');
    const updated = await this.leaveRequestModel
      .findOneAndUpdate(
        { _id: leaveId, tenantId: tenantObjectId },
        { $set: { status } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Leave request not found');
    }

    return updated;
  }

  // Job postings
  async listJobPostings(tenantId: string): Promise<JobPosting[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.jobPostingModel
      .find({ tenantId: tenantObjectId })
      .lean()
      .exec();
  }

  async createJobPosting(
    tenantId: string,
    payload: CreateJobPostingDto,
  ): Promise<JobPosting> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.jobPostingModel.create({
      ...payload,
      tenantId: tenantObjectId,
    });
  }

  // Training sessions
  async listTrainingSessions(tenantId: string): Promise<TrainingSession[]> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.trainingModel
      .find({ tenantId: tenantObjectId })
      .lean()
      .exec();
  }

  async createTrainingSession(
    tenantId: string,
    payload: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const startDate = this.parseDate(payload.startDate, 'startDate');
    const endDate = this.parseDate(payload.endDate, 'endDate');
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('Invalid date range');
    }
    return this.trainingModel.create({
      ...payload,
      startDate,
      endDate,
      tenantId: tenantObjectId,
    });
  }

  async getSummary(tenantId: string): Promise<{
    activeEmployees: number;
    todayPresent: number;
    openJobs: number;
    upcomingTrainings: number;
  }> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    const [activeEmployees, todayAttendance, openJobs, upcomingTrainings] =
      await Promise.all([
        this.employeeModel
          .countDocuments({ tenantId: tenantObjectId, status: 'active' })
          .exec(),
        this.listAttendance(tenantId, new Date().toISOString()),
        this.jobPostingModel
          .countDocuments({ tenantId: tenantObjectId, status: 'open' })
          .exec(),
        this.trainingModel
          .countDocuments({
            tenantId: tenantObjectId,
            startDate: { $gte: new Date() },
          })
          .exec(),
      ]);

    const todayPresent = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'remote',
    ).length;

    return {
      activeEmployees,
      todayPresent,
      openJobs,
      upcomingTrainings,
    };
  }

  async getAttendanceOverview(tenantId: string): Promise<{
    totalEmployees: number;
    last30Days: {
      date: string;
      present: number;
      remote: number;
      onLeave: number;
      absent: number;
    }[];
  }> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalEmployees, dailyAgg] = await Promise.all([
      this.employeeModel
        .countDocuments({ tenantId: tenantObjectId, status: 'active' })
        .exec(),
      this.attendanceModel
        .aggregate([
          {
            $match: {
              tenantId: tenantObjectId,
              date: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' },
                status: '$status',
              },
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
    ]);

    const map = new Map<
      string,
      { present: number; remote: number; onLeave: number; absent: number }
    >();

    for (const row of dailyAgg) {
      const year: number = row._id.year;
      const month: number = row._id.month;
      const day: number = row._id.day;
      const status: string = row._id.status;
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (!map.has(key)) {
        map.set(key, { present: 0, remote: 0, onLeave: 0, absent: 0 });
      }
      const entry = map.get(key)!;
      if (status === 'present') entry.present += row.count || 0;
      if (status === 'remote') entry.remote += row.count || 0;
      if (status === 'on_leave') entry.onLeave += row.count || 0;
      if (status === 'absent') entry.absent += row.count || 0;
    }

    const last30Days: {
      date: string;
      present: number;
      remote: number;
      onLeave: number;
      absent: number;
    }[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = map.get(key) || {
        present: 0,
        remote: 0,
        onLeave: 0,
        absent: 0,
      };
      last30Days.push({ date: key, ...entry });
    }

    return { totalEmployees, last30Days };
  }
}
