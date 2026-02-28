import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { RbacService } from './rbac.service';
import { Permission } from '../../database/schemas/permission.schema';
import { Role } from '../../database/schemas/role.schema';
import { UserTenant } from '../../database/schemas/user-tenant.schema';
import { User } from '../../database/schemas/user.schema';

describe('RbacService', () => {
  let service: RbacService;

  const permissionModelMock: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };
  const roleModelMock: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    deleteOne: jest.fn(),
  };
  const userTenantModelMock: any = {
    countDocuments: jest.fn(),
    findOne: jest.fn(),
  };
  const userModelMock: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: getModelToken(Permission.name), useValue: permissionModelMock },
        { provide: getModelToken(Role.name), useValue: roleModelMock },
        { provide: getModelToken(UserTenant.name), useValue: userTenantModelMock },
        { provide: getModelToken(User.name), useValue: userModelMock },
      ],
    }).compile();

    service = module.get(RbacService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('createRole rejects invalid tenantId', async () => {
    await expect(
      service.createRole('bad', { name: 'X', permissionIds: ['bad'] } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createPermission rejects duplicates', async () => {
    permissionModelMock.findOne.mockResolvedValue({ _id: 'existing' });
    await expect(
      service.createPermission({ action: 'manage', module: 'User' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createRole rejects duplicate role name within tenant', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    roleModelMock.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(
      service.createRole(tenantId, {
        name: 'Admin',
        permissionIds: [new Types.ObjectId().toHexString()],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deleteRole rejects deleting role with users assigned', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const roleId = new Types.ObjectId().toHexString();

    roleModelMock.findOne.mockResolvedValue({
      _id: new Types.ObjectId(roleId),
      tenantId: new Types.ObjectId(tenantId),
      isSystem: false,
    });
    userTenantModelMock.countDocuments.mockResolvedValue(1);

    await expect(service.deleteRole(tenantId, roleId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
