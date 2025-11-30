import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('ThemeController Multi-Tenancy', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow tenant1 to create theme', () => {
    return request(app.getHttpServer())
      .post('/themes')
      .set('x-tenant-id', 'tenant1')
      .send({ name: 'Theme 1', colors: { primary: '#1976d2', secondary: '#dc004e' } })
      .expect(201);
  });

  it('should allow tenant2 to create theme', () => {
    return request(app.getHttpServer())
      .post('/themes')
      .set('x-tenant-id', 'tenant2')
      .send({ name: 'Theme 2', colors: { primary: '#90caf9', secondary: '#f48fb1' } })
      .expect(201);
  });
});

















