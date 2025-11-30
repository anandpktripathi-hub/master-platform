import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('UserController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow tenant1 to create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('x-tenant-id', 'tenant1')
      .send({ name: 'User 1', email: 'user1@tenant1.com', password: 'password', role: 'user' })
      .expect(201);
  });

  it('should allow tenant2 to create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('x-tenant-id', 'tenant2')
      .send({ name: 'User 2', email: 'user2@tenant2.com', password: 'password', role: 'user' })
      .expect(201);
  });
});

















