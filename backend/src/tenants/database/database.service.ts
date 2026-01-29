import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection.manager';
import { Connection } from 'mongoose';

@Injectable()
export class TenantDatabaseService implements OnModuleDestroy {
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
