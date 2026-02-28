import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  const healthService = {
    checkAll: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();

    controller = moduleRef.get(HealthController);
    jest.clearAllMocks();
  });

  it('ready returns ready when database+storage up', async () => {
    healthService.checkAll.mockResolvedValue({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'up' },
        storage: { status: 'up' },
        memory: { status: 'down' },
      },
    });

    const result = await controller.ready();
    expect(result.status).toBe('ready');
    expect(result.checks.database.status).toBe('up');
    expect(result.checks.storage.status).toBe('up');
  });

  it('ready returns not_ready when database down', async () => {
    healthService.checkAll.mockResolvedValue({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'down' },
        storage: { status: 'up' },
        memory: { status: 'up' },
      },
    });

    const result = await controller.ready();
    expect(result.status).toBe('not_ready');
  });
});
