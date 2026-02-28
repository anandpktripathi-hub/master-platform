import { Test } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

describe('TenantsController', () => {
  let controller: TenantsController;
  let handlers: {
    listTenants: (query: {
      page?: number;
      limit?: number;
      q?: string;
    }) => Promise<unknown>;
    createTenant: (
      dto: { name: string; planKey?: 'FREE' | 'PRO' | 'ENTERPRISE' },
      req: { user?: { sub?: string; _id?: unknown } },
    ) => Promise<unknown>;
  };

  const tenantsService = {
    listTenants: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    createTenant: jest.fn().mockResolvedValue({ _id: 't1' }),
    getCurrentTenant: jest.fn(),
    getPublicBusinessBySlug: jest.fn(),
    listPublicBusinesses: jest.fn(),
    updateTenantPublicProfile: jest.fn(),
    listBusinessReviews: jest.fn(),
    addBusinessReview: jest.fn(),
    manualCreateTenant: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [{ provide: TenantsService, useValue: tenantsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get<TenantsController>(TenantsController);
    handlers = controller as unknown as typeof handlers;
    jest.clearAllMocks();
  });

  it('listTenants calls service with query dto', async () => {
    await handlers.listTenants({ page: 1, limit: 20, q: 'acme' });

    expect(tenantsService.listTenants).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      q: 'acme',
    });
  });

  it('createTenant passes adminId and defaults planKey', async () => {
    const adminId = '507f1f77bcf86cd799439012';

    await handlers.createTenant({ name: 'Acme' }, { user: { sub: adminId } });

    expect(tenantsService.createTenant).toHaveBeenCalledWith(
      'Acme',
      expect.any(Object),
      'FREE',
    );
  });
});
