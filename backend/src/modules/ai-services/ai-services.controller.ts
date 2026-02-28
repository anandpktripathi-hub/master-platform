import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { AiServicesService } from './ai-services.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  private readonly logger = new Logger(AiServicesController.name);

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
  @ApiOperation({ summary: 'Generate AI text completion' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async generateCompletion(
    @Tenant() tenantId: string | undefined,
    @Body() request: AiCompletionRequestDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      return await this.aiServices.generateCompletion(String(tenantId), request);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[generateCompletion] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to generate AI completion',
          );
    }
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
  @ApiOperation({ summary: 'Analyze text sentiment' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async analyzeSentiment(
    @Tenant() tenantId: string | undefined,
    @Body() body: AiSentimentRequestDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      return await this.aiServices.analyzeSentiment(String(tenantId), body.text);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[analyzeSentiment] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to analyze sentiment');
    }
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
  @ApiOperation({ summary: 'Generate AI content suggestions' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async generateContentSuggestions(
    @Tenant() tenantId: string | undefined,
    @Body() body: AiSuggestRequestDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      return await this.aiServices.generateContentSuggestions(
        String(tenantId),
        body.topic,
        body.contentType,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[generateContentSuggestions] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to generate content suggestions',
          );
    }
  }
}
