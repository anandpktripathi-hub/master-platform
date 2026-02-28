import type {
  FeatureSet,
  PackageLimits,
} from '../../../database/schemas/package.schema';

export class CreatePackageDto {
  name!: string;
  description?: string;
  price!: number;
  billingCycle!: 'monthly' | 'annual' | 'lifetime';
  trialDays?: number;
  featureSet!: FeatureSet;
  limits!: PackageLimits;
  order?: number;
  expiryWarningDays?: number;
}

export class UpdatePackageDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: 'monthly' | 'annual' | 'lifetime';
  trialDays?: number;
  isActive?: boolean;
  featureSet?: Partial<FeatureSet>;
  limits?: Partial<PackageLimits>;
  order?: number;
  expiryWarningDays?: number;
}

export class AssignPackageDto {
  packageId!: string;
  tenantId!: string;
  startTrial?: boolean;
  notes?: string;
}
