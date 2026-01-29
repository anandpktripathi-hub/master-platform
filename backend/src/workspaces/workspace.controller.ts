import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user?: { sub?: string } & Record<string, any>;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async listWorkspaces(@Req() req: AuthRequest) {
    const userId = req.user?.sub || (req.user as any)?._id;
    return this.workspaceService.getWorkspacesForUser(String(userId));
  }

  @Post('switch')
  async switchWorkspace(
    @Req() req: AuthRequest,
    @Body('workspaceId') workspaceId: string,
  ) {
    const userId = req.user?.sub || (req.user as any)?._id;
    return this.workspaceService.switchWorkspace(String(userId), workspaceId);
  }
}
