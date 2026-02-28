import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: { listOrders: jest.Mock; getPosOrderById: jest.Mock; getDomainOrderById: jest.Mock };

  beforeEach(async () => {
    ordersService = {
      listOrders: jest.fn().mockResolvedValue([]),
      getPosOrderById: jest.fn().mockResolvedValue({}),
      getDomainOrderById: jest.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OrdersController);
  });

  it('rejects tenant override for non-platform users', async () => {
    await expect(
      controller.listOrders(
        { user: { role: 'staff' } },
        '507f1f77bcf86cd799439011',
        { tenantId: '507f1f77bcf86cd799439012' } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(ordersService.listOrders).not.toHaveBeenCalled();
  });

  it('requires tenantId for non-platform users if context missing', async () => {
    await expect(
      controller.listOrders(
        { user: { role: 'tenant_admin' } },
        undefined,
        { limit: 10 } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(ordersService.listOrders).not.toHaveBeenCalled();
  });

  it('allows platform admin to specify tenantId', async () => {
    await controller.listOrders(
      { user: { role: 'PLATFORM_SUPER_ADMIN' } },
      undefined,
      { tenantId: '507f1f77bcf86cd799439011', source: 'pos', limit: 5 } as any,
    );

    expect(ordersService.listOrders).toHaveBeenCalledWith({
      tenantId: '507f1f77bcf86cd799439011',
      source: 'pos',
      limit: 5,
      from: undefined,
      to: undefined,
    });
  });

  it('scopes getPosOrder to effective tenantId', async () => {
    await controller.getPosOrder(
      { user: { role: 'owner' } },
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439099',
      undefined,
    );

    expect(ordersService.getPosOrderById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439099',
    );
  });
});
