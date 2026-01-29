import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { AiCompletionRequest, AiServicesService } from './ai-services.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
  };
}

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    @Req() req: AuthRequest,
    @Body() request: AiCompletionRequest,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
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
    @Req() req: AuthRequest,
    @Body() body: { text: string },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
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
    @Req() req: AuthRequest,
    @Body() body: { topic: string; contentType: string },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return this.aiServices.generateContentSuggestions(
      String(tenantId),
      body.topic,
      body.contentType,
    );
  }
}
