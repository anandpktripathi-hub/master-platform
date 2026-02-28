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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApplyCouponDto,
  BulkUpdateCouponStatusDto,
  ValidateCouponDto,
} from './dto/coupon-actions.dto';
@ApiTags('Coupons')
@ApiBearerAuth('bearer')
@Controller('coupons')
export class CouponController {
  constructor(private couponService: CouponService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Validate a coupon code
   */
  @Post('validate')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async validateCoupon(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string | undefined,
    @Body() dto: ValidateCouponDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.couponService.validateCoupon(
      dto.code,
      objectIdToString(tenantId),
      dto.packageId,
    );
  }

  /**
   * Apply coupon during upgrade/checkout
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async applyCoupon(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string | undefined,
    @Body() dto: ApplyCouponDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.couponService.applyCoupon(
      dto.code,
      objectIdToString(tenantId),
      'checkout',
    );
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
  async listCoupons(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.couponService.listCoupons({
      status,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  /**
   * Create a new coupon
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async createCoupon(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateCouponDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.couponService.createCoupon(createDto, userId);
  }

  /**
   * Update a coupon
   */
  @Patch(':couponId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async updateCoupon(
    @Request() req: RequestWithUser,
    @Param('couponId') couponId: string,
    @Body() updateDto: UpdateCouponDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.couponService.updateCoupon(couponId, updateDto, userId);
  }

  /**
   * Delete a coupon
   */
  @Delete(':couponId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  async deleteCoupon(
    @Request() req: RequestWithUser,
    @Param('couponId') couponId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    await this.couponService.deleteCoupon(couponId, userId);
  }

  /**
   * Get coupon usage statistics
   */
  @Get(':couponId/usage')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async getCouponStats(@Param('couponId') couponId: string) {
    return this.couponService.getCouponStats(couponId);
  }

  /**
   * Activate coupon
   */
  @Post(':couponId/activate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async activateCoupon(
    @Request() req: RequestWithUser,
    @Param('couponId') couponId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.couponService.updateCoupon(
      couponId,
      { status: 'active' },
      userId,
    );
  }

  /**
   * Deactivate coupon
   */
  @Post(':couponId/deactivate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async deactivateCoupon(
    @Request() req: RequestWithUser,
    @Param('couponId') couponId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.couponService.updateCoupon(
      couponId,
      { status: 'inactive' },
      userId,
    );
  }

  /**
   * Bulk activate/deactivate coupons
   */
  @Post('bulk-actions/update-status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  async bulkUpdateCoupons(
    @Request() req: RequestWithUser,
    @Body() body: BulkUpdateCouponStatusDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    await this.couponService.bulkUpdateStatus(
      body.couponIds,
      body.status,
      userId,
    );
  }
}
