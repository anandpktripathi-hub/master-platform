import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RateLimitGuard (e2e)', () => {
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

  it('should rate-limit password reset requests after several attempts', async () => {
    const server = app.getHttpServer();

    // Default config: 5 requests per 60 seconds per IP+route.
    for (let i = 0; i < 5; i++) {
      await request(server)
        .post('/auth/request-password-reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    }

    await request(server)
      .post('/auth/request-password-reset')
      .send({ email: 'nonexistent@example.com' })
      .expect(429);
  });
});
