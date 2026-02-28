import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UnifiedRegistrationService } from './unified-registration.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { UnifiedRegistrationRequestDto } from './dto/unified-registration.dto';

class AllowAllGuard {
  canActivate() {
    return true;
  }
}
@ApiTags('Unified Registration')
@Public()
@Controller('auth/unified-register')
@UseGuards(AllowAllGuard)
export class UnifiedRegistrationController {
  private readonly logger = new Logger(UnifiedRegistrationController.name);

  constructor(
    private readonly unifiedRegistrationService: UnifiedRegistrationService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Register a user across multiple tenants/roles' })
  @ApiBody({ type: UnifiedRegistrationRequestDto })
  @ApiResponse({ status: 200, description: 'Registration completed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() dto: UnifiedRegistrationRequestDto) {
    try {
      return await this.unifiedRegistrationService.register(dto);
    } catch (error) {
      this.logger.error(
        `[register] Failed unified registration (email=${dto?.email})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
