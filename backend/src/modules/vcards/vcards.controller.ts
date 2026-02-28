import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
} from '@nestjs/common';
import { VcardsService } from './vcards.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { CreateVCardDto, UpdateVCardDto } from './dto/vcards.dto';
import { VcardIdParamDto } from './dto/vcard-id-param.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Vcards')
@ApiBearerAuth('bearer')
@Controller()
export class VcardsController {
  private readonly logger = new Logger(VcardsController.name);

  constructor(private readonly vcardsService: VcardsService) {}

  // Tenant-admin endpoints
  @Get('vcards')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List vcards for current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Vcards returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTenantVcards(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.vcardsService.listForTenant(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listTenantVcards] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list vcards');
    }
  }

  @Post('vcards')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Create a vcard for current tenant (tenant admin)' })
  @ApiResponse({ status: 201, description: 'Vcard created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTenantVcard(
    @Tenant() tenantId: string,
    @Body() body: CreateVCardDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.vcardsService.createForTenant(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTenantVcard] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create vcard');
    }
  }

  @Put('vcards/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update a vcard for current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Vcard updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTenantVcard(
    @Tenant() tenantId: string,
    @Param() params: VcardIdParamDto,
    @Body() body: UpdateVCardDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.vcardsService.updateForTenant(tenantId, params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTenantVcard] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update vcard');
    }
  }

  @Delete('vcards/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Delete a vcard for current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Vcard deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTenantVcard(
    @Tenant() tenantId: string,
    @Param() params: VcardIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.vcardsService.deleteForTenant(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteTenantVcard] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete vcard');
    }
  }

  // Public read-only endpoint
  @Get('public/vcards/:id')
  @Public()
  @ApiOperation({ summary: 'Get a public vcard by id' })
  @ApiResponse({ status: 200, description: 'Vcard returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPublicVcard(@Param() params: VcardIdParamDto) {
    try {
      return await this.vcardsService.getPublicVcard(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPublicVcard] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get public vcard');
    }
  }
}

