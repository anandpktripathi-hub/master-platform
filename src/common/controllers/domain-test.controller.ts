import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * DomainTestController
 * 
 * This controller provides test endpoints to verify domain/subdomain routing.
 * Use these endpoints to test tenant resolution from different hostnames.
 * 
 * DELETE THIS CONTROLLER IN PRODUCTION - it's for testing only!
 */
@ApiTags('Domain Testing')
@Controller('test/domain')
export class DomainTestController {
  @Get('info')
  @ApiOperation({ 
    summary: 'Test domain resolution',
    description: 'Returns information about the current domain and resolved tenant. No authentication required.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Domain info retrieved successfully',
    schema: {
      example: {
        message: 'Domain resolution test',
        request: {
          hostname: 'tenant1.localhost:3000',
          host: 'tenant1.localhost:3000',
          protocol: 'http',
          url: '/test/domain/info'
        },
        resolution: {
          isLandlordDomain: false,
          resolvedTenantId: '507f1f77bcf86cd799439011',
          resolvedTenantSlug: 'tenant1',
          resolvedTenantName: 'Tenant One',
          domainResolutionMethod: 'subdomain'
        },
        authentication: {
          isAuthenticated: false,
          jwtTenantId: null,
          finalTenantId: '507f1f77bcf86cd799439011'
        }
      }
    }
  })
  getDomainInfo(@Request() req) {
    return {
      message: 'Domain resolution test',
      request: {
        hostname: req.hostname,
        host: req.headers.host,
        protocol: req.protocol,
        url: req.url,
        originalUrl: req.originalUrl,
      },
      resolution: {
        isLandlordDomain: req.isLandlordDomain ?? null,
        resolvedTenantId: req.resolvedTenantId ?? null,
        resolvedTenantSlug: req.resolvedTenantSlug ?? null,
        resolvedTenantName: req.resolvedTenant?.name ?? null,
        domainResolutionMethod: req.domainResolutionMethod ?? null,
      },
      authentication: {
        isAuthenticated: !!req.user,
        jwtTenantId: req.user?.tenantId ?? null,
        userEmail: req.user?.email ?? null,
        finalTenantId: req.tenantId ?? null,
      },
      explanation: {
        domainResolution: 'DomainTenantMiddleware resolves tenant from hostname (subdomain or custom domain)',
        jwtFallback: 'If authenticated, JWT tenantId takes priority over domain resolution',
        usage: 'Access this endpoint from different domains to test resolution',
      },
    };
  }
}
