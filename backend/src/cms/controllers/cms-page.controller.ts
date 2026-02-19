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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CmsPageService } from '../services/cms-page.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Tenant } from '../../decorators/tenant.decorator';
// import { TenantGuard } from '../../common/guards/tenant.guard';
// import { RbacGuard } from '../../common/guards/rbac.guard';

@ApiTags('CMS - Pages')
@ApiBearerAuth()
@Controller('cms/pages')
// @UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
export class CmsPageController {
  constructor(private readonly pageService: CmsPageService) {}

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
  async createPage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body() dto: CreatePageDto,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    return this.pageService.createPage(resolvedTenantId, userId, dto);
  }

  /**
   * GET ALL PAGES (with filtering)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getPages(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Query() query: PageQueryDto,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    const userRoles = this.getUserRoles(req);
    return this.pageService.getPages(
      resolvedTenantId,
      userId,
      userRoles,
      query,
    );
  }

  /**
   * GET SINGLE PAGE BY ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPageById(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    const userRoles = this.getUserRoles(req);
    return this.pageService.getPageById(
      resolvedTenantId,
      id,
      userId,
      userRoles,
    );
  }

  /**
   * GET PAGE BY SLUG (public endpoint, no auth needed)
   */
  @Get('slug/:slug')
  // @UseGuards()
  async getPageBySlug(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param('slug') slug: string,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    return this.pageService.getPageBySlug(
      resolvedTenantId,
      slug,
      req?.user?.userId ? String(req.user.userId) : undefined,
      this.getUserRoles(req),
    );
  }

  /**
   * UPDATE PAGE
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    return this.pageService.updatePage(resolvedTenantId, userId, id, dto);
  }

  /**
   * DELETE PAGE
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    return this.pageService.deletePage(resolvedTenantId, userId, id);
  }

  /**
   * DUPLICATE PAGE
   */
  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  async duplicatePage(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    const userId = this.requireUserId(req);
    return this.pageService.duplicatePage(resolvedTenantId, userId, id);
  }

  /**
   * GET PAGE HIERARCHY
   */
  @Get('hierarchy/tree')
  @UseGuards(JwtAuthGuard)
  async getHierarchy(@Tenant() tenantId: string) {
    const resolvedTenantId = this.requireTenantId(tenantId);
    return this.pageService.getHierarchy(resolvedTenantId);
  }
}
