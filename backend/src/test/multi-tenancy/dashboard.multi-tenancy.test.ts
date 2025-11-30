import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('DashboardController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow tenant1 to create dashboard', () => {
    return request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', 'tenant1')
      .send({ name: 'Dashboard 1', widgets: [] })
      .expect(201);
  });

  it('should allow tenant2 to create dashboard', () => {
    return request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', 'tenant2')
      .send({ name: 'Dashboard 2', widgets: [] })
      .expect(201);
  });
});

















