import {
  BadRequestException,
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
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  async listRooms(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    return this.chatService.listRooms(String(tenantId));
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  async createRoom(
    @Req() req: AuthRequest,
    @Body() body: { name?: string; description?: string; isPrivate?: boolean },
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }
    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Room name is required');
    }

    return this.chatService.createRoom(String(tenantId), String(userId), {
      name: body.name,
      description: body.description,
      // Only tenant admins or platform admins should create private rooms
      ...(body.isPrivate ? { isPrivate: true } : {}),
    } as any);
  }

  @Get('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard)
  async listMessages(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    const numericLimit = limit ? parseInt(limit, 10) : undefined;

    return this.chatService.listMessagesForUser(String(tenantId), roomId, String(userId), {
      before,
      limit: Number.isFinite(numericLimit) ? numericLimit : undefined,
    });
  }

  @Post('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard)
  async postMessage(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Body() body: { content?: string },
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }
    if (!body.content || !body.content.trim()) {
      throw new BadRequestException('Message content is required');
    }

    return this.chatService.postMessage(String(tenantId), roomId, String(userId), body.content);
  }

  @Post('rooms/:roomId/join')
  @UseGuards(JwtAuthGuard)
  async joinRoom(@Req() req: AuthRequest, @Param('roomId') roomId: string) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new BadRequestException('Tenant and user context are required');
    }

    return this.chatService.joinRoom(String(tenantId), roomId, String(userId));
  }

  @Get('rooms/:roomId/members')
  @UseGuards(JwtAuthGuard)
  async listMembers(@Req() req: AuthRequest, @Param('roomId') roomId: string) {
    const tenantId = req.user?.tenantId;
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
            canSee = await this.chatService.canUserSeeRoom(tenantId, roomId, userId);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'tenant_admin', 'PLATFORM_SUPERADMIN', 'TENANT_ADMIN')
  async archiveRoom(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Body() body: { archived?: boolean },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }
    if (typeof body.archived !== 'boolean') {
      throw new BadRequestException('archived flag is required');
    }

    return this.chatService.archiveRoom(String(tenantId), roomId, body.archived);
  }

  @Delete('admin/rooms/:roomId/members/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'tenant_admin', 'PLATFORM_SUPERADMIN', 'TENANT_ADMIN')
  async removeMember(
    @Req() req: AuthRequest,
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    return this.chatService.removeMember(String(tenantId), roomId, userId);
  }
}
