import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { CouponService } from './services/coupon.service';
import { objectIdToString } from '../../common/utils/objectid.util';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApplyCouponDto,
  BulkUpdateCouponStatusDto,
  ValidateCouponDto,
} from './dto/coupon-actions.dto';
import { CouponIdParamDto } from './dto/coupon-id-param.dto';
@ApiTags('Coupons')
@ApiBearerAuth('bearer')
@Controller('coupons')
export class CouponController {
  private readonly logger = new Logger(CouponController.name);

  constructor(private couponService: CouponService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Validate a coupon code
   */
  @Post('validate')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Validate a coupon code (tenant)' })
  @ApiResponse({ status: 200, description: 'Validation result returned' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async validateCoupon(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string | undefined,
    @Body() dto: ValidateCouponDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.couponService.validateCoupon(
        dto.code,
        objectIdToString(tenantId),
        dto.packageId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[validateCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to validate coupon');
    }
  }

  /**
   * Apply coupon during upgrade/checkout
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Apply a coupon during checkout (tenant)' })
  @ApiResponse({ status: 200, description: 'Coupon applied' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async applyCoupon(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string | undefined,
    @Body() dto: ApplyCouponDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.couponService.applyCoupon(
        dto.code,
        objectIdToString(tenantId),
        'checkout',
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[applyCoupon] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to apply coupon');
    }
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * List all coupons
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List all coupons (platform admin)' })
  @ApiResponse({ status: 200, description: 'Coupons returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listCoupons(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    try {
      return await this.couponService.listCoupons({
        status,
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listCoupons] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list coupons');
    }
  }

  /**
   * Create a new coupon
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Create a new coupon (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCoupon(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateCouponDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.couponService.createCoupon(createDto, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create coupon');
    }
  }

  /**
   * Update a coupon
   */
  @Patch(':couponId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update a coupon (platform admin)' })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCoupon(
    @Request() req: RequestWithUser,
    @Param() params: CouponIdParamDto,
    @Body() updateDto: UpdateCouponDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.couponService.updateCoupon(
        params.couponId,
        updateDto,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update coupon');
    }
  }

  /**
   * Delete a coupon
   */
  @Delete(':couponId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a coupon (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteCoupon(
    @Request() req: RequestWithUser,
    @Param() params: CouponIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      await this.couponService.deleteCoupon(params.couponId, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete coupon');
    }
  }

  /**
   * Get coupon usage statistics
   */
  @Get(':couponId/usage')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get coupon usage statistics (platform admin)' })
  @ApiResponse({ status: 200, description: 'Coupon stats returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCouponStats(@Param() params: CouponIdParamDto) {
    try {
      return await this.couponService.getCouponStats(params.couponId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getCouponStats] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch coupon stats');
    }
  }

  /**
   * Activate coupon
   */
  @Post(':couponId/activate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Activate a coupon (platform admin)' })
  @ApiResponse({ status: 200, description: 'Coupon activated' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async activateCoupon(
    @Request() req: RequestWithUser,
    @Param() params: CouponIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.couponService.updateCoupon(
        params.couponId,
        { status: 'active' },
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[activateCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to activate coupon');
    }
  }

  /**
   * Deactivate coupon
   */
  @Post(':couponId/deactivate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Deactivate a coupon (platform admin)' })
  @ApiResponse({ status: 200, description: 'Coupon deactivated' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deactivateCoupon(
    @Request() req: RequestWithUser,
    @Param() params: CouponIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.couponService.updateCoupon(
        params.couponId,
        { status: 'inactive' },
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deactivateCoupon] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to deactivate coupon');
    }
  }

  /**
   * Bulk activate/deactivate coupons
   */
  @Post('bulk-actions/update-status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Bulk activate/deactivate coupons (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async bulkUpdateCoupons(
    @Request() req: RequestWithUser,
    @Body() body: BulkUpdateCouponStatusDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      await this.couponService.bulkUpdateStatus(
        body.couponIds,
        body.status,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[bulkUpdateCoupons] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update coupon status');
    }
  }
}
