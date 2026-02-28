import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuditLogService } from '../../services/audit-log.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('DashboardController', () => {
  let controller: DashboardController;

  const dashboardService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const auditLogService = {
    getTenantLogs: jest.fn(),
    getTenantLogsForExport: jest.fn(),
  };

  const analyticsService = {
    getSaasOverview: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(DashboardController);
    jest.clearAllMocks();
  });

  it('delegates findAll with tenantId', async () => {
    dashboardService.findAll.mockResolvedValue([]);

    await controller.findAll('t1');

    expect(dashboardService.findAll).toHaveBeenCalledWith('t1');
  });

  it('delegates remove with tenantId', async () => {
    dashboardService.remove.mockResolvedValue({ ok: true });

    await controller.remove('d1', 't1');

    expect(dashboardService.remove).toHaveBeenCalledWith('d1', 't1');
  });

  it('delegates saas overview', async () => {
    analyticsService.getSaasOverview.mockResolvedValue({ ok: true });

    await expect(controller.getSaasOverview()).resolves.toEqual({ ok: true });
    expect(analyticsService.getSaasOverview).toHaveBeenCalledTimes(1);
  });
});
