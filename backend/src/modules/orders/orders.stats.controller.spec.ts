import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrdersStatsController } from './orders.stats.controller';
import { OrdersStatsService } from './services/orders-stats.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('OrdersStatsController', () => {
  let controller: OrdersStatsController;
  let statsService: { getDashboardStats: jest.Mock };

  beforeEach(async () => {
    statsService = {
      getDashboardStats: jest.fn().mockResolvedValue({ ok: true }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersStatsController],
      providers: [{ provide: OrdersStatsService, useValue: statsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OrdersStatsController);
  });

  it('rejects cross-tenant override for non-platform users', async () => {
    await expect(
      controller.getDashboardStats(
        { user: { role: 'tenant_admin' } },
        '507f1f77bcf86cd799439011',
        { tenantId: '507f1f77bcf86cd799439012' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(statsService.getDashboardStats).not.toHaveBeenCalled();
  });

  it('requires tenantId for non-platform users when context is missing', async () => {
    await expect(
      controller.getDashboardStats(
        { user: { role: 'staff' } },
        undefined,
        { from: '2024-01-01', to: '2024-02-01' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(statsService.getDashboardStats).not.toHaveBeenCalled();
  });

  it('uses context tenantId for non-platform users', async () => {
    await controller.getDashboardStats(
      { user: { role: 'owner' } },
      '507f1f77bcf86cd799439011',
      { from: '2024-01-01', to: '2024-02-01' } as any,
    );

    expect(statsService.getDashboardStats).toHaveBeenCalledWith({
      tenantId: '507f1f77bcf86cd799439011',
      from: '2024-01-01',
      to: '2024-02-01',
    });
  });

  it('allows platform admins to specify tenantId', async () => {
    await controller.getDashboardStats(
      { user: { role: 'PLATFORM_SUPER_ADMIN' } },
      undefined,
      { tenantId: '507f1f77bcf86cd799439011' } as any,
    );

    expect(statsService.getDashboardStats).toHaveBeenCalledWith({
      tenantId: '507f1f77bcf86cd799439011',
      from: undefined,
      to: undefined,
    });
  });
});
