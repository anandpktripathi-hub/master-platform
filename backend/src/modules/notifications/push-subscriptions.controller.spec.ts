import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import {
  SubscribePushSubscriptionDto,
  UnsubscribePushSubscriptionDto,
} from './dto/push-subscription.dto';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
};

describe('PushSubscriptionsController', () => {
  let controller: PushSubscriptionsController;

  const pushSubscriptionsService = {
    saveOrUpdateForUser: jest.fn().mockResolvedValue({ endpoint: 'e1' }),
    removeByEndpoint: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PushSubscriptionsController],
      providers: [
        { provide: PushSubscriptionsService, useValue: pushSubscriptionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(PushSubscriptionsController);
    jest.clearAllMocks();
  });

  it('subscribe rejects when tenantId missing', async () => {
    const dto = Object.assign(new SubscribePushSubscriptionDto(), {
      endpoint: 'e1',
      keys: { p256dh: 'p', auth: 'a' },
    });

    await expect(
      controller.subscribe(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        undefined as unknown as string,
        dto,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(pushSubscriptionsService.saveOrUpdateForUser).not.toHaveBeenCalled();
  });

  it('subscribe rejects when userId missing', async () => {
    const dto = Object.assign(new SubscribePushSubscriptionDto(), {
      endpoint: 'e1',
      keys: { p256dh: 'p', auth: 'a' },
    });

    await expect(
      controller.subscribe(
        { user: {} } as unknown as AuthRequest,
        't1',
        dto,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(pushSubscriptionsService.saveOrUpdateForUser).not.toHaveBeenCalled();
  });

  it('subscribe forwards tenantId + userId + payload', async () => {
    const dto = Object.assign(new SubscribePushSubscriptionDto(), {
      endpoint: 'e1',
      keys: { p256dh: 'p', auth: 'a' },
    });

    const res = await controller.subscribe(
      { user: { _id: 'u1' } } as unknown as AuthRequest,
      't1',
      dto,
    );

    expect(pushSubscriptionsService.saveOrUpdateForUser).toHaveBeenCalledWith(
      't1',
      'u1',
      dto,
    );
    expect(res).toEqual({ success: true, subscription: { endpoint: 'e1' } });
  });

  it('unsubscribe rejects when endpoint missing', async () => {
    const dto = Object.assign(new UnsubscribePushSubscriptionDto(), {
      endpoint: '',
    });

    await expect(
      controller.unsubscribe(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        undefined as unknown as string,
        dto,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      controller.unsubscribe(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        't1',
        dto,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(pushSubscriptionsService.removeByEndpoint).not.toHaveBeenCalled();
  });

  it('unsubscribe rejects when userId missing', async () => {
    const dto = Object.assign(new UnsubscribePushSubscriptionDto(), {
      endpoint: 'e1',
    });

    await expect(
      controller.unsubscribe(
        { user: {} } as unknown as AuthRequest,
        't1',
        dto,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(pushSubscriptionsService.removeByEndpoint).not.toHaveBeenCalled();
  });

  it('unsubscribe forwards tenantId + endpoint + userId', async () => {
    const dto = Object.assign(new UnsubscribePushSubscriptionDto(), {
      endpoint: 'e1',
    });

    await controller.unsubscribe(
      { user: { sub: 'u1' } } as unknown as AuthRequest,
      't1',
      dto,
    );

    expect(pushSubscriptionsService.removeByEndpoint).toHaveBeenCalledWith(
      't1',
      'e1',
      'u1',
    );
  });
});
