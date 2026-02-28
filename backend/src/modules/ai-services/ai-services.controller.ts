import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { AiServicesService } from './ai-services.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AiCompletionRequestDto,
  AiSentimentRequestDto,
  AiSuggestRequestDto,
} from './dto/ai-services.dto';
@ApiTags('Ai Services')
@ApiBearerAuth('bearer')
@Controller('ai')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class AiServicesController {
  constructor(private readonly aiServices: AiServicesService) {}

  /**
   * Generate text completion using AI (e.g., for content generation,
   * copywriting, or auto-responses).
   */
  @Post('complete')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async generateCompletion(
    @Tenant() tenantId: string | undefined,
    @Body() request: AiCompletionRequestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.aiServices.generateCompletion(String(tenantId), request);
  }

  /**
   * Analyze sentiment of text (e.g., for support tickets or reviews).
   */
  @Post('sentiment')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async analyzeSentiment(
    @Tenant() tenantId: string | undefined,
    @Body() body: AiSentimentRequestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.aiServices.analyzeSentiment(String(tenantId), body.text);
  }

  /**
   * Generate content suggestions (e.g., blog post outline, product description).
   */
  @Post('suggest')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async generateContentSuggestions(
    @Tenant() tenantId: string | undefined,
    @Body() body: AiSuggestRequestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.aiServices.generateContentSuggestions(
      String(tenantId),
      body.topic,
      body.contentType,
    );
  }
}
