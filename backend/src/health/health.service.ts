import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';

interface HealthCheck {
  status: 'up' | 'down';
  message?: string;
  latency?: number;
}

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: HealthCheck;
    storage: HealthCheck;
    memory: HealthCheck;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async checkAll(): Promise<HealthReport> {
    const checks = {
      database: await this.checkDatabase(),
      storage: await this.checkStorage(),
      memory: this.checkMemory(),
    };

    const allUp = Object.values(checks).every((c) => c.status === 'up');
    const anyDown = Object.values(checks).some((c) => c.status === 'down');

    return {
      status: allUp ? 'healthy' : anyDown ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      if (this.connection.readyState !== 1) {
        return {
          status: 'down',
          message: 'Database connection not ready',
        };
      }

      // Simple ping
      if (!this.connection.db) {
        return {
          status: 'down',
          message: 'Database handle not available',
        };
      }

      await this.connection.db.admin().ping();
      const latency = Date.now() - start;

      return {
        status: 'up',
        message: 'Database connected',
        latency,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Database health check failed: ${message}`);
      return {
        status: 'down',
        message,
        latency: Date.now() - start,
      };
    }
  }

  private async checkStorage(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const storageProvider = this.configService.get<string>(
        'STORAGE_PROVIDER',
        'local',
      );

      if (storageProvider === 'local') {
        const basePath =
          this.configService.get<string>('STORAGE_LOCAL_BASE_PATH') ||
          './uploads';
        // Check if storage path is writable
        await fs.access(basePath, fs.constants.W_OK);
      }
      // For S3/Cloudinary, could add actual connectivity checks here

      return {
        status: 'up',
        message: `Storage (${storageProvider}) accessible`,
        latency: Date.now() - start,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Storage health check failed: ${message}`);
      return {
        status: 'down',
        message,
        latency: Date.now() - start,
      };
    }
  }

  private checkMemory(): HealthCheck {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    const isHealthy = percentage < 90; // Warn if heap usage > 90%

    return {
      status: isHealthy ? 'up' : 'down',
      message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${percentage}%)`,
    };
  }
}
