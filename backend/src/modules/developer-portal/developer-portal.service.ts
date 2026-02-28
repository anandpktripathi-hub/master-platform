import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  DeveloperApiKey,
  DeveloperApiKeyDocument,
} from '../../database/schemas/developer-api-key.schema';
import {
  WebhookDeliveryLog,
  WebhookDeliveryLogDocument,
} from '../../database/schemas/webhook-delivery-log.schema';

export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresAt?: Date;
}

export interface ApiKeyCreatedResponse {
  id: string;
  name: string;
  keyPrefix: string;
  rawKey: string; // Only returned on creation
  scopes: string[];
  expiresAt?: Date;
  createdAt: Date;
}

@Injectable()
export class DeveloperPortalService {
  constructor(
    @InjectModel(DeveloperApiKey.name)
    private readonly apiKeyModel: Model<DeveloperApiKeyDocument>,
    @InjectModel(WebhookDeliveryLog.name)
    private readonly webhookLogModel: Model<WebhookDeliveryLogDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private normalizeLimit(value: unknown, defaultValue = 50) {
    const n = typeof value === 'number' ? value : value === undefined ? defaultValue : Number(value);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('Invalid limit');
    }
    return Math.min(Math.max(Math.trunc(n), 1), 100);
  }

  private normalizeSkip(value: unknown, defaultValue = 0) {
    const n = typeof value === 'number' ? value : value === undefined ? defaultValue : Number(value);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('Invalid skip');
    }
    return Math.max(Math.trunc(n), 0);
  }

  /**
   * Create a new API key for a tenant.
   * Returns the raw key only once; the key is hashed before storing.
   */
  async createApiKey(
    tenantId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<ApiKeyCreatedResponse> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const userObjectId = this.toObjectId(userId, 'userId');

    if (!dto?.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      throw new BadRequestException('Invalid name');
    }

    if (dto.expiresAt && Number.isNaN(dto.expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt');
    }

    // Generate a cryptographically secure random key
    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 12);

    // Hash the key before storing
    const keyHash = await bcrypt.hash(rawKey, 10);

    const apiKey = new this.apiKeyModel({
      tenantId: tenantObjectId,
      createdBy: userObjectId,
      name: dto.name.trim(),
      keyHash,
      keyPrefix,
      scopes: dto.scopes || [],
      isActive: true,
      expiresAt: dto.expiresAt || undefined,
    });

    const saved = await apiKey.save();

    return {
      id: String(saved._id),
      name: saved.name,
      keyPrefix: saved.keyPrefix,
      rawKey, // Only returned once
      scopes: saved.scopes,
      expiresAt: saved.expiresAt,
      createdAt: saved.createdAt!,
    };
  }

  /**
   * List all API keys for a tenant (without exposing hashes or raw keys).
   */
  async listApiKeys(tenantId: string) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const keys = await this.apiKeyModel
      .find({ tenantId: tenantObjectId })
      .sort('-createdAt')
      .exec();

    return keys.map((k) => ({
      id: String(k._id),
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));
  }

  /**
   * Revoke (deactivate) an API key.
   */
  async revokeApiKey(tenantId: string, keyId: string): Promise<void> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const keyObjectId = this.toObjectId(keyId, 'keyId');
    const key = await this.apiKeyModel.findOne({
      _id: keyObjectId,
      tenantId: tenantObjectId,
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    key.isActive = false;
    await key.save();
  }

  /**
   * Delete an API key permanently.
   */
  async deleteApiKey(tenantId: string, keyId: string): Promise<void> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const keyObjectId = this.toObjectId(keyId, 'keyId');
    const result = await this.apiKeyModel.deleteOne({
      _id: keyObjectId,
      tenantId: tenantObjectId,
    });

    if (!result.deletedCount) {
      throw new NotFoundException('API key not found');
    }
  }

  /**
   * List webhook delivery logs for a tenant, with optional event and status filters.
   */
  async listWebhookDeliveryLogs(
    tenantId: string,
    options: {
      limit?: number;
      skip?: number;
      event?: string;
      status?: string;
    } = {},
  ) {
    const filter: Record<string, unknown> = {
      tenantId: this.toObjectId(tenantId, 'tenantId'),
    };

    if (options.event) {
      filter.event = options.event;
    }

    if (options.status) {
      filter.status = options.status;
    }

    const limit = this.normalizeLimit(options.limit, 50);
    const skip = this.normalizeSkip(options.skip, 0);

    const [logs, total] = await Promise.all([
      this.webhookLogModel
        .find(filter)
        .sort('-createdAt')
        .limit(limit)
        .skip(skip)
        .lean()
        .exec(),
      this.webhookLogModel.countDocuments(filter),
    ]);

    return {
      data: logs.map((log) => ({
        id: String(log._id),
        event: log.event,
        url: log.url,
        status: log.status,
        responseStatus: log.responseStatus,
        error: log.error,
        attemptNumber: log.attemptNumber,
        createdAt: log.createdAt,
      })),
      total,
      limit,
      skip,
    };
  }

  /**
   * Get detailed webhook delivery log by ID.
   */
  async getWebhookDeliveryLog(tenantId: string, logId: string) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const logObjectId = this.toObjectId(logId, 'logId');
    const log = await this.webhookLogModel
      .findOne({
        _id: logObjectId,
        tenantId: tenantObjectId,
      })
      .lean()
      .exec();

    if (!log) {
      throw new NotFoundException('Webhook log not found');
    }

    return {
      id: String(log._id),
      event: log.event,
      url: log.url,
      method: log.method,
      requestHeaders: log.requestHeaders,
      requestBody: log.requestBody,
      responseStatus: log.responseStatus,
      responseHeaders: log.responseHeaders,
      responseBody: log.responseBody,
      status: log.status,
      error: log.error,
      attemptNumber: log.attemptNumber,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }
}
