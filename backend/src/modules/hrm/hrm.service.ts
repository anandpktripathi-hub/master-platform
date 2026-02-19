import { Injectable } from '@nestjs/common';
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

  // Employees
  async listEmployees(tenantId: string): Promise<Employee[]> {
    return this.employeeModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }

  async createEmployee(
    tenantId: string,
    payload: Partial<Employee>,
  ): Promise<Employee> {
    const doc = new this.employeeModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  // Attendance
  async listAttendance(tenantId: string, date?: string): Promise<Attendance[]> {
    const filter: any = { tenantId: new Types.ObjectId(tenantId) };
    if (date) {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    return this.attendanceModel.find(filter).lean().exec();
  }

  async recordAttendance(
    tenantId: string,
    payload: {
      employeeId: string;
      status: 'present' | 'absent' | 'remote' | 'on_leave';
      date?: string;
    },
  ): Promise<Attendance> {
    const date = payload.date ? new Date(payload.date) : new Date();
    const doc = new this.attendanceModel({
      employeeId: new Types.ObjectId(payload.employeeId),
      tenantId: new Types.ObjectId(tenantId),
      status: payload.status,
      date,
    });
    return doc.save();
  }

  // Leave requests
  async listLeaveRequests(tenantId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }

  async createLeaveRequest(
    tenantId: string,
    payload: Partial<LeaveRequest>,
  ): Promise<LeaveRequest> {
    const doc = new this.leaveRequestModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async updateLeaveStatus(
    tenantId: string,
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<LeaveRequest | null> {
    return this.leaveRequestModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: { status } },
        { new: true },
      )
      .exec();
  }

  // Job postings
  async listJobPostings(tenantId: string): Promise<JobPosting[]> {
    return this.jobPostingModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }

  async createJobPosting(
    tenantId: string,
    payload: Partial<JobPosting>,
  ): Promise<JobPosting> {
    const doc = new this.jobPostingModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  // Training sessions
  async listTrainingSessions(tenantId: string): Promise<TrainingSession[]> {
    return this.trainingModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }

  async createTrainingSession(
    tenantId: string,
    payload: Partial<TrainingSession>,
  ): Promise<TrainingSession> {
    const doc = new this.trainingModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async getSummary(tenantId: string): Promise<{
    activeEmployees: number;
    todayPresent: number;
    openJobs: number;
    upcomingTrainings: number;
  }> {
    const tenantObjectId = new Types.ObjectId(tenantId);

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
    const tenantObjectId = new Types.ObjectId(tenantId);
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
