import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProfileService } from './profile.service';
import { User } from '../../database/schemas/user.schema';
import { Tenant } from '../../database/schemas/tenant.schema';
import { PublicUserProfile } from '../../database/schemas/public-user-profile.schema';

describe('ProfileService', () => {
  let service: ProfileService;

  const userModelMock: any = {
    findById: jest.fn(),
  };
  const tenantModelMock: any = {
    findById: jest.fn(),
  };
  const publicProfileModelMock: any = {
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: getModelToken(Tenant.name), useValue: tenantModelMock },
        { provide: getModelToken(PublicUserProfile.name), useValue: publicProfileModelMock },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid userId for public profile operations', async () => {
    await expect(service.getOrCreatePublicProfile('not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('isHandleAvailable returns false when handle exists', async () => {
    publicProfileModelMock.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), handle: 'foo' }),
    });

    const available = await service.isHandleAvailable('foo');
    expect(available).toBe(false);
  });

  it('isHandleAvailable normalizes handle (trim + lowercase)', async () => {
    publicProfileModelMock.findOne.mockImplementation((query: any) => {
      expect(query).toEqual({ handle: 'foo' });
      return { lean: jest.fn().mockResolvedValue(null) };
    });

    const available = await service.isHandleAvailable('  FOO  ');
    expect(available).toBe(true);
  });

  it('isHandleAvailable rejects invalid handle characters', async () => {
    await expect(service.isHandleAvailable('bad handle')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
