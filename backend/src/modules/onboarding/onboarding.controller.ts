import { Controller, Get, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('seed-sample')
  @UseGuards(JwtAuthGuard)
  async seedSample(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const tenantId = String(req.user.tenantId);
    const userId = req.user.sub;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }

    return this.onboardingService.seedSampleData({ tenantId, userId });
  }

  @Get('sample-status')
  @UseGuards(JwtAuthGuard)
  async getSampleStatus(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const tenantId = String(req.user.tenantId);
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    return this.onboardingService.getSampleStatus({ tenantId });
  }
}
