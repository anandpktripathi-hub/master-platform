import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';

describe('OnboardingController', () => {
  let controller: OnboardingController;
  const onboardingService = {
    seedSampleData: jest.fn().mockResolvedValue({ created: true }),
    getSampleStatus: jest.fn().mockResolvedValue({ crmSample: false }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [{ provide: OnboardingService, useValue: onboardingService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(OnboardingController);
    jest.clearAllMocks();
  });

  it('seedSample rejects when user missing', async () => {
    await expect(controller.seedSample({} as any, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('seedSample rejects when tenantId missing (prevents String(undefined) bug)', async () => {
    await expect(
      controller.seedSample(
        { user: { sub: '507f1f77bcf86cd799439012' } } as any,
        undefined,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(onboardingService.seedSampleData).not.toHaveBeenCalled();
  });

  it('seedSample passes tenantId and userId', async () => {
    await controller.seedSample(
      {
        user: {
          tenantId: '507f1f77bcf86cd799439011',
          sub: '507f1f77bcf86cd799439012',
        },
      } as any,
      undefined,
    );

    expect(onboardingService.seedSampleData).toHaveBeenCalledWith({
      tenantId: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439012',
    });
  });

  it('getSampleStatus rejects when tenantId missing', async () => {
    await expect(
      controller.getSampleStatus({ user: { sub: 'x' } } as any, undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('seedSample rejects when non-platform tries cross-tenant', async () => {
    await expect(
      controller.seedSample(
        {
          user: {
            role: 'TENANT_ADMIN',
            tenantId: '507f1f77bcf86cd799439011',
            sub: '507f1f77bcf86cd799439012',
          },
        } as any,
        '507f1f77bcf86cd799439099',
      ),
    ).rejects.toThrow('Cross-tenant access denied');

    expect(onboardingService.seedSampleData).not.toHaveBeenCalled();
  });
});
