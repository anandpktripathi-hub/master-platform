import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  currency?: string;
  price?: number;
  renewalPrice?: number;
  provider?: string;
}

export interface DomainPurchaseRequest {
  domain: string;
  years?: number;
  tenantId: string;
  contactEmail?: string;
}

export interface DomainPurchaseResult {
  success: boolean;
  domain: string;
  providerOrderId?: string;
  nameservers?: string[];
  message?: string;
}

export interface DnsRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

export interface DomainResellerProvider {
  search(domain: string): Promise<DomainSearchResult>;
  purchase(request: DomainPurchaseRequest): Promise<DomainPurchaseResult>;
  ensureDns(domain: string, records: DnsRecord[]): Promise<void>;
}

@Injectable()
export class NotConfiguredDomainResellerProvider
  implements DomainResellerProvider
{
  private readonly logger = new Logger(NotConfiguredDomainResellerProvider.name);

  private notConfigured(): never {
    // Do not crash at startup; fail only when the feature is invoked.
    throw new ServiceUnavailableException('Domain provider not configured');
  }

  async search(_domain: string): Promise<DomainSearchResult> {
    this.logger.warn('Domain search requested but provider not configured');
    return this.notConfigured();
  }

  async purchase(_request: DomainPurchaseRequest): Promise<DomainPurchaseResult> {
    this.logger.warn('Domain purchase requested but provider not configured');
    return this.notConfigured();
  }

  async ensureDns(_domain: string, _records: DnsRecord[]): Promise<void> {
    this.logger.warn('DNS provisioning requested but provider not configured');
    return this.notConfigured();
  }
}

type HttpResellerConfig = {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
};

@Injectable()
export class HttpDomainResellerProvider implements DomainResellerProvider {
  private readonly logger = new Logger(HttpDomainResellerProvider.name);

  private readonly config: HttpResellerConfig | null;

  constructor() {
    const baseUrl = (process.env.DOMAIN_RESELLER_BASE_URL || '').trim();
    if (!baseUrl) {
      this.config = null;
      return;
    }

    const timeoutMsRaw = Number(process.env.DOMAIN_RESELLER_TIMEOUT_MS);
    const timeoutMs = Number.isFinite(timeoutMsRaw) ? Math.max(1000, timeoutMsRaw) : 10_000;

    this.config = {
      baseUrl,
      apiKey: (process.env.DOMAIN_RESELLER_API_KEY || '').trim() || undefined,
      timeoutMs,
    };
  }

  private requireConfig(): HttpResellerConfig {
    if (!this.config) {
      throw new ServiceUnavailableException('Domain provider not configured');
    }
    return this.config;
  }

  private toSafeAxiosErrorMessage(err: unknown): {
    kind: 'timeout' | 'http' | 'network' | 'unknown';
    status?: number;
    message: string;
  } {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      const status = axiosError.response?.status;
      const code = axiosError.code;

      if (code === 'ECONNABORTED') {
        return { kind: 'timeout', message: 'request timed out' };
      }
      if (typeof status === 'number') {
        return { kind: 'http', status, message: `provider responded with ${status}` };
      }
      if (axiosError.request) {
        return { kind: 'network', message: 'network error contacting provider' };
      }
      return { kind: 'unknown', message: axiosError.message || 'unknown provider error' };
    }

    const message = err instanceof Error ? err.message : String(err);
    return { kind: 'unknown', message };
  }

  private buildHeaders(apiKey?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      // Generic API key header; adapt per provider as needed.
      headers.Authorization = `Bearer ${apiKey}`;
    }
    return headers;
  }

  async search(domain: string): Promise<DomainSearchResult> {
    const { baseUrl, apiKey, timeoutMs } = this.requireConfig();
    try {
      // Minimal, provider-agnostic boundary.
      // TODO(provider): map/validate provider-specific response shape.
      const res = await axios.get(`${baseUrl}/domains/search`, {
        timeout: timeoutMs,
        headers: this.buildHeaders(apiKey),
        params: { domain },
      });

      const data = res.data as Partial<DomainSearchResult> | undefined;
      return {
        domain,
        available: Boolean(data?.available),
        currency: data?.currency,
        price: typeof data?.price === 'number' ? data.price : undefined,
        renewalPrice:
          typeof data?.renewalPrice === 'number' ? data.renewalPrice : undefined,
        provider: data?.provider || 'http',
      };
    } catch (err) {
      const safe = this.toSafeAxiosErrorMessage(err);
      this.logger.error(`Domain search failed: ${safe.message}`, {
        kind: safe.kind,
        status: safe.status,
      });
      if (safe.kind === 'timeout' || safe.kind === 'network') {
        throw new ServiceUnavailableException('Domain provider unavailable');
      }
      throw new BadRequestException('Domain search failed');
    }
  }

  async purchase(request: DomainPurchaseRequest): Promise<DomainPurchaseResult> {
    const { baseUrl, apiKey, timeoutMs } = this.requireConfig();
    try {
      // TODO(provider): map/validate provider-specific response shape.
      const res = await axios.post(`${baseUrl}/domains/purchase`, request, {
        timeout: timeoutMs,
        headers: this.buildHeaders(apiKey),
      });

      const data = res.data as Partial<DomainPurchaseResult> | undefined;
      return {
        success: Boolean(data?.success),
        domain: data?.domain || request.domain,
        providerOrderId: data?.providerOrderId,
        nameservers: Array.isArray(data?.nameservers) ? data?.nameservers : undefined,
        message: data?.message,
      };
    } catch (err) {
      const safe = this.toSafeAxiosErrorMessage(err);
      this.logger.error(`Domain purchase failed: ${safe.message}`, {
        kind: safe.kind,
        status: safe.status,
      });
      if (safe.kind === 'timeout' || safe.kind === 'network') {
        throw new ServiceUnavailableException('Domain provider unavailable');
      }
      throw new BadRequestException('Domain purchase failed');
    }
  }

  async ensureDns(domain: string, records: DnsRecord[]): Promise<void> {
    const { baseUrl, apiKey, timeoutMs } = this.requireConfig();
    try {
      // TODO(provider): map/validate provider-specific DNS response shape.
      await axios.post(
        `${baseUrl}/domains/dns/ensure`,
        { domain, records },
        {
          timeout: timeoutMs,
          headers: this.buildHeaders(apiKey),
        },
      );
    } catch (err) {
      const safe = this.toSafeAxiosErrorMessage(err);
      this.logger.error(`Ensure DNS failed: ${safe.message}`, {
        kind: safe.kind,
        status: safe.status,
      });
      throw new InternalServerErrorException('Failed to configure DNS');
    }
  }
}

