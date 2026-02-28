import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SwitchWorkspaceDto } from './dto/workspace.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: { sub?: string } & Record<string, any>;
}
@ApiTags('Workspace')
@ApiBearerAuth('bearer')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async listWorkspaces(@Req() req: AuthRequest) {
    const userId = req.user?.sub || (req.user as any)?._id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.workspaceService.getWorkspacesForUser(String(userId));
  }

  @Post('switch')
  async switchWorkspace(
    @Req() req: AuthRequest,
    @Body() body: SwitchWorkspaceDto,
  ) {
    const userId = req.user?.sub || (req.user as any)?._id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.workspaceService.switchWorkspace(String(userId), body.workspaceId);
  }
}
