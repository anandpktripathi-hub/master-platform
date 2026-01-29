import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branding } from '../entities/branding.entity';

@Injectable()
export class BrandingService {
  constructor(
    @InjectRepository(Branding)
    private readonly brandingRepo: Repository<Branding>,
  ) {}

  async getBrandingByTenant(tenantId: string): Promise<Branding | null> {
    return this.brandingRepo.findOne({ where: { tenantId } });
  }

  async updateBranding(tenantId: string, dto: any): Promise<Branding | null> {
    await this.brandingRepo.update({ tenantId }, dto);
    return this.getBrandingByTenant(tenantId);
  }
}
