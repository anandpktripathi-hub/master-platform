import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantsService } from './tenants.service';
import { Tenant } from '../../database/schemas/tenant.schema';
import { User } from '../../database/schemas/user.schema';
import { BusinessReview } from '../../database/schemas/business-review.schema';

describe('TenantsService', () => {
  let service: TenantsService;

  const tenantModelMock: any = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  };

  const userModelMock: any = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const reviewModelMock: any = {
    create: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: getModelToken(Tenant.name), useValue: tenantModelMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: getModelToken(BusinessReview.name), useValue: reviewModelMock },
      ],
    }).compile();

    service = module.get(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getTenantBillingEmail returns null for invalid tenantId', async () => {
    const res = await service.getTenantBillingEmail('not-an-objectid');
    expect(res).toBeNull();
    expect(tenantModelMock.findById).not.toHaveBeenCalled();
  });

  it('updateTenantPublicProfile rejects invalid tenantId', async () => {
    await expect(
      service.updateTenantPublicProfile('bad', { publicName: 'Acme' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('addBusinessReview rejects invalid ids', async () => {
    await expect(
      service.addBusinessReview('bad', 'also-bad', 5, 'nice'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('addBusinessReview creates review and updates tenant aggregates', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const userId = new Types.ObjectId().toHexString();

    reviewModelMock.create.mockResolvedValue({});
    reviewModelMock.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ avgRating: 4.5, reviewCount: 2 }]),
    });
    tenantModelMock.updateOne.mockResolvedValue({ acknowledged: true });

    await service.addBusinessReview(tenantId, userId, 5, 'great');

    expect(reviewModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(userId),
        rating: 5,
        comment: 'great',
        status: 'PUBLISHED',
      }),
    );

    expect(tenantModelMock.updateOne).toHaveBeenCalledWith(
      { _id: new Types.ObjectId(tenantId) },
      { $set: { avgRating: 4.5, reviewCount: 2 } },
    );
  });

  it('listPublicBusinesses escapes q for RegExp search', async () => {
    tenantModelMock.find.mockImplementation((query: any) => {
      const or = query.$or as Array<Record<string, RegExp>>;
      expect(or).toHaveLength(4);
      const nameRe = or[0].name;
      expect(nameRe).toBeInstanceOf(RegExp);
      expect(nameRe.source).toContain('a\\+b');
      return {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
    });

    const res = await service.listPublicBusinesses({ q: 'a+b' });
    expect(res).toEqual([]);
  });

  it('listPublicBusinesses rejects overly long q', async () => {
    await expect(
      service.listPublicBusinesses({ q: 'x'.repeat(101) }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
