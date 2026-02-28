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
  Req,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CmsPageService } from '../services/cms-page.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PageIdParamDto, PageSlugParamDto } from '../dto/page-params.dto';
// import { TenantGuard } from '../../common/guards/tenant.guard';
// import { RbacGuard } from '../../common/guards/rbac.guard';

@ApiTags('CMS - Pages')
@ApiBearerAuth()
@Controller('cms/pages')
// @UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
export class CmsPageController {
  constructor(private readonly pageService: CmsPageService) {}

  private readonly logger = new Logger(CmsPageController.name);

  private requireTenantId(tenantId: string | undefined | null): string {
    if (!tenantId) {
      throw new BadRequestException('Tenant context missing');
    }
    return tenantId;
  }

  private requireUserId(req: any): string {
    const userId =
      req?.user?.userId ??
      req?.user?.sub ??
      req?.user?.id ??
      (typeof req?.user?._id === 'string' ? req.user._id : undefined);
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return String(userId);
  }

  private getUserRoles(req: any): string[] {
    const roles = req?.user?.roles;
    if (Array.isArray(roles)) return roles.map(String);
    const role = req?.user?.role;
    return role ? [String(role)] : [];
  }

  /**
   * CREATE PAGE
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a CMS page (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body() dto: CreatePageDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      return await this.pageService.createPage(resolvedTenantId, userId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createPage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create page');
    }
  }

  /**
   * GET ALL PAGES (with filtering)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get CMS pages (with filtering) (tenant)' })
  @ApiResponse({ status: 200, description: 'Pages returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPages(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Query() query: PageQueryDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      const userRoles = this.getUserRoles(req);
      return await this.pageService.getPages(
        resolvedTenantId,
        userId,
        userRoles,
        query,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getPages] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch pages');
    }
  }

  /**
   * GET SINGLE PAGE BY ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a CMS page by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Page returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPageById(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param() params: PageIdParamDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      const userRoles = this.getUserRoles(req);
      return await this.pageService.getPageById(
        resolvedTenantId,
        params.id,
        userId,
        userRoles,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPageById] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch page');
    }
  }

  /**
   * GET PAGE BY SLUG (public endpoint, no auth needed)
   */
  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a CMS page by slug (public)' })
  @ApiResponse({ status: 200, description: 'Page returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPageBySlug(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param() params: PageSlugParamDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      return await this.pageService.getPageBySlug(
        resolvedTenantId,
        params.slug,
        req?.user?.userId ? String(req.user.userId) : undefined,
        this.getUserRoles(req),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPageBySlug] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch page');
    }
  }

  /**
   * UPDATE PAGE
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a CMS page (tenant)' })
  @ApiResponse({ status: 200, description: 'Page updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updatePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param() params: PageIdParamDto,
    @Body() dto: UpdatePageDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      return await this.pageService.updatePage(
        resolvedTenantId,
        userId,
        params.id,
        dto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updatePage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update page');
    }
  }

  /**
   * DELETE PAGE
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a CMS page (tenant)' })
  @ApiResponse({ status: 200, description: 'Page deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deletePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param() params: PageIdParamDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      return await this.pageService.deletePage(
        resolvedTenantId,
        userId,
        params.id,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deletePage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete page');
    }
  }

  /**
   * DUPLICATE PAGE
   */
  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Duplicate a CMS page (tenant)' })
  @ApiResponse({ status: 200, description: 'Page duplicated' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async duplicatePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param() params: PageIdParamDto,
  ) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      const userId = this.requireUserId(req);
      return await this.pageService.duplicatePage(
        resolvedTenantId,
        userId,
        params.id,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[duplicatePage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to duplicate page');
    }
  }

  /**
   * GET PAGE HIERARCHY
   */
  @Get('hierarchy/tree')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get CMS page hierarchy tree (tenant)' })
  @ApiResponse({ status: 200, description: 'Hierarchy returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getHierarchy(@Tenant() tenantId: string) {
    try {
      const resolvedTenantId = this.requireTenantId(tenantId);
      return await this.pageService.getHierarchy(resolvedTenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getHierarchy] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch page hierarchy');
    }
  }
}
