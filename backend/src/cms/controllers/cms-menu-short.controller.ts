import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CmsMenuService } from '../services/cms-menu.service';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { GetMenuQueryDto } from '../dto/get-menu.query.dto';

@ApiTags('CMS - Menu')
@ApiBearerAuth()
@Controller('cms/menu')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class CmsMenuShortController {
  constructor(private readonly menuService: CmsMenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get CMS menu items for the current tenant' })
  async getMenu(@Tenant() tenantId: string, @Query() query: GetMenuQueryDto) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');

    try {
      const menuId = query.menuId;
      const resolvedMenuId =
        typeof menuId === 'string' && menuId.trim().length > 0
          ? menuId
          : 'main';

      const menuItems = await this.menuService.getMenu(tenantId, resolvedMenuId);
      return { menuItems };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch menu');
    }
  }
}
