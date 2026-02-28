import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SwitchWorkspaceDto } from './dto/workspace.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: { sub?: string } & Record<string, any>;
}
@ApiTags('Workspace')
@ApiBearerAuth('bearer')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  private readonly logger = new Logger(WorkspaceController.name);

  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  @ApiResponse({ status: 200, description: 'Workspaces returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listWorkspaces(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || (req.user as any)?._id;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      return await this.workspaceService.getWorkspacesForUser(String(userId));
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listWorkspaces] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list workspaces');
    }
  }

  @Post('switch')
  @ApiOperation({ summary: 'Switch current workspace for user' })
  @ApiResponse({ status: 200, description: 'Workspace switched' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async switchWorkspace(
    @Req() req: AuthRequest,
    @Body() body: SwitchWorkspaceDto,
  ) {
    try {
      const userId = req.user?.sub || (req.user as any)?._id;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      return await this.workspaceService.switchWorkspace(
        String(userId),
        body.workspaceId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[switchWorkspace] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to switch workspace');
    }
  }
}
