import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DeveloperPortalController } from './developer-portal.controller';
import { DeveloperPortalService } from './developer-portal.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('DeveloperPortalController', () => {
  let controller: DeveloperPortalController;

  const devPortalMock = {
    createApiKey: jest.fn(),
    listApiKeys: jest.fn(),
    revokeApiKey: jest.fn(),
    deleteApiKey: jest.fn(),
    listWebhookDeliveryLogs: jest.fn(),
    getWebhookDeliveryLog: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DeveloperPortalController],
      providers: [{ provide: DeveloperPortalService, useValue: devPortalMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(DeveloperPortalController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('createApiKey uses tenant + user from auth/context', async () => {
    devPortalMock.createApiKey.mockResolvedValue({ id: 'k1' });

    await controller.createApiKey(
      {
        user: {
          sub: '507f1f77bcf86cd799439012',
          tenantId: '507f1f77bcf86cd799439011',
          role: 'owner',
        },
      } as any,
      '507f1f77bcf86cd799439011',
      {
        name: 'My Key',
        scopes: ['read:orders'],
        expiresAt: '2026-01-01T00:00:00.000Z',
      } as any,
    );

    expect(devPortalMock.createApiKey).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      expect.objectContaining({
        name: 'My Key',
        scopes: ['read:orders'],
        expiresAt: expect.any(Date),
      }),
    );
  });

  it('rejects cross-tenant access for non-platform users', async () => {
    await expect(
      controller.listApiKeys(
        {
          user: {
            tenantId: '507f1f77bcf86cd799439011',
            role: 'staff',
            sub: '507f1f77bcf86cd799439012',
          },
        } as any,
        '507f1f77bcf86cd799439099',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires a userId in auth context', async () => {
    await expect(
      controller.listApiKeys(
        {
          user: {
            tenantId: '507f1f77bcf86cd799439011',
            role: 'owner',
          },
        } as any,
        '507f1f77bcf86cd799439011',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('listWebhookLogs passes query filters through', async () => {
    devPortalMock.listWebhookDeliveryLogs.mockResolvedValue({ data: [], total: 0 });

    await controller.listWebhookLogs(
      {
        user: {
          sub: '507f1f77bcf86cd799439012',
          tenantId: '507f1f77bcf86cd799439011',
          role: 'staff',
        },
      } as any,
      '507f1f77bcf86cd799439011',
      {
        limit: 10,
        skip: 5,
        event: 'invoice.paid',
        status: 'success',
      } as any,
    );

    expect(devPortalMock.listWebhookDeliveryLogs).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      {
        limit: 10,
        skip: 5,
        event: 'invoice.paid',
        status: 'success',
      },
    );
  });
});
