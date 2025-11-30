import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('ThemeController RBAC', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow admin to create theme', () => {
    return request(app.getHttpServer())
      .post('/themes')
      .set('Authorization', 'Bearer admin-token')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test Theme', colors: { primary: '#1976d2', secondary: '#dc004e' } })
      .expect(201);
  });

  it('should not allow user to create theme', () => {
    return request(app.getHttpServer())
      .post('/themes')
      .set('Authorization', 'Bearer user-token')
      .set('x-tenant-id', 'default')
      .send({ name: 'Test Theme', colors: { primary: '#1976d2', secondary: '#dc004e' } })
      .expect(403);
  });
});

















