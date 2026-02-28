import { RbacController } from './rbac.controller';

describe('RbacController', () => {
  let controller: RbacController;

  const rbacService = {
    getRoleById: jest.fn().mockResolvedValue({ permissions: [] }),
    getAllPermissions: jest.fn().mockResolvedValue([]),
    getPermissionsByModule: jest.fn().mockResolvedValue([]),
    createPermission: jest.fn().mockResolvedValue({ _id: 'p1' }),
    createRole: jest.fn().mockResolvedValue({ _id: 'r1' }),
    getRolesByTenant: jest.fn().mockResolvedValue([]),
    updateRole: jest.fn().mockResolvedValue({}),
    deleteRole: jest.fn().mockResolvedValue(undefined),
    createTenantUser: jest.fn().mockResolvedValue({}),
    getTenantUsers: jest.fn().mockResolvedValue({ items: [] }),
    updateTenantUser: jest.fn().mockResolvedValue({}),
    deleteTenantUser: jest.fn().mockResolvedValue(undefined),
    resetUserPassword: jest.fn().mockResolvedValue(undefined),
    toggleUserLogin: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(() => {
    controller = new RbacController(rbacService as any);
    jest.clearAllMocks();
  });

  it('checkFieldPermission calls service role lookup for tenant', async () => {
    const res = await controller.checkFieldPermission(
      { roleId: 'r1', module: 'm', action: 'read', field: 'f' } as any,
      't1',
    );

    expect(rbacService.getRoleById).toHaveBeenCalledWith('t1', 'r1');
    expect(res).toEqual({ allowed: false });
  });
});
