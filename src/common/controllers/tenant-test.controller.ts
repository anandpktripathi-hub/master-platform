import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * TenantTestController
 *
 * This controller provides test endpoints to verify that tenant middleware
 * and context are working correctly. Use these endpoints to debug tenant
 * isolation issues.
 *
 * DELETE THIS CONTROLLER IN PRODUCTION - it's for testing only!
 */
@ApiTags('Tenant Testing')
@Controller('test/tenant')
export class TenantTestController {
  @Get('context')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Test tenant context',
    description:
      'Returns the current tenant context from the authenticated request. Use this to verify that tenantId is properly extracted from JWT and attached to the request.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant context retrieved successfully',
    schema: {
      example: {
        message: 'Tenant context is working correctly',
        tenantContext: {
          tenantId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          email: 'user@example.com',
          role: 'TENANT_OWNER',
        },
        sources: {
          fromReqUser: '507f1f77bcf86cd799439011',
          fromReqTenantId: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user has no tenantId in JWT',
  })
  getTenantContext(@Request() req) {
    return {
      message: 'Tenant context is working correctly',
      tenantContext: {
        tenantId: req.user?.tenantId,
        userId: req.user?.userId,
        email: req.user?.email,
        role: req.user?.role,
      },
      sources: {
        fromReqUser: req.user?.tenantId,
        fromReqTenantId: req.tenantId,
      },
      middleware:
        'TenantMiddleware extracts tenantId from JWT and attaches to req.tenantId',
      guard: 'TenantGuard validates tenantId exists and is valid',
      status:
        req.user?.tenantId === req.tenantId ? 'CONSISTENT ✅' : 'MISMATCH ❌',
    };
  }

  @Get('public')
  @ApiOperation({
    summary: 'Test public endpoint (no auth)',
    description:
      'Returns success even without authentication. Tenant context should be undefined.',
  })
  @ApiResponse({
    status: 200,
    description: 'Public endpoint accessed successfully',
  })
  getPublic(@Request() req) {
    return {
      message: 'Public endpoint - no authentication required',
      hasUser: !!req.user,
      hasTenantId: !!req.tenantId,
      explanation:
        'This endpoint does not require authentication, so tenantId should be undefined',
    };
  }
}
