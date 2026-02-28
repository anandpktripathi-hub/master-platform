import {
  Controller,
  Get,
  Header,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { TenantSeoSlugParamDto } from './dto/tenant-seo.dto';

class AllowAllGuard {
  canActivate() {
    return true;
  }
}

@ApiTags('Seo')
@ApiBearerAuth('bearer')
@Controller('seo')
@UseGuards(AllowAllGuard)
@Public()
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(private readonly seoService: SeoService) {}

  @Get('tenants/:slug/robots.txt')
  @Public()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Get tenant robots.txt' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async tenantRobots(
    @Param() params: TenantSeoSlugParamDto,
  ): Promise<string> {
    try {
      const slug = params.slug;
      return await this.seoService.getTenantRobots(slug);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[tenantRobots] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tenants/:slug/sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get tenant sitemap.xml' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async tenantSitemap(
    @Param() params: TenantSeoSlugParamDto,
  ): Promise<string> {
    try {
      const slug = params.slug;
      return await this.seoService.getTenantSitemap(slug);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[tenantSitemap] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tenants/:slug/feed.xml')
  @Public()
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get tenant feed.xml' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async tenantFeed(
    @Param() params: TenantSeoSlugParamDto,
  ): Promise<string> {
    try {
      const slug = params.slug;
      return await this.seoService.getTenantFeed(slug);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[tenantFeed] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
