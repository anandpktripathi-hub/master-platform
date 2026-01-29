import { Injectable, Logger } from '@nestjs/common';
import { createConnection, Connection } from 'mongoose';

const MONGO_URI =
  process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';
const MAX_POOL_SIZE = 10;

@Injectable()
export class TenantConnectionManager {
  private connections: Map<string, Connection> = new Map();
  private logger = new Logger(TenantConnectionManager.name);

  async getConnection(tenantId: string): Promise<Connection> {
    const dbName = `tenant_${tenantId}_db`;
    if (this.connections.has(dbName)) {
      const conn = this.connections.get(dbName);
      if (!conn) throw new Error(`Connection for ${dbName} not found`);
      return conn;
    }
    const uri = MONGO_URI.replace(/\/(\w+)(\?|$)/, `/${dbName}$2`);
    const conn = await createConnection(uri, {
      maxPoolSize: MAX_POOL_SIZE,
    });
    this.logger.log(`Created connection for ${dbName}`);
    this.connections.set(dbName, conn);
    return conn;
  }

  async closeAll() {
    for (const [dbName, conn] of this.connections.entries()) {
      await conn.close();
      this.logger.log(`Closed connection for ${dbName}`);
    }
    this.connections.clear();
  }
}
