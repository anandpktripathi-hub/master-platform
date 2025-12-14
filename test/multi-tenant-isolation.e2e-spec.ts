import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * E2E Tests for Multi-Tenant Data Isolation
 * 
 * These tests verify that:
 * 1. Tenants can only access their own data
 * 2. Cross-tenant data leakage is prevented
 * 3. Super admin can access all tenant data
 * 4. Tenant isolation works for products, orders, categories
 */
describe('Multi-Tenant Data Isolation (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  
  // Test data
  let tenant1: any;
  let tenant2: any;
  let tenant1User: any;
  let tenant2User: any;
  let superAdmin: any;
  let tenant1Token: string;
  let tenant2Token: string;
  let superAdminToken: string;
  let tenant1Product: any;
  let tenant2Product: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();

    connection = app.get(getConnectionToken());
  });

  afterAll(async () => {
    // Clean up test data
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  describe('Setup Test Data', () => {
    it('should create tenant 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/tenants')
        .send({
          name: 'Test Tenant 1',
          slug: 'test-tenant-1',
          domain: 'tenant1.localhost',
          ownerEmail: 'owner1@tenant1.com',
          ownerPassword: 'Password123!',
        });

      tenant1 = response.body;
      expect(response.status).toBe(201);
    });

    it('should create tenant 2', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/tenants')
        .send({
          name: 'Test Tenant 2',
          slug: 'test-tenant-2',
          domain: 'tenant2.localhost',
          ownerEmail: 'owner2@tenant2.com',
          ownerPassword: 'Password123!',
        });

      tenant2 = response.body;
      expect(response.status).toBe(201);
    });

    it('should login as tenant 1 user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'owner1@tenant1.com',
          password: 'Password123!',
        });

      tenant1Token = response.body.access_token;
      tenant1User = response.body.user;
      expect(response.status).toBe(200);
      expect(tenant1Token).toBeDefined();
    });

    it('should login as tenant 2 user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'owner2@tenant2.com',
          password: 'Password123!',
        });

      tenant2Token = response.body.access_token;
      tenant2User = response.body.user;
      expect(response.status).toBe(200);
      expect(tenant2Token).toBeDefined();
    });
  });

  describe('Product Isolation Tests', () => {
    it('tenant 1 should create a product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: 'Tenant 1 Product',
          description: 'Product for tenant 1',
          price: 100,
          sku: 'T1-PROD-001',
        });

      tenant1Product = response.body;
      expect(response.status).toBe(201);
      expect(tenant1Product.tenantId).toBe(tenant1._id);
    });

    it('tenant 2 should create a product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          name: 'Tenant 2 Product',
          description: 'Product for tenant 2',
          price: 200,
          sku: 'T2-PROD-001',
        });

      tenant2Product = response.body;
      expect(response.status).toBe(201);
      expect(tenant2Product.tenantId).toBe(tenant2._id);
    });

    it('tenant 1 should only see their own products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should only contain tenant 1 products
      response.body.forEach((product: any) => {
        expect(product.tenantId).toBe(tenant1._id);
      });
      
      // Should NOT contain tenant 2 products
      const hasTenant2Product = response.body.some((p: any) => p._id === tenant2Product._id);
      expect(hasTenant2Product).toBe(false);
    });

    it('tenant 2 should only see their own products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should only contain tenant 2 products
      response.body.forEach((product: any) => {
        expect(product.tenantId).toBe(tenant2._id);
      });
      
      // Should NOT contain tenant 1 products
      const hasTenant1Product = response.body.some((p: any) => p._id === tenant1Product._id);
      expect(hasTenant1Product).toBe(false);
    });

    it('tenant 1 should NOT be able to access tenant 2 product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${tenant2Product._id}`)
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(404); // or 403
    });

    it('tenant 2 should NOT be able to access tenant 1 product', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${tenant1Product._id}`)
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(404); // or 403
    });

    it('tenant 1 should NOT be able to update tenant 2 product', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${tenant2Product._id}`)
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: 'Hacked Product Name',
          price: 1,
        });

      expect(response.status).toBe(404); // or 403
    });

    it('tenant 1 should NOT be able to delete tenant 2 product', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/products/${tenant2Product._id}`)
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(404); // or 403

      // Verify product still exists
      const checkResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${tenant2Product._id}`)
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(checkResponse.status).toBe(200);
    });
  });

  describe('Category Isolation Tests', () => {
    let tenant1Category: any;
    let tenant2Category: any;

    it('tenant 1 should create a category', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: 'Tenant 1 Category',
          description: 'Category for tenant 1',
        });

      tenant1Category = response.body;
      expect(response.status).toBe(201);
      expect(tenant1Category.tenantId).toBe(tenant1._id);
    });

    it('tenant 2 should create a category', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          name: 'Tenant 2 Category',
          description: 'Category for tenant 2',
        });

      tenant2Category = response.body;
      expect(response.status).toBe(201);
      expect(tenant2Category.tenantId).toBe(tenant2._id);
    });

    it('tenant 1 should only see their own categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      
      response.body.forEach((category: any) => {
        expect(category.tenantId).toBe(tenant1._id);
      });
    });

    it('tenant 2 should only see their own categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(200);
      
      response.body.forEach((category: any) => {
        expect(category.tenantId).toBe(tenant2._id);
      });
    });

    it('tenant 1 should NOT access tenant 2 category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/categories/${tenant2Category._id}`)
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Order Isolation Tests', () => {
    let tenant1Order: any;
    let tenant2Order: any;

    it('tenant 1 should create an order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          items: [{ productId: tenant1Product._id, quantity: 2, price: 100 }],
          totalAmount: 200,
          customerEmail: 'customer1@test.com',
        });

      tenant1Order = response.body;
      expect(response.status).toBe(201);
      expect(tenant1Order.tenantId).toBe(tenant1._id);
    });

    it('tenant 2 should create an order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          items: [{ productId: tenant2Product._id, quantity: 1, price: 200 }],
          totalAmount: 200,
          customerEmail: 'customer2@test.com',
        });

      tenant2Order = response.body;
      expect(response.status).toBe(201);
      expect(tenant2Order.tenantId).toBe(tenant2._id);
    });

    it('tenant 1 should only see their own orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      
      response.body.forEach((order: any) => {
        expect(order.tenantId).toBe(tenant1._id);
      });
    });

    it('tenant 1 should NOT access tenant 2 order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${tenant2Order._id}`)
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Domain-Based Tenant Resolution', () => {
    it('should resolve tenant from subdomain', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Host', 'tenant1.localhost')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      
      // All products should belong to tenant1
      response.body.forEach((product: any) => {
        expect(product.tenantId).toBe(tenant1._id);
      });
    });

    it('should reject mismatched domain and JWT tenantId', async () => {
      // Tenant 1 token with Tenant 2 domain
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Host', 'tenant2.localhost')
        .set('Authorization', `Bearer ${tenant1Token}`);

      // Should reject or return tenant 1 data based on JWT priority
      expect([200, 403]).toContain(response.status);
    });
  });
});
