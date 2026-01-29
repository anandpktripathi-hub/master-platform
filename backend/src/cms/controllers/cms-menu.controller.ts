import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsMenuService } from '../services/cms-menu.service';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';

@ApiTags('CMS - Menus')
@Controller('api/cms/menus/:menuId')
export class CmsMenuController {
  constructor(private readonly menuService: CmsMenuService) {}

  @Post('items')
  async createItem(
    @Req() req: any,
    @Param('menuId') menuId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.createMenuItem(tenantId, menuId, dto);
  }

  @Get('items')
  async getMenu(@Req() req: any, @Param('menuId') menuId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.getMenu(tenantId, menuId);
  }

  @Get('tree')
  async getMenuTree(@Req() req: any, @Param('menuId') menuId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.buildMenuTree(tenantId, menuId);
  }

  @Patch('items/:itemId')
  async updateItem(
    @Req() req: any,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
    @Body() dto: Partial<CreateMenuItemDto>,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.updateMenuItem(tenantId, itemId, dto);
  }

  @Delete('items/:itemId')
  async deleteItem(
    @Req() req: any,
    @Param('menuId') menuId: string,
    @Param('itemId') itemId: string,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.deleteMenuItem(tenantId, itemId);
  }

  @Post('reorder')
  async reorderItems(
    @Req() req: any,
    @Param('menuId') menuId: string,
    @Body('order') order: { id: string; order: number }[],
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.menuService.reorderMenu(tenantId, menuId, order);
  }
}
