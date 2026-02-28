import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { HrmService } from './hrm.service';

describe('HrmService', () => {
  const makeFindChain = (rows: any[] = []) => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(rows),
    };
    return chain;
  };

  const makeModel = () => {
    return {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      findOne: jest.fn().mockReturnValue(makeFindChain([null])),
      findOneAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
      create: jest.fn(),
    };
  };

  async function createService(overrides?: {
    employeeModel?: any;
    attendanceModel?: any;
    leaveModel?: any;
    jobModel?: any;
    trainingModel?: any;
  }) {
    const employeeModel = overrides?.employeeModel ?? makeModel();
    const attendanceModel = overrides?.attendanceModel ?? makeModel();
    const leaveModel = overrides?.leaveModel ?? makeModel();
    const jobModel = overrides?.jobModel ?? makeModel();
    const trainingModel = overrides?.trainingModel ?? makeModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        HrmService,
        { provide: getModelToken('Employee'), useValue: employeeModel },
        { provide: getModelToken('Attendance'), useValue: attendanceModel },
        { provide: getModelToken('LeaveRequest'), useValue: leaveModel },
        { provide: getModelToken('JobPosting'), useValue: jobModel },
        { provide: getModelToken('TrainingSession'), useValue: trainingModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(HrmService),
      employeeModel,
      attendanceModel,
      leaveModel,
      jobModel,
      trainingModel,
    };
  }

  it('rejects invalid tenantId', async () => {
    const { service } = await createService();
    await expect(service.listEmployees('nope')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('recordAttendance rejects when employee is not in tenant', async () => {
    const employeeModel = makeModel();
    employeeModel.findOne = jest
      .fn()
      .mockReturnValue({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }) });

    const { service } = await createService({ employeeModel });

    await expect(
      service.recordAttendance('507f1f77bcf86cd799439011', {
        employeeId: '507f1f77bcf86cd799439012',
        status: 'present',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('createLeaveRequest rejects invalid date range', async () => {
    const employeeModel = makeModel();
    employeeModel.findOne = jest
      .fn()
      .mockReturnValue({ select: () => ({ lean: () => ({ exec: jest.fn().mockResolvedValue({ _id: 'x' }) }) }) });

    const { service } = await createService({ employeeModel });

    await expect(
      service.createLeaveRequest('507f1f77bcf86cd799439011', {
        employeeId: '507f1f77bcf86cd799439012',
        startDate: '2024-02-10',
        endDate: '2024-02-01',
        type: 'vacation',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createEmployee maps duplicate key to ConflictException', async () => {
    const employeeModel = makeModel();
    employeeModel.create = jest.fn().mockRejectedValue({ code: 11000 });
    const { service } = await createService({ employeeModel });

    await expect(
      service.createEmployee('507f1f77bcf86cd799439011', {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updateLeaveStatus throws NotFound when record missing', async () => {
    const leaveModel = makeModel();
    leaveModel.findOneAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { service } = await createService({ leaveModel });

    await expect(
      service.updateLeaveStatus(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439099',
        'approved',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
