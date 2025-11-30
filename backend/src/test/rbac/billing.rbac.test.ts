import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('BillingController RBAC', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow admin to create billing', () => {
    return request(app.getHttpServer())
      .post('/billings')
      .set('Authorization', 'Bearer admin-token')
      .set('x-tenant-id', 'default')
      .send({ amount: 100, currency: 'USD', status: 'paid' })
      .expect(201);
  });

  it('should not allow user to create billing', () => {
    return request(app.getHttpServer())
      .post('/billings')
      .set('Authorization', 'Bearer user-token')
      .set('x-tenant-id', 'default')
      .send({ amount: 100, currency: 'USD', status: 'paid' })
      .expect(403);
  });
});

















