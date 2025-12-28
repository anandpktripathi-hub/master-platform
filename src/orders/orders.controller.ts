import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Permissions(Permission.MANAGE_TENANT_ORDERS)
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const user = req.user;
    return this.ordersService.create(
      createOrderDto,
      user.userId,
      user.tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ) {
    const user = req.user;
    return this.ordersService.findAll(
      user.tenantId,
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders by customer ID' })
  @ApiResponse({ status: 200, description: 'Customer orders retrieved' })
  findByCustomer(@Param('customerId') customerId: string, @Request() req) {
    const user = req.user;
    return this.ordersService.findByCustomer(customerId, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ordersService.findById(id, user.tenantId);
  }

  @Put(':id/status')
  @Permissions(Permission.MANAGE_TENANT_ORDERS)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
      user.tenantId,
    );
  }

  @Put(':id/cancel')
  @Permissions(Permission.MANAGE_TENANT_ORDERS)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancel(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.ordersService.cancel(id, user.tenantId);
  }
}
