import { Injectable } from '@nestjs/common';
import { FeatureRegistryService } from '../feature-registry/featureRegistry.service';

@Injectable()
export class FeatureAccessService {
  constructor(private readonly featureRegistry: FeatureRegistryService) {}

  /**
   * Check if a user with given roles and tenant has access to a feature
   */
  hasAccess(
    featureId: string,
    userRoles: string[],
    userTenant: string,
  ): boolean {
    const feature = this.featureRegistry.findById(featureId);
    if (!feature || !feature.enabled) return false;

    // If no restrictions, allow access
    const noRoleRestriction =
      !feature.allowedRoles || feature.allowedRoles.length === 0;
    const noTenantRestriction =
      !feature.allowedTenants || feature.allowedTenants.length === 0;

    if (noRoleRestriction && noTenantRestriction) return true;

    // Check role access
    const hasRoleAccess =
      noRoleRestriction ||
      userRoles.some((role) => feature.allowedRoles?.includes(role));

    // Check tenant access
    const hasTenantAccess =
      noTenantRestriction || feature.allowedTenants?.includes(userTenant);

    return Boolean(hasRoleAccess) && Boolean(hasTenantAccess);
  }

  /**
   * Get all features accessible by a user
   */
  getAccessibleFeatures(userRoles: string[], userTenant: string) {
    const allFeatures = this.featureRegistry.getAll();
    return this.filterAccessible(allFeatures, userRoles, userTenant);
  }

  private filterAccessible(
    features: any[],
    userRoles: string[],
    userTenant: string,
  ): any[] {
    return features
      .filter((feature) => this.hasAccess(feature.id, userRoles, userTenant))
      .map((feature) => ({
        ...feature,
        children: feature.children
          ? this.filterAccessible(feature.children, userRoles, userTenant)
          : [],
      }));
  }
}
