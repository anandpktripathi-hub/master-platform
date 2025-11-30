import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('TenantController RBAC', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow admin to create tenant', () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'Test Tenant', domain: 'test.example.com' })
      .expect(201);
  });

  it('should not allow user to create tenant', () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', 'Bearer user-token')
      .send({ name: 'Test Tenant', domain: 'test.example.com' })
      .expect(403);
  });
});

















