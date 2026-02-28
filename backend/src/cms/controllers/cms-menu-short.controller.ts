import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  private readonly logger = new Logger(CmsMenuShortController.name);

  constructor(private readonly menuService: CmsMenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get CMS menu items for the current tenant' })
  @ApiResponse({ status: 200, description: 'Menu items returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
      const error = err as any;
      this.logger.error(
        `[getMenu] ${error?.message ?? String(error)}`,
        error?.stack,
      );
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch menu');
    }
  }
}
