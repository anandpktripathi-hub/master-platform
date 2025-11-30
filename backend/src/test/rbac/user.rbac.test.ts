import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('UserController RBAC', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow admin to create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer admin-token')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password', role: 'user' })
      .expect(201);
  });

  it('should not allow user to create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer user-token')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password', role: 'user' })
      .expect(403);
  });
});

