@Injectable()
export class CloudflareDomainResellerProvider implements DomainResellerProvider {
  private readonly logger = new Logger(CloudflareDomainResellerProvider.name);

  private readonly apiBase = 'https://api.cloudflare.com/client/v4';
  private readonly zoneId = process.env.CLOUDFLARE_ZONE_ID;
  private readonly apiToken = process.env.CLOUDFLARE_API_TOKEN;

  private get hasConfig() {
    return Boolean(this.zoneId && this.apiToken);
  }

  private notSupported(action: 'search' | 'purchase'): never {
    // Cloudflare can be used for DNS automation in v1, but domain search/purchase
    // is provider-specific and intentionally not implemented here.
    // Do not crash at startup; fail only when invoked.
    this.logger.warn(
      `Cloudflare domain ${action} is not implemented. Configure DOMAIN_PROVIDER=http with DOMAIN_RESELLER_BASE_URL for domain registration.`,
    );
    throw new ServiceUnavailableException(
      'Domain provider does not support domain search/purchase (not configured)',
    );
  }

  async search(domain: string): Promise<DomainSearchResult> {
    return this.notSupported('search');
  }

  async purchase(
    request: DomainPurchaseRequest,
  ): Promise<DomainPurchaseResult> {
    return this.notSupported('purchase');
  }

  async ensureDns(domain: string, records: DnsRecord[]): Promise<void> {
    if (!this.hasConfig) {
      this.logger.warn(
        `Cloudflare DNS not configured (CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN missing) for ${domain}.`,
      );
      throw new ServiceUnavailableException('Domain provider not configured');
    }

    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };

    for (const record of records) {
      const ttl = record.ttl ?? 3600;
      const name = record.name;

      try {
        // Check for existing record
        const listRes = await axios.get(
          `${this.apiBase}/zones/${this.zoneId}/dns_records`,
          {
            headers,
            timeout: 10_000,
            params: { type: record.type, name },
          },
        );

        const existing = Array.isArray(listRes.data?.result)
          ? listRes.data.result[0]
          : null;

        if (existing) {
          await axios.put(
            `${this.apiBase}/zones/${this.zoneId}/dns_records/${existing.id}`,
            {
              type: record.type,
              name,
              content: record.value,
              ttl,
              proxied: false,
            },
            { headers, timeout: 10_000 },
          );
          this.logger.log(`Updated Cloudflare DNS record for ${name}`);
        } else {
          await axios.post(
            `${this.apiBase}/zones/${this.zoneId}/dns_records`,
            {
              type: record.type,
              name,
              content: record.value,
              ttl,
              proxied: false,
            },
            { headers, timeout: 10_000 },
          );
          this.logger.log(`Created Cloudflare DNS record for ${name}`);
        }
      } catch (err) {
        const safe = (() => {
          if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError;
            return {
              status: axiosError.response?.status,
              message: axiosError.message || 'cloudflare request failed',
            };
          }
          return { status: undefined, message: (err as Error).message ?? String(err) };
        })();

        // Avoid logging raw provider response bodies.
        this.logger.error(`Failed to ensure Cloudflare DNS record for ${name}: ${safe.message}`, {
          status: safe.status,
        });
        throw new InternalServerErrorException('Failed to configure DNS');
      }
    }
  }
}

export const DOMAIN_RESELLER_PROVIDER_TOKEN = 'DOMAIN_RESELLER_PROVIDER';
