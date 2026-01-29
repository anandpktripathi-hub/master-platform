import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureAccessService } from './featureAccess.service';

export const RequireFeature = (featureId: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('featureId', featureId, descriptor.value);
    }
    return descriptor;
  };
};

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const featureId = this.reflector.get<string>('featureId', context.getHandler());
    if (!featureId) return true; // No feature restriction

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming auth middleware sets this

    if (!user) return false;

    const userRoles = user.roles || [];
    const userTenant = user.tenantId || '';

    return this.featureAccessService.hasAccess(featureId, userRoles, userTenant);
  }
}
