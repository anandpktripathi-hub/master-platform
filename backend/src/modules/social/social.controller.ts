import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ===== Connections =====

  @UseGuards(JwtAuthGuard)
  @Post('connections/request')
  async sendRequest(
    @Req() req: AuthRequest,
    @Body() body: { recipientId?: string },
  ) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !body.recipientId || !tenantId) {
      throw new Error('User ID, tenantId, and recipientId required');
    }
    return this.socialService.sendConnectionRequest(
      String(userId),
      body.recipientId,
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('connections/:id/accept')
  async acceptRequest(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.acceptConnectionRequest(
      String(userId),
      id,
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('connections/:id/reject')
  async rejectRequest(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.rejectConnectionRequest(
      String(userId),
      id,
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections/pending')
  async getPendingRequests(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.listPendingRequests(
      String(userId),
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections/my')
  async getMyConnections(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.listMyConnections(
      String(userId),
      String(tenantId),
    );
  }

  // ===== Posts =====

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(
    @Req() req: AuthRequest,
    @Body()
    body: {
      content?: string;
      visibility?: 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE';
    },
  ) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId || !body.content)
      throw new Error('User ID, tenantId, and content required');
    return this.socialService.createPost(
      String(userId),
      body.content,
      body.visibility,
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.listFeedPosts(String(userId), String(tenantId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('posts/:id/like')
  async toggleLike(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) throw new Error('User ID or tenantId not found');
    return this.socialService.toggleLike(id, String(userId), String(tenantId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  async addComment(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { content?: string },
  ) {
    const userId = req.user?.sub || req.user?._id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId || !body.content)
      throw new Error('User ID, tenantId, and content required');
    return this.socialService.addComment(
      id,
      String(userId),
      body.content,
      String(tenantId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id/comments')
  async getComments(@Req() req: AuthRequest, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('tenantId not found');
    return this.socialService.listComments(id, String(tenantId));
  }
}
