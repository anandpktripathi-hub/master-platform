import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../common/enums/permission.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Create new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    const user = req.user;
    return this.categoriesService.create(createCategoryDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  findAll(@Request() req) {
    const user = req.user;
    return this.categoriesService.findAll(user.tenantId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree hierarchy' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully',
  })
  getCategoryTree(@Request() req) {
    const user = req.user;
    return this.categoriesService.getCategoryTree(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findById(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.categoriesService.findById(id, user.tenantId);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  @ApiResponse({ status: 200, description: 'Children retrieved successfully' })
  findChildren(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.categoriesService.findChildren(id, user?.tenantId as string);
  }

  @Put(':id')
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      user?.tenantId as string,
    );
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.categoriesService.remove(id, user?.tenantId as string);
  }
}
