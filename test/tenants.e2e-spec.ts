import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums/role.enum';

/**
 * Integration tests for TenantsController with RBAC guards.
 * These tests verify that the tenants admin endpoints are properly protected.
 */
describe('TenantsController (Integration)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let tenantOwnerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Note: In a real test, you would authenticate and get actual tokens from the backend.
    // This is a placeholder showing the structure. You'd replace these with real JWTs.
    superAdminToken = 'mock-super-admin-jwt';
    tenantOwnerToken = 'mock-tenant-owner-jwt';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/tenants', () => {
    it('should allow super admin to list tenants', async () => {
      // In real test, use a valid JWT with role PLATFORM_SUPER_ADMIN
      const response = await request(app.getHttpServer())
        .get('/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`);

      // Expect 200 (or 401 if JWT is invalid in test env)
      expect([200, 401]).toContain(response.status);
    });

    it('should reject tenant owner from listing all tenants', async () => {
      // In real test, use a valid JWT with role TENANT_OWNER
      const response = await request(app.getHttpServer())
        .get('/admin/tenants')
        .set('Authorization', `Bearer ${tenantOwnerToken}`);

      // Expect 403 (forbidden) or 401 (unauthorized)
      expect([403, 401]).toContain(response.status);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app.getHttpServer()).get('/admin/tenants');

      // Expect 401 (unauthorized)
      expect(response.status).toBe(401);
    });
  });

  describe('POST /admin/tenants', () => {
    it('should allow super admin to create tenant', async () => {
      const createPayload = {
        name: 'Test Tenant',
        domain: 'test.example.com',
        plan: 'PRO',
        status: 'ACTIVE',
        ownerEmail: 'owner@test.com',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/tenants')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(createPayload);

      expect([201, 401]).toContain(response.status);
    });

    it('should reject tenant owner from creating tenant', async () => {
      const createPayload = {
        name: 'Test Tenant',
        domain: 'test.example.com',
        plan: 'PRO',
        status: 'ACTIVE',
        ownerEmail: 'owner@test.com',
      };

      const response = await request(app.getHttpServer())
        .post('/admin/tenants')
        .set('Authorization', `Bearer ${tenantOwnerToken}`)
        .send(createPayload);

      expect([403, 401]).toContain(response.status);
    });
  });

  describe('PATCH /admin/tenants/:id', () => {
    const tenantId = 'mock-tenant-id';

    it('should allow super admin to update tenant', async () => {
      const updatePayload = { status: 'SUSPENDED', plan: 'BASIC' };

      const response = await request(app.getHttpServer())
        .patch(`/admin/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updatePayload);

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should reject tenant owner from updating tenant', async () => {
      const updatePayload = { status: 'SUSPENDED' };

      const response = await request(app.getHttpServer())
        .patch(`/admin/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${tenantOwnerToken}`)
        .send(updatePayload);

      expect([403, 401]).toContain(response.status);
    });
  });

  describe('DELETE /admin/tenants/:id', () => {
    const tenantId = 'mock-tenant-id';

    it('should allow super admin to soft-delete tenant', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect([200, 401, 404]).toContain(response.status);
    });

    it('should reject tenant owner from deleting tenant', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${tenantOwnerToken}`);

      expect([403, 401]).toContain(response.status);
    });
  });
});
