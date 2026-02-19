import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { DomainService } from './domain.service';
import { VerifyDomainDto } from './dto/verify-domain.dto';
import { MapDomainDto } from './dto/map-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import rateLimit from 'express-rate-limit';

@Controller('tenants/domain')
@UseGuards(AuthGuard, TenantGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post('verify')
  async verifyDomain(
    @Body() verifyDomainDto: VerifyDomainDto,
    @Req() req: any,
  ) {
    try {
      return await this.domainService.verifyDomain(
        verifyDomainDto,
        req.user.tenantId,
      );
    } catch (e) {
      const err = e as any;
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('map')
  async mapDomain(@Body() mapDomainDto: MapDomainDto, @Req() req: any) {
    try {
      return await this.domainService.mapDomain(
        mapDomainDto,
        req.user.tenantId,
      );
    } catch (e) {
      const err = e as any;
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('update')
  async updateDomain(
    @Body() updateDomainDto: UpdateDomainDto,
    @Req() req: any,
  ) {
    try {
      return await this.domainService.updateDomain(
        updateDomainDto,
        req.user.tenantId,
      );
    } catch (e) {
      const err = e as any;
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':tenantId/domains')
  async getDomains(@Param('tenantId') tenantId: string) {
    try {
      return await this.domainService.getDomains(tenantId);
    } catch (e) {
      const err = e as any;
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
