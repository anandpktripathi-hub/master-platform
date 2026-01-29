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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CmsPageService } from '../services/cms-page.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
// import { TenantGuard } from '../../common/guards/tenant.guard';
// import { RbacGuard } from '../../common/guards/rbac.guard';

@ApiTags('CMS - Pages')
@ApiBearerAuth()
@Controller('api/cms/pages')
// @UseGuards(AuthGuard('jwt'), TenantGuard, RbacGuard)
export class CmsPageController {
  constructor(private readonly pageService: CmsPageService) {}

  /**
   * CREATE PAGE
   */
  @Post()
  async createPage(@Req() req: any, @Body() dto: CreatePageDto) {
    // Replace with real tenant/user extraction
    return this.pageService.createPage(req.tenantId, req.user.id, dto);
  }

  /**
   * GET ALL PAGES (with filtering)
   */
  @Get()
  async getPages(@Req() req: any, @Query() query: PageQueryDto) {
    return this.pageService.getPages(
      req.tenantId,
      req.user.id,
      req.user.roles || [],
      query,
    );
  }

  /**
   * GET SINGLE PAGE BY ID
   */
  @Get(':id')
  async getPageById(@Req() req: any, @Param('id') id: string) {
    return this.pageService.getPageById(
      req.tenantId,
      id,
      req.user.id,
      req.user.roles,
    );
  }

  /**
   * GET PAGE BY SLUG (public endpoint, no auth needed)
   */
  @Get('slug/:slug')
  // @UseGuards()
  async getPageBySlug(@Req() req: any, @Param('slug') slug: string) {
    return this.pageService.getPageBySlug(
      req.tenantId,
      slug,
      req.user?.id,
      req.user?.roles || [],
    );
  }

  /**
   * UPDATE PAGE
   */
  @Patch(':id')
  async updatePage(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pageService.updatePage(req.tenantId, req.user.id, id, dto);
  }

  /**
   * DELETE PAGE
   */
  @Delete(':id')
  async deletePage(@Req() req: any, @Param('id') id: string) {
    return this.pageService.deletePage(req.tenantId, req.user.id, id);
  }

  /**
   * DUPLICATE PAGE
   */
  @Post(':id/duplicate')
  async duplicatePage(@Req() req: any, @Param('id') id: string) {
    return this.pageService.duplicatePage(req.tenantId, req.user.id, id);
  }

  /**
   * GET PAGE HIERARCHY
   */
  @Get('hierarchy/tree')
  async getHierarchy(@Req() req: any) {
    return this.pageService.getHierarchy(req.tenantId);
  }
}
