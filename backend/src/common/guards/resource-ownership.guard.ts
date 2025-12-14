import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';

type TenantOwnedDoc = { tenantId?: Types.ObjectId | string | null };

/**
 * ResourceOwnershipGuard
 *
 * Validates that a resource (by ID in params) belongs to the authenticated user's tenant.
 * Prevents cross-tenant data access even if the user knows another tenant's resource ID.
 *
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, TenantGuard, ResourceOwnershipGuard)
 * @Get(':id')
 * async findOne(@Param('id') id: string) {
 *   // ResourceOwnershipGuard ensures this resource belongs to user's tenant
 * }
 * ```
 *
 * Configuration:
 * - Reads resource ID from route params (configurable via metadata)
 * - Reads model name from metadata (e.g., 'Product', 'Order')
 * - Verifies resource.tenantId === req.user.tenantId
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnershipGuard.name);

  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<TenantOwnedDoc>,
    @InjectModel('Order') private readonly orderModel: Model<TenantOwnedDoc>,
    @InjectModel('Category')
    private readonly categoryModel: Model<TenantOwnedDoc>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as {
      userId?: string;
      tenantId?: string;
      role?: string;
    };
    const resourceId = req.params.id;

    // Skip check for super admin
    if (user?.role === 'PLATFORM_SUPER_ADMIN') {
      return true;
    }

    // Must have tenantId
    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Must have resource ID in params
    if (!resourceId) {
      this.logger.warn(
        'ResourceOwnershipGuard: No resource ID found in params',
      );
      return true; // Let controller handle missing ID
    }

    // Get model from metadata (simplified - in production, use Reflector)
    const routeObj = req.route as { path?: unknown } | undefined;
    const routePath = typeof routeObj?.path === 'string' ? routeObj.path : '';
    let model: Model<TenantOwnedDoc> | null = null;

    if (routePath.includes('/products')) {
      model = this.productModel;
    } else if (routePath.includes('/orders')) {
      model = this.orderModel;
    } else if (routePath.includes('/categories')) {
      model = this.categoryModel;
    }

    if (!model) {
      this.logger.debug(
        `ResourceOwnershipGuard: No model configured for path ${routePath}`,
      );
      return true; // No validation for this resource type
    }

    // Verify resource belongs to tenant
    try {
      const resource = await model
        .findById(resourceId)
        .select('tenantId')
        .lean();

      if (!resource) {
        throw new ForbiddenException('Resource not found');
      }

      if (resource.tenantId?.toString() !== user.tenantId) {
        this.logger.warn(
          `ResourceOwnershipGuard: User ${user.userId} (tenant ${user.tenantId}) attempted to access resource ${resourceId} (tenant ${String(resource.tenantId)})`,
        );
        throw new ForbiddenException(
          'Access denied: resource belongs to another tenant',
        );
      }

      this.logger.debug(
        `ResourceOwnershipGuard: Validated ownership of resource ${resourceId} for tenant ${user.tenantId}`,
      );
      return true;
    } catch (error: unknown) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      const details = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `ResourceOwnershipGuard: Error validating resource ownership: ${details}`,
      );
      throw new ForbiddenException('Unable to validate resource ownership');
    }
  }
}
