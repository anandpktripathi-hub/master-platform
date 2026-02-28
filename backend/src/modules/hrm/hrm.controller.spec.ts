import { Test } from '@nestjs/testing';
import { HrmController } from './hrm.controller';
import { HrmService } from './hrm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

describe('HrmController', () => {
  let controller: HrmController;

  const hrmService = {
    getSummary: jest.fn().mockResolvedValue({}),
    getAttendanceOverview: jest.fn().mockResolvedValue({}),
    listEmployees: jest.fn().mockResolvedValue([]),
    getEmployeeById: jest.fn().mockResolvedValue({}),
    createEmployee: jest.fn().mockResolvedValue({}),
    updateEmployee: jest.fn().mockResolvedValue({}),
    deleteEmployee: jest.fn().mockResolvedValue({ success: true }),
    listAttendance: jest.fn().mockResolvedValue([]),
    recordAttendance: jest.fn().mockResolvedValue({}),
    listLeaveRequests: jest.fn().mockResolvedValue([]),
    createLeaveRequest: jest.fn().mockResolvedValue({}),
    updateLeaveStatus: jest.fn().mockResolvedValue({}),
    listJobPostings: jest.fn().mockResolvedValue([]),
    createJobPosting: jest.fn().mockResolvedValue({}),
    listTrainingSessions: jest.fn().mockResolvedValue([]),
    createTrainingSession: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HrmController],
      providers: [{ provide: HrmService, useValue: hrmService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(HrmController);
    jest.clearAllMocks();
  });

  it('passes tenantId to summary calls', async () => {
    await controller.getSummary('507f1f77bcf86cd799439011');
    await controller.getAttendanceOverview('507f1f77bcf86cd799439011');

    expect(hrmService.getSummary).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
    expect(hrmService.getAttendanceOverview).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });

  it('passes tenantId and body to createEmployee', async () => {
    await controller.createEmployee('507f1f77bcf86cd799439011', {
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
    });

    expect(hrmService.createEmployee).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
      },
    );
  });

  it('passes params through to employee get/update/delete', async () => {
    await controller.getEmployeeById(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );
    await controller.updateEmployee(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      { department: 'Sales' },
    );
    await controller.deleteEmployee(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );

    expect(hrmService.getEmployeeById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );
    expect(hrmService.updateEmployee).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      { department: 'Sales' },
    );
    expect(hrmService.deleteEmployee).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );
  });

  it('passes date query through to listAttendance', async () => {
    await controller.listAttendance('507f1f77bcf86cd799439011', {
      date: '2026-01-01',
    });

    expect(hrmService.listAttendance).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '2026-01-01',
    );
  });

  it('passes leave status update params', async () => {
    await controller.updateLeaveStatus(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439099',
      { status: 'approved' },
    );

    expect(hrmService.updateLeaveStatus).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439099',
      'approved',
    );
  });
});
