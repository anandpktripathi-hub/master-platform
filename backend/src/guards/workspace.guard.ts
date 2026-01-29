import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { WorkspaceService } from '../workspaces/workspace.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not authenticated for workspace');
    }

    const rawWorkspaceId =
      (request.headers['x-workspace-id'] as string | undefined) ||
      (request.query.workspaceId as string | undefined);

    // If no explicit workspace is provided, fall back to the user's tenant
    // so existing single-tenant flows keep working.
    const workspaceId =
      rawWorkspaceId || (user.tenantId ? String(user.tenantId) : undefined);

    if (!workspaceId) {
      throw new ForbiddenException('Workspace not specified');
    }

    const userId = user.sub || user._id;
    try {
      const result = await this.workspaceService.switchWorkspace(
        String(userId),
        workspaceId,
      );

      // Expose resolved workspace/tenant on request for downstream handlers
      request.workspaceId = result.workspaceId;
      request.tenantId = result.workspaceId;

      return true;
    } catch (e) {
      throw new ForbiddenException('Access denied for this workspace');
    }
  }
}
