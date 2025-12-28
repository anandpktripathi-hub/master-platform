/*
 * Type definitions for multi-tenant SaaS platform
 * Matches backend schemas and API responses
 */

// ============================================================================
// DOMAIN TYPES - ALL EXPORTED
// ============================================================================
export type DomainType = 'path' | 'subdomain';
export interface Domain {
  _id: string;
  tenantId: string;
  type: DomainType;
  value: string;
  status: DomainStatus;
  isPrimary: boolean;
  computedUrl?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
export interface ProvisioningLog {
  _id?: string;
  domainId?: string;
  customDomainId?: string;
  type: ProvisioningResourceType;
  status: string;
  message?: string;
  step?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}
export type ProvisioningResourceType = 'domain' | 'custom-domain';
export type VerificationMethod = 'TXT' | 'CNAME';
export interface CustomDomain {
  _id: string;
  tenantId: string;
  domain: string;
  status: CustomDomainStatus;
  verificationMethod: VerificationMethod;
  verificationToken?: string;
  dnsTarget?: string;
  dnsInstructions?: {
    type: string;
    host: string;
    value: string;
    description: string;
  }[];
  verifiedAt?: string;
  isPrimary: boolean;
  sslStatus?: 'pending' | 'issued' | 'expired' | 'failed';
  sslIssuedAt?: string;
  sslExpiresAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Removed duplicate and malformed declarations

export interface Domain {
  _id: string;
  tenantId: string;
  type: DomainType;
  value: string;
  status: DomainStatus;
  isPrimary: boolean;
  computedUrl?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDomainDto {
  type: DomainType;
  value: string;
}

export interface UpdateDomainDto {
  status?: DomainStatus;
}

export interface DomainAvailability {
  available: boolean;
  message?: string;
}

// Provisioning / status logs for domain-related workflows
export interface ProvisioningLog {
  _id?: string;
  domainId?: string;
  customDomainId?: string;
  type: ProvisioningResourceType;
  status: string;
  message?: string;
  step?: string;
  createdAt: string;
  meta?: Record<string, any>;
}

export type ProvisioningResourceType = 'domain' | 'custom-domain';

// ============================================================================
// CUSTOM DOMAIN TYPES
// ============================================================================

export type CustomDomainStatus =
  | 'pending_verification'
  | 'verified'
  | 'ssl_pending'
  | 'ssl_issued'
  | 'active'
  | 'suspended'
  | 'failed';

export type VerificationMethod = 'TXT' | 'CNAME';

export interface CustomDomain {
  _id: string;
  tenantId: string;
  domain: string;
  status: CustomDomainStatus;
  verificationMethod: VerificationMethod;
  verificationToken?: string;
  dnsTarget?: string;
  dnsInstructions?: {
    type: string;
    host: string;
    value: string;
    description: string;
  }[];
  verifiedAt?: string;
  isPrimary: boolean;
  sslStatus?: 'pending' | 'issued' | 'expired' | 'failed';
  sslIssuedAt?: string;
  sslExpiresAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomDomainDto {
  domain: string;
  verificationMethod: VerificationMethod;
}

export interface UpdateCustomDomainDto {
  status?: CustomDomainStatus;
}

export type UserRole = 'PLATFORM_SUPERADMIN' | 'TENANT_ADMIN' | 'TENANT_STAFF' | 'CUSTOMER';


export interface VerifyCustomDomainDto {
  method: VerificationMethod;
}

// ============================================================================
// PACKAGE TYPES
// ============================================================================

export type BillingCycle = 'monthly' | 'annual' | 'lifetime';

export interface PackageFeatures {
  allowPathDomain?: boolean;
  allowSubdomain?: boolean;
  allowCustomDomain?: boolean;
  brandingRemoval?: boolean;
  advancedAnalytics?: boolean;
  customTheme?: boolean;
  api?: boolean;
  prioritySupport?: boolean;
  whiteLabel?: boolean;
  customIntegrations?: boolean;
}

export interface PackageLimits {
  maxDomains?: number;
  maxCustomDomains?: number;
  maxSubdomains?: number;
  maxPaths?: number;
  maxStorageMb?: number;
  maxTeamMembers?: number;
  maxPages?: number;
  maxApiCalls?: number;
}

export interface Package {
  _id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  trialDays: number;
  featureSet: PackageFeatures;
  limits: PackageLimits;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  trialDays?: number;
  featureSet: PackageFeatures;
  limits: PackageLimits;
  isActive?: boolean;
  order?: number;
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  trialDays?: number;
  featureSet?: PackageFeatures;
  limits?: PackageLimits;
  isActive?: boolean;
  order?: number;
}

export type TenantPackageStatus = 'trial' | 'active' | 'expired' | 'suspended';

export interface TenantPackage {
  _id: string;
  tenantId: string;
  packageId: string;
  package?: Package; // Populated
  status: TenantPackageStatus;
  startedAt: string;
  expiresAt?: string;
  trialEndsAt?: string;
  usageCounters: {
    domains?: number;
    customDomains?: number;
    subdomains?: number;
    paths?: number;
    storageMb?: number;
    teamMembers?: number;
    pages?: number;
    apiCalls?: number;
  };
  overrides?: {
    features?: PackageFeatures;
    limits?: PackageLimits;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssignPackageDto {
  tenantId: string;
  startTrial?: boolean;
}

export interface PackageUsage {
  package: Package;
  tenantPackage: TenantPackage;
  usage: {
    [key: string]: number;
  };
  limits: {
    [key: string]: number;
  };
  utilization: {
    [key: string]: number; // Percentage (0-100)
  };
}

// ============================================================================
// COUPON TYPES
// ============================================================================

export type CouponType = 'single' | 'multi';
export type DiscountType = 'percent' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  discountType: DiscountType;
  amount: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  maxUsesPerTenant?: number;
  currentUses: number;
  applicablePackageIds: string[];
  isPrivate: boolean;
  allowedTenantIds: string[];
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDto {
  code: string;
  type: CouponType;
  discountType: DiscountType;
  amount: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  maxUsesPerTenant?: number;
  applicablePackageIds?: string[];
  isPrivate?: boolean;
  allowedTenantIds?: string[];
  status?: CouponStatus;
}

export interface UpdateCouponDto {
  code?: string;
  type?: CouponType;
  discountType?: DiscountType;
  amount?: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  maxUsesPerTenant?: number;
  applicablePackageIds?: string[];
  isPrivate?: boolean;
  allowedTenantIds?: string[];
  status?: CouponStatus;
}

export interface ValidateCouponDto {
  code: string;
  packageId: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  couponId?: string;
  discount?: number;
  discountType?: DiscountType;
  message?: string;
}

export interface ApplyCouponDto {
  code: string;
}

export interface CouponUsage {
  _id: string;
  couponId: string;
  coupon?: Coupon; // Populated
  tenantId: string;
  packageId?: string;
  discountAmount: number;
  appliedAt: string;
}

export interface CouponStats {
  totalUses: number;
  remainingUses: number | null; // null if unlimited
  uniqueTenants: number;
  totalDiscountGiven: number;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditLogStatus = 'success' | 'failure' | 'pending';

export interface AuditLog {
  _id: string;
  actorId: string;
  tenantId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: string[];
  status: AuditLogStatus;
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export type UserRole = 'PLATFORM_SUPERADMIN' | 'TENANT_ADMIN' | 'TENANT_STAFF' | 'CUSTOMER';

export interface User {
  _id: string;
  id?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  tenantId?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface ApiError {
  type: 'AUTH_ERROR' | 'PERMISSION_ERROR' | 'VALIDATION_ERROR' | 'CONFLICT_ERROR' | 'NOT_FOUND_ERROR' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  status?: number;
  details?: Record<string, any>;
  data?: T;
  error?: string | { message?: string };
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
