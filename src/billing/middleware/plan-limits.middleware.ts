import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SubscriptionsService } from '../services/subscriptions.service';
import { PlansService } from '../services/plans.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

/**
 * Middleware to enforce plan limits on tenant operations
 * Checks if tenant has exceeded their plan limits before allowing requests to:
 * - POST /users (create user)
 * - POST /products (create product)
 * - POST /orders (create order)
 */
@Injectable()
export class PlanLimitsMiddleware implements NestMiddleware {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private plansService: PlansService,
    @InjectModel('User') private userModel: Model<any>,
    @InjectModel('Product') private productModel: Model<any>,
    @InjectModel('Order') private orderModel: Model<any>,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    // Only check limits for tenant operations that create resources
    const method = request.method;
    const path = request.path;

    // Identify which routes need limit checking
    const isCreateUserRoute = method === 'POST' && path === '/users';
    const isCreateProductRoute = method === 'POST' && path === '/products';
    const isCreateOrderRoute = method === 'POST' && path === '/orders';

    if (!isCreateUserRoute && !isCreateProductRoute && !isCreateOrderRoute) {
      return next();
    }

    // Get tenant ID from request
    const tenantId =
      (request as any).tenantId ||
      ((request as any).user && (request as any).user.tenantId);
    if (!tenantId) {
      return next(); // No tenant context, allow through
    }

    try {
      // Get tenant's current subscription
      const subscription =
        await this.subscriptionsService.findActiveByTenantId(tenantId);

      if (!subscription) {
        // No active subscription, reject request
        throw new HttpException(
          {
            statusCode: HttpStatus.PAYMENT_REQUIRED,
            message: 'Active subscription required to use this feature',
            error: 'NO_SUBSCRIPTION',
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      // Get the plan details
      const plan = await this.plansService.findById(
        subscription.planId.toString(),
      );

      if (!plan) {
        // Plan not found (shouldn't happen), allow through
        return next();
      }

      // Check limits based on route
      if (isCreateUserRoute) {
        await this._checkUserLimit(tenantId, plan);
      } else if (isCreateProductRoute) {
        await this._checkProductLimit(tenantId, plan);
      } else if (isCreateOrderRoute) {
        await this._checkOrderLimit(tenantId, plan);
      }

      // All checks passed, continue
      next();
    } catch (error: any) {
      // If it's already an HTTP exception, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Plan limits middleware error:', error);
      // On unexpected errors, allow through (don't block critical operations)
      next();
    }
  }

  /**
   * Check if tenant has exceeded user limit
   */
  private async _checkUserLimit(tenantId: string, plan: any) {
    if (
      !('userLimit' in plan) ||
      plan.userLimit === undefined ||
      plan.userLimit === null ||
      plan.userLimit === -1
    ) {
      // No limit
      return;
    }

    const userCount = await this.userModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (userCount >= (plan.userLimit as number)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: `User limit (${plan.userLimit}) exceeded. Upgrade your plan to add more users.`,
          error: 'USER_LIMIT_EXCEEDED',
          currentCount: userCount,
          limit: plan.userLimit,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Check if tenant has exceeded product limit
   */
  private async _checkProductLimit(tenantId: string, plan: any) {
    if (
      !('productsLimit' in plan) ||
      plan.productsLimit === undefined ||
      plan.productsLimit === null ||
      plan.productsLimit === -1
    ) {
      // No limit
      return;
    }

    const productCount = await this.productModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (productCount >= (plan.productsLimit as number)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: `Product limit (${plan.productsLimit}) exceeded. Upgrade your plan to add more products.`,
          error: 'PRODUCT_LIMIT_EXCEEDED',
          currentCount: productCount,
          limit: plan.productsLimit,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  /**
   * Check if tenant has exceeded order limit
   */
  private async _checkOrderLimit(tenantId: string, plan: any) {
    if (
      !('ordersLimit' in plan) ||
      plan.ordersLimit === undefined ||
      plan.ordersLimit === null ||
      plan.ordersLimit === -1
    ) {
      // No limit
      return;
    }

    const orderCount = await this.orderModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (orderCount >= (plan.ordersLimit as number)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: `Order limit (${plan.ordersLimit}) exceeded. Upgrade your plan to process more orders.`,
          error: 'ORDER_LIMIT_EXCEEDED',
          currentCount: orderCount,
          limit: plan.ordersLimit,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
