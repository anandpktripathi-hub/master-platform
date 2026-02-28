import {
  BadRequestException,
  ForbiddenException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  ArchiveChatRoomDto,
  CreateChatRoomDto,
  ListChatMessagesQueryDto,
  PostChatMessageDto,
} from './dto/chat.dto';
import { RoomIdParamDto, RoomMemberParamDto } from './dto/chat-params.dto';

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
  private readonly logger = new Logger(ChatController.name);

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
  @ApiOperation({ summary: 'List chat rooms for current tenant' })
  @ApiResponse({ status: 200, description: 'Rooms returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listRooms(@Tenant() tenantId: string | undefined) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant context is required');
      }
      return await this.chatService.listRooms(String(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listRooms] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list chat rooms');
    }
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Create a chat room for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createRoom(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Body() body: CreateChatRoomDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId) {
        throw new BadRequestException('Tenant and user context are required');
      }

      if (body.isPrivate && !this.canCreatePrivateRooms(req.user?.role)) {
        throw new ForbiddenException(
          'You are not allowed to create private chat rooms',
        );
      }

      return await this.chatService.createRoom(String(tenantId), String(userId), {
        name: body.name,
        description: body.description,
        isPrivate: body.isPrivate === true,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createRoom] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create chat room');
    }
  }

  @Get('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'List messages for a room (visible to current user)' })
  @ApiResponse({ status: 200, description: 'Messages returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listMessages(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomIdParamDto,
    @Query() query: ListChatMessagesQueryDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId) {
        throw new BadRequestException('Tenant and user context are required');
      }

      return await this.chatService.listMessagesForUser(
        String(tenantId),
        params.roomId,
        String(userId),
        {
          before: query.before,
          limit: query.limit,
        },
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listMessages] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list chat messages');
    }
  }

  @Post('rooms/:roomId/messages')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Post a message to a room' })
  @ApiResponse({ status: 200, description: 'Message posted' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async postMessage(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomIdParamDto,
    @Body() body: PostChatMessageDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId) {
        throw new BadRequestException('Tenant and user context are required');
      }

      return await this.chatService.postMessage(
        String(tenantId),
        params.roomId,
        String(userId),
        body.content,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[postMessage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to post chat message');
    }
  }

  @Post('rooms/:roomId/join')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Join a chat room' })
  @ApiResponse({ status: 200, description: 'Joined' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async joinRoom(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomIdParamDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId) {
        throw new BadRequestException('Tenant and user context are required');
      }

      return await this.chatService.joinRoom(
        String(tenantId),
        params.roomId,
        String(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[joinRoom] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to join room');
    }
  }

  @Get('rooms/:roomId/members')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'List members for a chat room' })
  @ApiResponse({ status: 200, description: 'Members returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listMembers(
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomIdParamDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant context is required');
      }
      return await this.chatService.listMembers(String(tenantId), params.roomId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listMembers] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list room members');
    }
  }

  @Sse('events')
  @Public()
  @ApiOperation({ summary: 'SSE stream for chat events (token query param)' })
  @ApiResponse({ status: 200, description: 'SSE stream opened' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async events(@Req() req: any) {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(`[events] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to open events stream');
    }
  }

  @Patch('admin/rooms/:roomId/archive')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles(
    'platform_admin',
    'tenant_admin',
    'PLATFORM_SUPERADMIN',
    'TENANT_ADMIN',
  )
  @ApiOperation({ summary: 'Archive/unarchive a room (admin)' })
  @ApiResponse({ status: 200, description: 'Room archived state updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async archiveRoom(
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomIdParamDto,
    @Body() body: ArchiveChatRoomDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant context is required');
      }

      return await this.chatService.archiveRoom(
        String(tenantId),
        params.roomId,
        body.archived,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[archiveRoom] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update room archive state');
    }
  }

  @Delete('admin/rooms/:roomId/members/:userId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles(
    'platform_admin',
    'tenant_admin',
    'PLATFORM_SUPERADMIN',
    'TENANT_ADMIN',
  )
  @ApiOperation({ summary: 'Remove a member from a room (admin)' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeMember(
    @Tenant() tenantId: string | undefined,
    @Param() params: RoomMemberParamDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant context is required');
      }

      return await this.chatService.removeMember(
        String(tenantId),
        params.roomId,
        params.userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[removeMember] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to remove member');
    }
  }
}
