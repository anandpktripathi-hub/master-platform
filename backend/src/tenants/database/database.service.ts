import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection.manager';
import { Connection } from 'mongoose';

@Injectable()
export class TenantDatabaseService implements OnModuleDestroy {
  /**
   * NOTE (v1): The app currently uses a shared MongoDB with tenantId scoping.
   * This per-tenant connection utility is kept for a future per-tenant DB model
   * and is not used by the core request tenancy pipeline.
   */
  constructor(private readonly connectionManager: TenantConnectionManager) {}

  async getTenantConnection(tenantId: string): Promise<Connection> {
    return this.connectionManager.getConnection(tenantId);
  }

  async closeAllConnections() {
    await this.connectionManager.closeAll();
  }

  async onModuleDestroy() {
    await this.closeAllConnections();
  }
}
