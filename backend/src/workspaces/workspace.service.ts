import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../database/schemas/tenant.schema';
import { Role } from '../modules/users/role.types';

export interface WorkspaceDto {
  id: string;
  name: string;
  slug?: string;
  planKey?: string;
  status?: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  private isPlatformAdmin(role: string | undefined): boolean {
    if (!role) return false;
    return (
      role === Role.PLATFORM_SUPER_ADMIN || role === Role.PLATFORM_ADMIN_LEGACY
    );
  }

  async getWorkspacesForUser(userId: string): Promise<WorkspaceDto[]> {
    const user = await this.userModel
      .findById(userId)
      .lean<UserDocument>()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userTenantId = user.tenantId
      ? new Types.ObjectId(user.tenantId)
      : null;
    const isPlatformAdmin = this.isPlatformAdmin(
      user.role as string | undefined,
    );

    let tenants: TenantDocument[] = [];

    if (isPlatformAdmin) {
      tenants = await this.tenantModel.find({}).lean<TenantDocument[]>().exec();
    } else {
      const orConditions: any[] = [];

      if (userTenantId) {
        orConditions.push({ _id: userTenantId });
      }

      // Also allow tenants created by this user (owner). This lets a
      // user manage multiple workspaces they have created.
      orConditions.push({ createdByUserId: new Types.ObjectId(user._id) });

      tenants = await this.tenantModel
        .find({ $or: orConditions })
        .lean<TenantDocument[]>()
        .exec();
    }

    const seen = new Set<string>();

    return tenants
      .filter((t) => {
        const idStr = String(t._id);
        if (seen.has(idStr)) return false;
        seen.add(idStr);
        return true;
      })
      .map((t) => {
        const idStr = String(t._id);
        const name = t.name || t.publicName || t.companyName || t.slug || idStr;
        return {
          id: idStr,
          name,
          slug: t.slug,
          planKey: t.planKey,
          status: t.status,
          isActive: t.isActive,
          isCurrent: userTenantId ? idStr === String(userTenantId) : false,
        } as WorkspaceDto;
      });
  }

  async switchWorkspace(userId: string, workspaceId: string) {
    const workspaces = await this.getWorkspacesForUser(userId);
    const target = workspaces.find((ws) => ws.id === workspaceId);
    if (!target) {
      throw new ForbiddenException('Access denied for this workspace');
    }

    return {
      success: true,
      workspaceId: target.id,
      workspace: target,
    };
  }
}
