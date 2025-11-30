import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('BillingController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow tenant1 to create billing', () => {
    return request(app.getHttpServer())
      .post('/billings')
      .set('x-tenant-id', 'tenant1')
      .send({ amount: 100, currency: 'USD', status: 'paid' })
      .expect(201);
  });

  it('should allow tenant2 to create billing', () => {
    return request(app.getHttpServer())
      .post('/billings')
      .set('x-tenant-id', 'tenant2')
      .send({ amount: 100, currency: 'USD', status: 'paid' })
      .expect(201);
  });
});

















