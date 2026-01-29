import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should rate-limit tenant self-registration', async () => {
    const server = app.getHttpServer();

    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/auth/tenant-register')
        .send({})
        .expect(400); // validation failure is fine
    }

    await request(server)
      .post('/auth/tenant-register')
      .send({})
      .expect(429);
  });

  it('should rate-limit send-verification-email', async () => {
    const server = app.getHttpServer();

    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/auth/send-verification-email')
        .send({ email: 'test@example.com' })
        .expect(200);
    }

    await request(server)
      .post('/auth/send-verification-email')
      .send({ email: 'test@example.com' })
      .expect(429);
  });

  it('should rate-limit verify-email (POST)', async () => {
    const server = app.getHttpServer();

    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);
    }

    await request(server)
      .post('/auth/verify-email')
      .send({ token: 'invalid-token' })
      .expect(429);
  });
});
