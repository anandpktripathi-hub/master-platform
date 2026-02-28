import { HealthService } from './health.service';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

describe('HealthService (modules/health)', () => {
  const makeConnection = (overrides?: {
    readyState?: number;
    ping?: () => Promise<void>;
  }) => {
    const ping = overrides?.ping ?? (() => Promise.resolve());

    return {
      readyState: overrides?.readyState ?? 1,
      db: {
        admin: () => ({
          ping,
        }),
      },
    };
  };

  const makeConfig = (overrides?: { storageProvider?: string }) => {
    return {
      get: (key: string, defaultValue?: string) => {
        if (key === 'STORAGE_PROVIDER') {
          return overrides?.storageProvider ?? 's3';
        }
        return defaultValue;
      },
    };
  };

  it('reports unhealthy when database not ready', async () => {
    const connection = makeConnection({
      readyState: 0,
    }) as unknown as Connection;
    const config = makeConfig() as unknown as ConfigService;

    const service = new HealthService(connection, config);
    const report = await service.checkAll();

    expect(report.status).toBe('unhealthy');
    expect(report.checks.database.status).toBe('down');
  });

  it('reports degraded when only memory check is down', async () => {
    const connection = makeConnection({
      readyState: 1,
    }) as unknown as Connection;
    const config = makeConfig() as unknown as ConfigService;

    const memorySpy = jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 0,
      heapTotal: 100,
      heapUsed: 95,
      external: 0,
      arrayBuffers: 0,
    } as NodeJS.MemoryUsage);

    const service = new HealthService(connection, config);
    const report = await service.checkAll();

    memorySpy.mockRestore();

    expect(report.status).toBe('degraded');
    expect(report.checks.database.status).toBe('up');
    expect(report.checks.storage.status).toBe('up');
    expect(report.checks.memory.status).toBe('down');
  });
});
