import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';

type ExecMock<T> = { exec: jest.Mock<Promise<T>, []> };
type LeanExecMock<T> = { lean: jest.Mock<ExecMock<T>, []> };
type FindByIdMock<T> = { findById: jest.Mock<LeanExecMock<T>, [string]> };
type FindMock<T> = { find: jest.Mock<LeanExecMock<T>, [any]> };

describe('WorkspaceService', () => {
  const createService = async (overrides?: {
    userFindByIdResult?: any;
    tenantsFindResult?: any[];
  }) => {
    const userExec = {
      exec: jest.fn().mockResolvedValue(overrides?.userFindByIdResult ?? null),
    } satisfies ExecMock<any>;
    const userLean = {
      lean: jest.fn().mockReturnValue(userExec),
    } satisfies LeanExecMock<any>;
    const userModel = {
      findById: jest.fn().mockReturnValue(userLean),
    } satisfies FindByIdMock<any>;

    const tenantExec = {
      exec: jest
        .fn()
        .mockResolvedValue(overrides?.tenantsFindResult ?? ([] as any[])),
    } satisfies ExecMock<any[]>;
    const tenantLean = {
      lean: jest.fn().mockReturnValue(tenantExec),
    } satisfies LeanExecMock<any[]>;
    const tenantModel = {
      find: jest.fn().mockReturnValue(tenantLean),
    } satisfies FindMock<any[]>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: getModelToken('Tenant'), useValue: tenantModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(WorkspaceService),
      mocks: { userModel, tenantModel },
    };
  };

  it('throws NotFoundException when user does not exist', async () => {
    const { service } = await createService({ userFindByIdResult: null });
    await expect(service.getWorkspacesForUser('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns workspaces for platform admin by listing all tenants', async () => {
    const { service, mocks } = await createService({
      userFindByIdResult: {
        _id: '507f1f77bcf86cd799439011',
        role: 'PLATFORM_SUPER_ADMIN',
      },
      tenantsFindResult: [
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'T1',
          slug: 't1',
          planKey: 'FREE',
          status: 'active',
          isActive: true,
        },
      ],
    });

    const result = await service.getWorkspacesForUser('u1');

    expect(mocks.tenantModel.find).toHaveBeenCalledWith({});
    expect(result).toEqual([
      {
        id: '507f1f77bcf86cd799439012',
        name: 'T1',
        slug: 't1',
        planKey: 'FREE',
        status: 'active',
        isActive: true,
        isCurrent: false,
      },
    ]);
  });

  it('throws ForbiddenException when switching to a workspace not in list', async () => {
    const { service } = await createService({
      userFindByIdResult: {
        _id: '507f1f77bcf86cd799439011',
        role: 'tenant_admin',
      },
      tenantsFindResult: [],
    });

    await expect(
      service.switchWorkspace('u1', '507f1f77bcf86cd799439012'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
