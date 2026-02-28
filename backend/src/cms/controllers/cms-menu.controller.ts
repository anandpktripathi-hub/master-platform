import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CmsMenuService } from '../services/cms-menu.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  CmsMenuIdParamDto,
  CmsMenuItemIdParamDto,
  ReorderMenuItemsDto,
  UpdateMenuItemDto,
} from '../dto/cms-menu.dto';

@ApiTags('CMS - Menus')
@ApiBearerAuth('bearer')
@Controller('cms/menus/:menuId')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('admin')
export class CmsMenuController {
  private readonly logger = new Logger(CmsMenuController.name);

  constructor(private readonly menuService: CmsMenuService) {}

  @Post('items')
  @ApiOperation({ summary: 'Create a menu item' })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createItem(
    @Tenant() tenantId: string,
    @Param() params: CmsMenuIdParamDto,
    @Body() dto: CreateMenuItemDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.createMenuItem(tenantId, params.menuId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createItem] Failed (tenantId=${tenantId}, menuId=${params?.menuId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('items')
  @ApiOperation({ summary: 'Get menu items' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMenu(@Tenant() tenantId: string, @Param() params: CmsMenuIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.getMenu(tenantId, params.menuId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMenu] Failed (tenantId=${tenantId}, menuId=${params?.menuId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get menu tree' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMenuTree(
    @Tenant() tenantId: string,
    @Param() params: CmsMenuIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.buildMenuTree(tenantId, params.menuId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMenuTree] Failed (tenantId=${tenantId}, menuId=${params?.menuId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateItem(
    @Tenant() tenantId: string,
    @Param() params: CmsMenuItemIdParamDto,
    @Body() dto: UpdateMenuItemDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.updateMenuItem(tenantId, params.itemId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateItem] Failed (tenantId=${tenantId}, menuId=${params?.menuId}, itemId=${params?.itemId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteItem(
    @Tenant() tenantId: string,
    @Param() params: CmsMenuItemIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.deleteMenuItem(tenantId, params.itemId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteItem] Failed (tenantId=${tenantId}, menuId=${params?.menuId}, itemId=${params?.itemId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder menu items' })
  @ApiBody({ type: ReorderMenuItemsDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async reorderItems(
    @Tenant() tenantId: string,
    @Param() params: CmsMenuIdParamDto,
    @Body() body: ReorderMenuItemsDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.menuService.reorderMenu(tenantId, params.menuId, body.order);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[reorderItems] Failed (tenantId=${tenantId}, menuId=${params?.menuId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
