import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ListProductsQueryDto } from './dto/products.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { ProductIdParamDto } from './dto/product-id-param.dto';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(
    @Tenant() tenantId: string,
    @Query() query: ListProductsQueryDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.productsService.findAll(
        tenantId,
        query.page ?? 1,
        query.limit ?? 10,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list products');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Tenant() tenantId: string, @Param() params: ProductIdParamDto) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.productsService.findOne(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get product');
    }
  }
}

