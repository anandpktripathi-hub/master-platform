import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('TenantController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow tenant1 to create tenant', () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('x-tenant-id', 'tenant1')
      .send({ name: 'Tenant 1', domain: 'tenant1.example.com' })
      .expect(201);
  });

  it('should allow tenant2 to create tenant', () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('x-tenant-id', 'tenant2')
      .send({ name: 'Tenant 2', domain: 'tenant2.example.com' })
      .expect(201);
  });
});

















