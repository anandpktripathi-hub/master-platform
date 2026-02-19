import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsMenuService } from '../services/cms-menu.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('CMS - Menus')
@Controller('cms/menus/:menuId')
export class CmsMenuController {
  constructor(private readonly menuService: CmsMenuService) {}

  @Post('items')
  async createItem(
    @Tenant() tenantId: string,
    @Param('menuId') menuId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.createMenuItem(tenantId, menuId, dto);
  }

  @Get('items')
  async getMenu(@Tenant() tenantId: string, @Param('menuId') menuId: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.getMenu(tenantId, menuId);
  }

  @Get('tree')
  async getMenuTree(
    @Tenant() tenantId: string,
    @Param('menuId') menuId: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.buildMenuTree(tenantId, menuId);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Tenant() tenantId: string,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Body() dto: Partial<CreateMenuItemDto>,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.updateMenuItem(tenantId, itemId, dto);
  }

  @Delete('items/:itemId')
  async deleteItem(
    @Tenant() tenantId: string,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.deleteMenuItem(tenantId, itemId);
  }

  @Post('reorder')
  async reorderItems(
    @Tenant() tenantId: string,
    @Param('menuId') menuId: string,
    @Body('order') order: { id: string; order: number }[],
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.menuService.reorderMenu(tenantId, menuId, order);
  }
}
