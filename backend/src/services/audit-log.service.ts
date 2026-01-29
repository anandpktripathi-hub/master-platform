import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Document } from 'mongoose';
import { AuditLog } from '../database/schemas/audit-log.schema';

import { Document as MongooseDocument } from 'mongoose';

export interface AuditLogParams {
  actorId?: string;
  tenantId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: Record<string, unknown> | MongooseDocument | undefined;
  after?: Record<string, unknown> | MongooseDocument | undefined;
  ip?: string;
  userAgent?: string;
  status?: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(params: AuditLogParams): Promise<AuditLog> {
    try {
      const changes = this.calculateChanges(
        params.before ?? {},
        params.after ?? {},
      );

      const auditLog = new this.auditLogModel({
        actorId: params.actorId,
        tenantId: params.tenantId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        before: params.before,
        after: params.after,
        changes,
        ip: params.ip,
        userAgent: params.userAgent,
        status: params.status || 'success',
        errorMessage: params.errorMessage,
      });

      return await auditLog.save();
    } catch (error) {
      this.logger.error(
        `Failed to log audit event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get audit logs for a tenant
   */
  async getTenantLogs(
    tenantId: string,
    options: {
      limit?: number;
      skip?: number;
      sortBy?: string;
      action?: string;
      actionPrefix?: string;
      resourceType?: string;
      resourceId?: string;
      status?: 'success' | 'failure' | 'pending';
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    const limit = options.limit || 50;
    const skip = options.skip || 0;
    const sortBy = options.sortBy || '-createdAt';

    const filter: FilterQuery<AuditLog> = { tenantId };

    if (options.action) {
      filter.action = options.action;
    } else if (options.actionPrefix) {
      filter.action = { $regex: `^${options.actionPrefix}` } as any;
    }

    if (options.resourceType) {
      filter.resourceType = options.resourceType;
    }

    if (options.resourceId) {
      filter.resourceId = options.resourceId;
    }

    if (options.status) {
      filter.status = options.status;
    }

    if (options.startDate || options.endDate) {
      filter.createdAt = {} as any;

      if (options.startDate) {
        (filter.createdAt as any).$gte = options.startDate;
      }

      if (options.endDate) {
        (filter.createdAt as any).$lte = options.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort(sortBy)
        .populate('actorId', 'email name')
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Get all audit logs for a tenant matching the given filters, for exports.
   * This does not apply pagination; callers should use cautiously.
   */
  async getTenantLogsForExport(
    tenantId: string,
    options: {
      sortBy?: string;
      action?: string;
      actionPrefix?: string;
      resourceType?: string;
      resourceId?: string;
      status?: 'success' | 'failure' | 'pending';
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<AuditLog[]> {
    const sortBy = options.sortBy || '-createdAt';

    const filter: FilterQuery<AuditLog> = { tenantId };

    if (options.action) {
      filter.action = options.action;
    } else if (options.actionPrefix) {
      filter.action = { $regex: `^${options.actionPrefix}` } as any;
    }

    if (options.resourceType) {
      filter.resourceType = options.resourceType;
    }

    if (options.resourceId) {
      filter.resourceId = options.resourceId;
    }

    if (options.status) {
      filter.status = options.status;
    }

    if (options.startDate || options.endDate) {
      filter.createdAt = {} as any;

      if (options.startDate) {
        (filter.createdAt as any).$gte = options.startDate;
      }

      if (options.endDate) {
        (filter.createdAt as any).$lte = options.endDate;
      }
    }

    return this.auditLogModel
      .find(filter)
      .sort(sortBy)
      .populate('actorId', 'email name')
      .exec();
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(
    resourceType: string,
    resourceId: string,
    options: { limit?: number; skip?: number } = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find({ resourceType, resourceId })
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .populate('actorId', 'email name')
        .exec(),
      this.auditLogModel.countDocuments({ resourceType, resourceId }),
    ]);

    return { data, total };
  }

  /**
   * Get logs by action type
   */
  async getLogsByAction(
    action: string,
    options: { tenantId?: string; limit?: number; skip?: number } = {},
  ): Promise<{ data: AuditLog[]; total: number }> {
    const filter: FilterQuery<AuditLog> = { action };
    if (options.tenantId) {
      filter.tenantId = options.tenantId;
    }

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .populate('actorId', 'email name')
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  /**
   * Calculate which fields changed between before and after
   */
  private calculateChanges(
    before: Record<string, unknown> | MongooseDocument,
    after: Record<string, unknown> | MongooseDocument,
  ): string[] {
    if (!before || !after) return [];

    // Convert Mongoose Document to plain object if needed
    const beforeObj =
      typeof (before as any).toObject === 'function'
        ? (before as any).toObject()
        : before;
    const afterObj =
      typeof (after as any).toObject === 'function'
        ? (after as any).toObject()
        : after;

    const changes: string[] = [];
    const allKeys = new Set([
      ...Object.keys(beforeObj || {}),
      ...Object.keys(afterObj || {}),
    ]);

    for (const key of allKeys) {
      if (JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])) {
        changes.push(key);
      }
    }

    return changes;
  }
}
