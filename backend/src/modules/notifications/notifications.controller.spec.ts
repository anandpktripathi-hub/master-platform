import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
    userId?: string;
    tenantId?: string;
  };
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const notificationsService = {
    listForUser: jest.fn().mockResolvedValue([]),
    markAllRead: jest.fn().mockResolvedValue(3),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: notificationsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(NotificationsController);
    jest.clearAllMocks();
  });

  it('getMyNotifications rejects when tenantId missing', async () => {
    await expect(
      controller.getMyNotifications(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        undefined as unknown as string,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(notificationsService.listForUser).not.toHaveBeenCalled();
  });

  it('getMyNotifications rejects when userId missing', async () => {
    await expect(
      controller.getMyNotifications(
        { user: { tenantId: 't1' } } as unknown as AuthRequest,
        't1',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(notificationsService.listForUser).not.toHaveBeenCalled();
  });

  it('getMyNotifications forwards tenantId + userId', async () => {
    await controller.getMyNotifications(
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      't1',
    );

    expect(notificationsService.listForUser).toHaveBeenCalledWith('t1', 'u1');
  });

  it('markAllRead forwards tenantId + userId and wraps response', async () => {
    const res = await controller.markAllRead(
      { user: { _id: 'u1' } } as unknown as AuthRequest,
      't1',
    );

    expect(notificationsService.markAllRead).toHaveBeenCalledWith('t1', 'u1');
    expect(res).toEqual({ updated: 3 });
  });
});
