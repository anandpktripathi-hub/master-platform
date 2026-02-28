import {
  BadRequestException,
  ForbiddenException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Body,
  Req,
  UseGuards,
  Sse,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ArchiveChatRoomDto,
  CreateChatRoomDto,
  ListChatMessagesQueryDto,
  PostChatMessageDto,
} from './dto/chat.dto';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
    role?: string;
  };
}
@ApiTags('Chat')
@ApiBearerAuth('bearer')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  private canCreatePrivateRooms(rawRole: string | undefined): boolean {
    const role = String(rawRole || '').trim();
    const normalized = role.toLowerCase();
    return (
      normalized === 'platform_admin' ||
      normalized === 'platform_super_admin' ||
      normalized === 'platform_superadmin' ||
      normalized === 'tenant_admin' ||
      normalized === 'owner' ||
      normalized === 'admin'
    );
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listRooms(@Tenant() tenantId: string | undefined) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return this.chatService.listRooms(String(tenantId));
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createRoom(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Body() body: CreateChatRoomDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    if (body.isPrivate && !this.canCreatePrivateRooms(req.user?.role)) {
      throw new ForbiddenException(
        'You are not allowed to create private chat rooms',
      );
    }

    return this.chatService.createRoom(String(tenantId), String(userId), {
      name: body.name,
      description: body.description,
      isPrivate: body.isPrivate === true,
    });
  }

  @Get('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listMessages(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
    @Query() query: ListChatMessagesQueryDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    return this.chatService.listMessagesForUser(
      String(tenantId),
      roomId,
      String(userId),
      {
        before: query.before,
        limit: query.limit,
      },
    );
  }

  @Post('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async postMessage(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
    @Body() body: PostChatMessageDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    return this.chatService.postMessage(
      String(tenantId),
      roomId,
      String(userId),
      body.content,
    );
  }

  @Post('rooms/:roomId/join')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async joinRoom(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    return this.chatService.joinRoom(String(tenantId), roomId, String(userId));
  }

  @Get('rooms/:roomId/members')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listMembers(
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return this.chatService.listMembers(String(tenantId), roomId);
  }

  @Sse('events')
  async events(@Req() req: any) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const payload = await this.chatService.verifyAccessToken(token);
    if (!payload?.tenantId || !payload?.sub) {
      throw new BadRequestException('Invalid token payload');
    }

    const tenantId = String(payload.tenantId);
    const userId = String(payload.sub);
    const tenantStream = this.chatService.getTenantEventStream(tenantId);

    return new Observable((subscriber) => {
      const visibilityCache = new Map<string, boolean>();

      const sub = tenantStream.subscribe(async (data) => {
        if (!data || data.type !== 'message' || !data.payload) {
          subscriber.next({ data });
          return;
        }

        const payloadMsg = data.payload as { roomId?: string };
        const roomId = payloadMsg.roomId;
        if (!roomId) {
          subscriber.next({ data });
          return;
        }

        let canSee = visibilityCache.get(roomId);
        if (canSee === undefined) {
          try {
            canSee = await this.chatService.canUserSeeRoom(
              tenantId,
              roomId,
              userId,
            );
          } catch {
            canSee = false;
          }
          visibilityCache.set(roomId, !!canSee);
        }

        if (canSee) {
          subscriber.next({ data });
        }
      });

      return () => {
        sub.unsubscribe();
      };
    });
  }

  @Patch('admin/rooms/:roomId/archive')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles(
    'platform_admin',
    'tenant_admin',
    'PLATFORM_SUPERADMIN',
    'TENANT_ADMIN',
  )
  async archiveRoom(
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
    @Body() body: ArchiveChatRoomDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return this.chatService.archiveRoom(
      String(tenantId),
      roomId,
      body.archived,
    );
  }

  @Delete('admin/rooms/:roomId/members/:userId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles(
    'platform_admin',
    'tenant_admin',
    'PLATFORM_SUPERADMIN',
    'TENANT_ADMIN',
  )
  async removeMember(
    @Tenant() tenantId: string | undefined,
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return this.chatService.removeMember(String(tenantId), roomId, userId);
  }
}
