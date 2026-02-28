import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AddCommentDto,
  CreatePostDto,
  SendConnectionRequestDto,
} from './dto/social.dto';
import { SocialIdParamDto } from './dto/social-params.dto';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}
@ApiTags('Social')
@ApiBearerAuth('bearer')
@Controller('social')
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(private readonly socialService: SocialService) {}

  // ===== Connections =====

  @UseGuards(JwtAuthGuard)
  @Post('connections/request')
  @ApiOperation({ summary: 'Send a connection request' })
  @ApiResponse({ status: 201, description: 'Connection request created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async sendRequest(
    @Req() req: AuthRequest,
    @Body() body: SendConnectionRequestDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.sendConnectionRequest(
        String(userId),
        body.recipientId,
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[sendRequest] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to send connection request');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('connections/:id/accept')
  @ApiOperation({ summary: 'Accept a connection request' })
  @ApiResponse({ status: 200, description: 'Connection request accepted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async acceptRequest(@Req() req: AuthRequest, @Param() params: SocialIdParamDto) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.acceptConnectionRequest(
        String(userId),
        params.id,
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[acceptRequest] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to accept connection request');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('connections/:id/reject')
  @ApiOperation({ summary: 'Reject a connection request' })
  @ApiResponse({ status: 200, description: 'Connection request rejected' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async rejectRequest(@Req() req: AuthRequest, @Param() params: SocialIdParamDto) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.rejectConnectionRequest(
        String(userId),
        params.id,
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[rejectRequest] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to reject connection request');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections/pending')
  @ApiOperation({ summary: 'List pending connection requests' })
  @ApiResponse({ status: 200, description: 'Pending requests returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPendingRequests(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.listPendingRequests(
        String(userId),
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPendingRequests] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list pending connection requests',
          );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('connections/my')
  @ApiOperation({ summary: 'List my connections' })
  @ApiResponse({ status: 200, description: 'Connections returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyConnections(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.listMyConnections(
        String(userId),
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMyConnections] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list connections');
    }
  }

  // ===== Posts =====

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Post created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPost(@Req() req: AuthRequest, @Body() body: CreatePostDto) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.createPost(
        String(userId),
        body.content,
        body.visibility,
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createPost] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create post');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  @ApiOperation({ summary: 'Get feed posts' })
  @ApiResponse({ status: 200, description: 'Feed returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getFeed(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.listFeedPosts(
        String(userId),
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getFeed] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get feed');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async toggleLike(@Req() req: AuthRequest, @Param() params: SocialIdParamDto) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.toggleLike(
        params.id,
        String(userId),
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[toggleLike] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to toggle like');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addComment(
    @Req() req: AuthRequest,
    @Param() params: SocialIdParamDto,
    @Body() body: AddCommentDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      const tenantId = req.user?.tenantId;
      if (!userId || !tenantId) {
        throw new BadRequestException('User ID or tenantId not found');
      }
      return await this.socialService.addComment(
        params.id,
        String(userId),
        body.content,
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[addComment] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to add comment');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'List comments for a post' })
  @ApiResponse({ status: 200, description: 'Comments returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getComments(@Req() req: AuthRequest, @Param() params: SocialIdParamDto) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('tenantId not found');
      return await this.socialService.listComments(params.id, String(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getComments] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list comments');
    }
  }
}

