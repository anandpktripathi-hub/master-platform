import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

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
export class StubDomainResellerProvider implements DomainResellerProvider {
  private readonly logger = new Logger(StubDomainResellerProvider.name);

  async search(domain: string): Promise<DomainSearchResult> {
    this.logger.log(`Stub search for domain ${domain}`);
    // Deterministic but fake availability: odd-length domains are "available"
    const available = domain.replace(/\./g, '').length % 2 === 1;
    return {
      domain,
      available,
      currency: 'USD',
      price: 12,
      renewalPrice: 12,
      provider: 'stub',
    };
  }

  async purchase(
    request: DomainPurchaseRequest,
  ): Promise<DomainPurchaseResult> {
    this.logger.log(
      `Stub purchase for domain ${request.domain} by tenant ${request.tenantId}`,
    );
    return {
      success: true,
      domain: request.domain,
      providerOrderId: `stub-${Date.now()}`,
      nameservers: ['ns1.example.test', 'ns2.example.test'],
      message:
        'Stub purchase only. Integrate with a real reseller (e.g. Cloudflare, Route53) in production.',
    };
  }

  async ensureDns(domain: string, records: DnsRecord[]): Promise<void> {
    this.logger.log(
      `Stub ensureDns for ${domain} with records: ${JSON.stringify(records)}`,
    );
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

  async search(domain: string): Promise<DomainSearchResult> {
    // Cloudflare registrar APIs are more complex; for now, we expose a
    // conservative "unknown but assumed available" result so that the UI
    // can still proceed while real availability is checked manually.
    this.logger.log(`Cloudflare search (shallow) for domain ${domain}`);
    return {
      domain,
      available: true,
      currency: 'USD',
      price: 12,
      renewalPrice: 12,
      provider: 'cloudflare',
    };
  }

  async purchase(
    request: DomainPurchaseRequest,
  ): Promise<DomainPurchaseResult> {
    // Full domain registration via Cloudflare Registrar is intentionally
    // not automated here; operators should complete purchase in their
    // Cloudflare account UI and then attach DNS/SSL.
    this.logger.warn(
      `Domain purchase via Cloudflare is not implemented. Requested: ${request.domain} for tenant ${request.tenantId}`,
    );
    return {
      success: false,
      domain: request.domain,
      message:
        'Domain purchase via Cloudflare is not automated. Complete purchase in Cloudflare UI, then use DNS automation for records.',
    };
  }

  async ensureDns(domain: string, records: DnsRecord[]): Promise<void> {
    if (!this.hasConfig) {
      this.logger.warn(
        `Cloudflare DNS not configured (CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN missing). Skipping DNS provisioning for ${domain}.`,
      );
      return;
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
            { headers },
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
            { headers },
          );
          this.logger.log(`Created Cloudflare DNS record for ${name}`);
        }
      } catch (err) {
        const message = (err as Error).message ?? String(err);
        this.logger.error(
          `Failed to ensure Cloudflare DNS record for ${name}: ${message}`,
        );
      }
    }
  }
}

export const DOMAIN_RESELLER_PROVIDER_TOKEN = 'DOMAIN_RESELLER_PROVIDER';
