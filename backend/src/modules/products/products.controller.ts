import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ListProductsQueryDto } from './dto/products.dto';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(
    @Tenant() tenantId: string,
    @Query() query: ListProductsQueryDto,
  ) {
    const pageNum = Number(query.page ?? 1);
    const limitNum = Number(query.limit ?? 10);

    if (!Number.isFinite(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
      throw new BadRequestException('Invalid page');
    }

    if (
      !Number.isFinite(limitNum) ||
      !Number.isInteger(limitNum) ||
      limitNum < 1 ||
      limitNum > 100
    ) {
      throw new BadRequestException('Invalid limit');
    }

    return this.productsService.findAll(tenantId, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.productsService.findOne(tenantId, id);
  }
}

