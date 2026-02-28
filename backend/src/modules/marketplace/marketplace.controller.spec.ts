import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;

  const marketplaceMock = {
    listAvailablePlugins: jest.fn(),
    installPlugin: jest.fn(),
    listTenantInstalls: jest.fn(),
    togglePlugin: jest.fn(),
    uninstallPlugin: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [{ provide: MarketplaceService, useValue: marketplaceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(MarketplaceController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('listAvailablePlugins delegates to service', async () => {
    marketplaceMock.listAvailablePlugins.mockResolvedValue([{ pluginId: 'p1' }]);

    const res = await controller.listAvailablePlugins();

    expect(marketplaceMock.listAvailablePlugins).toHaveBeenCalled();
    expect(res).toEqual([{ pluginId: 'p1' }]);
  });

  it('installPlugin uses tenant + user from auth/context', async () => {
    marketplaceMock.installPlugin.mockResolvedValue({ id: 'i1' });

    const res = await controller.installPlugin(
      {
        user: {
          sub: '507f1f77bcf86cd799439012',
          tenantId: '507f1f77bcf86cd799439011',
          role: 'owner',
        },
      } as any,
      '507f1f77bcf86cd799439011',
      { pluginId: 'p1', config: { k: 'v' } } as any,
    );

    expect(marketplaceMock.installPlugin).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      { pluginId: 'p1', config: { k: 'v' } },
    );
    expect(res).toEqual({ id: 'i1' });
  });

  it('rejects cross-tenant access for non-platform users', async () => {
    await expect(
      controller.listTenantInstalls(
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

  it('requires userId in auth context', async () => {
    await expect(
      controller.listTenantInstalls(
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
});
