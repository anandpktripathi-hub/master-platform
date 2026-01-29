import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * DomainResellerService – Automate domain registration with Namecheap, GoDaddy, or other resellers.
 *
 * This service provides a unified abstraction for purchasing domains through reseller APIs.
 * Currently supports Namecheap sandbox/production and provides extension points for GoDaddy, ResellerClub, etc.
 *
 * Environment Variables:
 *  - DOMAIN_RESELLER_PROVIDER=namecheap|godaddy|resellerclub (default: namecheap)
 *  - NAMECHEAP_API_USER (Namecheap API username)
 *  - NAMECHEAP_API_KEY (Namecheap API key)
 *  - NAMECHEAP_USERNAME (Namecheap account username)
 *  - NAMECHEAP_CLIENT_IP (Your server's whitelisted IP for Namecheap API)
 *  - NAMECHEAP_SANDBOX=true|false (use sandbox environment)
 *  - GODADDY_API_KEY (for GoDaddy provider)
 *  - GODADDY_API_SECRET (for GoDaddy provider)
 *
 * Usage:
 *  const result = await domainResellerService.registerDomain('example.com', { ... });
 *
 * Installation (optional):
 *   npm install axios
 *
 * For production:
 *  1. Sign up for a Namecheap reseller account and enable API access.
 *  2. Whitelist your server IP in the Namecheap dashboard.
 *  3. Configure the above environment variables.
 *  4. Call registerDomain() to purchase domains programmatically.
 */
@Injectable()
export class DomainResellerService {
  private readonly logger = new Logger(DomainResellerService.name);
  private readonly provider: 'namecheap' | 'godaddy' | 'resellerclub';

  constructor(private readonly configService: ConfigService) {
    this.provider = (this.configService.get<string>('DOMAIN_RESELLER_PROVIDER') || 'namecheap') as any;

    this.logger.log(`DomainResellerService: Using provider '${this.provider}'.`);
  }

  /**
   * Check domain availability via the configured reseller provider.
   *
   * @param domain Domain name to check (e.g., 'example.com')
   * @returns Object with available flag and pricing info
   */
  async checkAvailability(domain: string): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
  }> {
    if (this.provider === 'namecheap') {
      return this.namecheapCheckAvailability(domain);
    } else if (this.provider === 'godaddy') {
      return this.godaddyCheckAvailability(domain);
    } else if (this.provider === 'resellerclub') {
      return this.resellerclubCheckAvailability(domain);
    }

    this.logger.error(`Unsupported domain reseller provider: ${this.provider}`);
    return { available: false };
  }

  /**
   * Register a domain via the configured reseller provider.
   *
   * @param domain Domain name to register
   * @param registrant Registrant contact info
   * @param years Number of years to register (default: 1)
   * @returns Registration result with order ID and status
   */
  async registerDomain(
    domain: string,
    registrant: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    },
    years = 1,
  ): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    if (this.provider === 'namecheap') {
      return this.namecheapRegisterDomain(domain, registrant, years);
    } else if (this.provider === 'godaddy') {
      return this.godaddyRegisterDomain(domain, registrant, years);
    } else if (this.provider === 'resellerclub') {
      return this.resellerclubRegisterDomain(domain, registrant, years);
    }

    this.logger.error(`Unsupported domain reseller provider: ${this.provider}`);
    return { success: false, error: 'Unsupported provider' };
  }

  /**
   * Namecheap: Check domain availability using Namecheap API.
   */
  private async namecheapCheckAvailability(domain: string): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
  }> {
    const apiUser = this.configService.get<string>('NAMECHEAP_API_USER');
    const apiKey = this.configService.get<string>('NAMECHEAP_API_KEY');
    const username = this.configService.get<string>('NAMECHEAP_USERNAME');
    const clientIp = this.configService.get<string>('NAMECHEAP_CLIENT_IP');
    const sandbox = this.configService.get<string>('NAMECHEAP_SANDBOX') === 'true';

    if (!apiUser || !apiKey || !username || !clientIp) {
      this.logger.error('Namecheap API credentials are not configured.');
      return { available: false };
    }

    const baseUrl = sandbox
      ? 'https://api.sandbox.namecheap.com/xml.response'
      : 'https://api.namecheap.com/xml.response';

    try {
      const response = await axios.get(baseUrl, {
        params: {
          ApiUser: apiUser,
          ApiKey: apiKey,
          UserName: username,
          ClientIp: clientIp,
          Command: 'namecheap.domains.check',
          DomainList: domain,
        },
      });

      // Parse XML response (simplified; use a real XML parser in production)
      const xmlData = response.data as string;
      const available = xmlData.includes('Available="true"');
      const isPremium = xmlData.includes('IsPremiumName="true"');

      this.logger.log(`Namecheap availability check for ${domain}: available=${available}, premium=${isPremium}`);

      return {
        available,
        price: available ? 10.98 : undefined, // Placeholder; parse actual price from XML
        currency: 'USD',
      };
    } catch (err: any) {
      this.logger.error(`Namecheap availability check failed: ${err.message}`);
      return { available: false };
    }
  }

  /**
   * Namecheap: Register a domain using Namecheap API.
   */
  private async namecheapRegisterDomain(
    domain: string,
    registrant: any,
    years: number,
  ): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    const apiUser = this.configService.get<string>('NAMECHEAP_API_USER');
    const apiKey = this.configService.get<string>('NAMECHEAP_API_KEY');
    const username = this.configService.get<string>('NAMECHEAP_USERNAME');
    const clientIp = this.configService.get<string>('NAMECHEAP_CLIENT_IP');
    const sandbox = this.configService.get<string>('NAMECHEAP_SANDBOX') === 'true';

    if (!apiUser || !apiKey || !username || !clientIp) {
      this.logger.error('Namecheap API credentials are not configured.');
      return { success: false, error: 'Namecheap credentials missing' };
    }

    const baseUrl = sandbox
      ? 'https://api.sandbox.namecheap.com/xml.response'
      : 'https://api.namecheap.com/xml.response';

    try {
      const response = await axios.get(baseUrl, {
        params: {
          ApiUser: apiUser,
          ApiKey: apiKey,
          UserName: username,
          ClientIp: clientIp,
          Command: 'namecheap.domains.create',
          DomainName: domain,
          Years: years,
          RegistrantFirstName: registrant.firstName,
          RegistrantLastName: registrant.lastName,
          RegistrantAddress1: registrant.address1,
          RegistrantCity: registrant.city,
          RegistrantStateProvince: registrant.state,
          RegistrantPostalCode: registrant.postalCode,
          RegistrantCountry: registrant.country,
          RegistrantPhone: registrant.phone,
          RegistrantEmailAddress: registrant.email,
          TechFirstName: registrant.firstName,
          TechLastName: registrant.lastName,
          TechAddress1: registrant.address1,
          TechCity: registrant.city,
          TechStateProvince: registrant.state,
          TechPostalCode: registrant.postalCode,
          TechCountry: registrant.country,
          TechPhone: registrant.phone,
          TechEmailAddress: registrant.email,
          AdminFirstName: registrant.firstName,
          AdminLastName: registrant.lastName,
          AdminAddress1: registrant.address1,
          AdminCity: registrant.city,
          AdminStateProvince: registrant.state,
          AdminPostalCode: registrant.postalCode,
          AdminCountry: registrant.country,
          AdminPhone: registrant.phone,
          AdminEmailAddress: registrant.email,
          AuxBillingFirstName: registrant.firstName,
          AuxBillingLastName: registrant.lastName,
          AuxBillingAddress1: registrant.address1,
          AuxBillingCity: registrant.city,
          AuxBillingStateProvince: registrant.state,
          AuxBillingPostalCode: registrant.postalCode,
          AuxBillingCountry: registrant.country,
          AuxBillingPhone: registrant.phone,
          AuxBillingEmailAddress: registrant.email,
        },
      });

      const xmlData = response.data as string;
      const success = xmlData.includes('<CommandResponse Type="namecheap.domains.create">');

      if (success) {
        // Extract order ID from XML (simplified; use real XML parser)
        const orderIdMatch = xmlData.match(/OrderID="(\d+)"/);
        const orderId = orderIdMatch ? orderIdMatch[1] : 'unknown';

        this.logger.log(`Namecheap domain registration successful for ${domain}, OrderID: ${orderId}`);
        return { success: true, orderId };
      } else {
        this.logger.error(`Namecheap domain registration failed for ${domain}`);
        return { success: false, error: 'Registration failed' };
      }
    } catch (err: any) {
      this.logger.error(`Namecheap domain registration error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * GoDaddy: Check domain availability (placeholder).
   */
  private async godaddyCheckAvailability(domain: string): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
  }> {
    this.logger.warn(`GoDaddy provider not yet implemented. Domain: ${domain}`);
    // TODO: Implement GoDaddy API call using GODADDY_API_KEY and GODADDY_API_SECRET
    return { available: false };
  }

  /**
   * GoDaddy: Register domain (placeholder).
   */
  private async godaddyRegisterDomain(
    domain: string,
    registrant: any,
    years: number,
  ): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    this.logger.warn(`GoDaddy provider not yet implemented. Domain: ${domain}`);
    // TODO: Implement GoDaddy domain registration API
    return { success: false, error: 'GoDaddy not implemented' };
  }

  /**
   * ResellerClub: Check domain availability (placeholder).
   */
  private async resellerclubCheckAvailability(domain: string): Promise<{
    available: boolean;
    price?: number;
    currency?: string;
  }> {
    this.logger.warn(`ResellerClub provider not yet implemented. Domain: ${domain}`);
    // TODO: Implement ResellerClub API call
    return { available: false };
  }

  /**
   * ResellerClub: Register domain (placeholder).
   */
  private async resellerclubRegisterDomain(
    domain: string,
    registrant: any,
    years: number,
  ): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> {
    this.logger.warn(`ResellerClub provider not yet implemented. Domain: ${domain}`);
    // TODO: Implement ResellerClub domain registration API
    return { success: false, error: 'ResellerClub not implemented' };
  }
}
