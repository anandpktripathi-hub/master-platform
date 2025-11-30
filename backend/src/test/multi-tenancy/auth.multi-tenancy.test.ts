import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('AuthController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow login for tenant1', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@tenant1.com', password: 'password' })
      .expect(201);
  });

  it('should allow login for tenant2', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@tenant2.com', password: 'password' })
      .expect(201);
  });
});

















