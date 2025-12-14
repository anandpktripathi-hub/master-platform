import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * E2E Tests for Theme Module with Tenant Isolation
 * 
 * These tests verify that:
 * 1. Super admin can create/manage global themes
 * 2. Tenants can select and customize themes
 * 3. Theme customizations are isolated per tenant
 * 4. Default theme is assigned to new tenants
 */
describe('Theme Module Multi-Tenant (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  
  let superAdminToken: string;
  let tenant1Token: string;
  let tenant2Token: string;
  let tenant1Id: string;
  let tenant2Id: string;
  
  let modernLightTheme: any;
  let darkProfessionalTheme: any;
  let vibrantTheme: any;

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
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  describe('Setup: Create Tenants and Login', () => {
    it('should create tenant 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/tenants')
        .send({
          name: 'Theme Test Tenant 1',
          slug: 'theme-tenant-1',
          domain: 'theme1.localhost',
          ownerEmail: 'theme1@test.com',
          ownerPassword: 'Password123!',
        });

      tenant1Id = response.body._id;
      expect(response.status).toBe(201);
    });

    it('should create tenant 2', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/tenants')
        .send({
          name: 'Theme Test Tenant 2',
          slug: 'theme-tenant-2',
          domain: 'theme2.localhost',
          ownerEmail: 'theme2@test.com',
          ownerPassword: 'Password123!',
        });

      tenant2Id = response.body._id;
      expect(response.status).toBe(201);
    });

    it('should login as tenant 1 user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'theme1@test.com',
          password: 'Password123!',
        });

      tenant1Token = response.body.access_token;
      expect(response.status).toBe(200);
    });

    it('should login as tenant 2 user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'theme2@test.com',
          password: 'Password123!',
        });

      tenant2Token = response.body.access_token;
      expect(response.status).toBe(200);
    });

    it('should login as super admin', async () => {
      // Assumes super admin exists with these credentials
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@platform.com',
          password: 'SuperAdmin123!',
        });

      superAdminToken = response.body.access_token;
      expect(response.status).toBe(200);
    });
  });

  describe('Admin Theme Management', () => {
    it('super admin should create Modern Light theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/themes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Modern Light',
          slug: 'modern-light',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          backgroundColor: '#ffffff',
          surfaceColor: '#f5f5f5',
          textPrimaryColor: '#000000',
          textSecondaryColor: '#666666',
          fontFamily: 'Roboto, sans-serif',
          baseFontSize: 14,
          baseSpacing: 8,
          borderRadius: 4,
          isActive: true,
        });

      modernLightTheme = response.body;
      expect(response.status).toBe(201);
      expect(modernLightTheme.name).toBe('Modern Light');
      expect(modernLightTheme.slug).toBe('modern-light');
    });

    it('super admin should create Dark Professional theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/themes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Dark Professional',
          slug: 'dark-professional',
          primaryColor: '#90caf9',
          secondaryColor: '#f48fb1',
          backgroundColor: '#121212',
          surfaceColor: '#1e1e1e',
          textPrimaryColor: '#ffffff',
          textSecondaryColor: '#b0b0b0',
          fontFamily: 'Inter, sans-serif',
          baseFontSize: 14,
          baseSpacing: 8,
          borderRadius: 8,
          isActive: true,
        });

      darkProfessionalTheme = response.body;
      expect(response.status).toBe(201);
    });

    it('super admin should create Vibrant theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/themes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Vibrant',
          slug: 'vibrant',
          primaryColor: '#ff5722',
          secondaryColor: '#4caf50',
          backgroundColor: '#fafafa',
          surfaceColor: '#ffffff',
          textPrimaryColor: '#212121',
          textSecondaryColor: '#757575',
          fontFamily: 'Poppins, sans-serif',
          baseFontSize: 15,
          baseSpacing: 10,
          borderRadius: 12,
          isActive: true,
        });

      vibrantTheme = response.body;
      expect(response.status).toBe(201);
    });

    it('super admin should set Modern Light as default', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/themes/${modernLightTheme._id}/set-default`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);
    });

    it('tenant should NOT be able to create themes', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/themes')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: 'Unauthorized Theme',
          slug: 'unauthorized',
          primaryColor: '#000000',
          secondaryColor: '#000000',
          backgroundColor: '#ffffff',
          surfaceColor: '#f5f5f5',
          textPrimaryColor: '#000000',
          textSecondaryColor: '#666666',
          fontFamily: 'Arial',
          baseFontSize: 14,
          baseSpacing: 8,
          borderRadius: 4,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Tenant Theme Selection', () => {
    it('tenant 1 should see all available themes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/available')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // All themes should be active
      response.body.forEach((theme: any) => {
        expect(theme.isActive).toBe(true);
      });
    });

    it('tenant 1 should get default theme initially', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Modern Light');
      expect(response.body.customizations).toBeDefined();
    });

    it('tenant 1 should select Dark Professional theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/select')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          baseThemeId: darkProfessionalTheme._id,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Dark Professional');
      expect(response.body.baseThemeId).toBe(darkProfessionalTheme._id);
    });

    it('tenant 2 should select Vibrant theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/select')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          baseThemeId: vibrantTheme._id,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Vibrant');
    });

    it('tenant 1 current theme should be Dark Professional', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Dark Professional');
    });

    it('tenant 2 current theme should be Vibrant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Vibrant');
    });
  });

  describe('Theme Customization with Isolation', () => {
    it('tenant 1 should customize their theme colors', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/tenant/themes/customize')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          customPrimaryColor: '#ff0000',
          customSecondaryColor: '#00ff00',
        });

      expect(response.status).toBe(200);
      expect(response.body.customizations.primaryColor).toBe('#ff0000');
      expect(response.body.customizations.secondaryColor).toBe('#00ff00');
    });

    it('tenant 2 should customize their theme typography', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/tenant/themes/customize')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          customFontFamily: 'Comic Sans MS, cursive',
          customBaseFontSize: 18,
        });

      expect(response.status).toBe(200);
      expect(response.body.customizations.fontFamily).toBe('Comic Sans MS, cursive');
      expect(response.body.customizations.baseFontSize).toBe(18);
    });

    it('tenant 1 customizations should NOT affect tenant 2', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(200);
      // Should NOT have tenant 1 customizations
      expect(response.body.customizations.primaryColor).not.toBe('#ff0000');
      expect(response.body.customizations.fontFamily).toBe('Comic Sans MS, cursive');
    });

    it('tenant 2 customizations should NOT affect tenant 1', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      // Should NOT have tenant 2 customizations
      expect(response.body.customizations.fontFamily).not.toBe('Comic Sans MS, cursive');
      expect(response.body.customizations.primaryColor).toBe('#ff0000');
    });

    it('tenant 1 should reset their theme customizations', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/reset')
        .set('Authorization', `Bearer ${tenant1Token}`);

      expect(response.status).toBe(200);
      // Customizations should be empty or base values
      expect(Object.keys(response.body.customizations).length).toBe(0);
    });

    it('tenant 1 reset should NOT affect tenant 2 customizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenant/themes/current')
        .set('Authorization', `Bearer ${tenant2Token}`);

      expect(response.status).toBe(200);
      // Tenant 2 should still have their customizations
      expect(response.body.customizations.fontFamily).toBe('Comic Sans MS, cursive');
    });
  });

  describe('Theme Selection Edge Cases', () => {
    it('should reject selecting non-existent theme', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/select')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          baseThemeId: '000000000000000000000000',
        });

      expect(response.status).toBe(404);
    });

    it('should reject selecting inactive theme', async () => {
      // First, create an inactive theme as super admin
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/themes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Inactive Theme',
          slug: 'inactive-theme',
          primaryColor: '#000000',
          secondaryColor: '#000000',
          backgroundColor: '#ffffff',
          surfaceColor: '#f5f5f5',
          textPrimaryColor: '#000000',
          textSecondaryColor: '#666666',
          fontFamily: 'Arial',
          baseFontSize: 14,
          baseSpacing: 8,
          borderRadius: 4,
          isActive: false,
        });

      const inactiveTheme = createResponse.body;

      // Try to select it as tenant
      const selectResponse = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/select')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          baseThemeId: inactiveTheme._id,
        });

      expect(selectResponse.status).toBe(404); // or 400
    });

    it('should clear customizations when selecting new theme', async () => {
      // Add customizations
      await request(app.getHttpServer())
        .put('/api/v1/tenant/themes/customize')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          customPrimaryColor: '#123456',
        });

      // Select new theme
      const response = await request(app.getHttpServer())
        .post('/api/v1/tenant/themes/select')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          baseThemeId: modernLightTheme._id,
        });

      expect(response.status).toBe(200);
      // Customizations should be cleared
      expect(Object.keys(response.body.customizations).length).toBe(0);
    });
  });
});
