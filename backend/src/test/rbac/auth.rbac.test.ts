import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('AuthController RBAC', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow admin to login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'password' })
      .expect(201);
  });

  it('should allow user to login', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password' })
      .expect(201);
  });
});

















