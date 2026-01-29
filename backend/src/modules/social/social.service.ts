import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserConnection, UserConnectionDocument } from '../../database/schemas/user-connection.schema';
import { UserPost, UserPostDocument } from '../../database/schemas/user-post.schema';
import { PostComment, PostCommentDocument } from '../../database/schemas/post-comment.schema';

@Injectable()
export class SocialService {
  constructor(
    @InjectModel(UserConnection.name)
    private readonly connectionModel: Model<UserConnectionDocument>,
    @InjectModel(UserPost.name)
    private readonly postModel: Model<UserPostDocument>,
    @InjectModel(PostComment.name)
    private readonly commentModel: Model<PostCommentDocument>,
  ) {}

  // ===== Connections =====

  async sendConnectionRequest(requesterId: string, recipientId: string, tenantId: string) {
    if (requesterId === recipientId) {
      throw new BadRequestException('Cannot connect to yourself');
    }
    const tenantOid = new Types.ObjectId(tenantId);
    const existing = await this.connectionModel.findOne({
      tenantId: tenantOid,
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });
    if (existing) {
      throw new BadRequestException('Connection already exists or pending');
    }
    return this.connectionModel.create({
      requesterId: new Types.ObjectId(requesterId),
      recipientId: new Types.ObjectId(recipientId),
      tenantId: tenantOid,
      status: 'PENDING',
    });
  }

  async acceptConnectionRequest(userId: string, connectionId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    const conn = await this.connectionModel.findOne({
      _id: connectionId,
      tenantId: tenantOid,
      recipientId: new Types.ObjectId(userId),
      status: 'PENDING',
    });
    if (!conn) {
      throw new BadRequestException('Connection request not found');
    }
    conn.status = 'ACCEPTED';
    conn.acceptedAt = new Date();
    await conn.save();
    return conn;
  }

  async rejectConnectionRequest(userId: string, connectionId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    const conn = await this.connectionModel.findOne({
      _id: connectionId,
      tenantId: tenantOid,
      recipientId: new Types.ObjectId(userId),
      status: 'PENDING',
    });
    if (!conn) {
      throw new BadRequestException('Connection request not found');
    }
    conn.status = 'REJECTED';
    await conn.save();
    return conn;
  }

  async listPendingRequests(userId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    return this.connectionModel
      .find({
        tenantId: tenantOid,
        recipientId: new Types.ObjectId(userId),
        status: 'PENDING',
      })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async listMyConnections(userId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    const connections = await this.connectionModel
      .find({
        $or: [
          { tenantId: tenantOid, requesterId: new Types.ObjectId(userId), status: 'ACCEPTED' },
          { tenantId: tenantOid, recipientId: new Types.ObjectId(userId), status: 'ACCEPTED' },
        ],
      })
      .populate('requesterId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ acceptedAt: -1 })
      .lean();

    // Return the other user's info
    return connections.map((c: any) => {
      const isRequester = String(c.requesterId._id) === userId;
      return {
        _id: c._id,
        connectedUser: isRequester ? c.recipientId : c.requesterId,
        acceptedAt: c.acceptedAt,
      };
    });
  }

  async areConnected(userId1: string, userId2: string, tenantId: string): Promise<boolean> {
    const tenantOid = new Types.ObjectId(tenantId);
    const conn = await this.connectionModel.findOne({
      $or: [
        { tenantId: tenantOid, requesterId: userId1, recipientId: userId2, status: 'ACCEPTED' },
        { tenantId: tenantOid, requesterId: userId2, recipientId: userId1, status: 'ACCEPTED' },
      ],
    });
    return !!conn;
  }

  // ===== Posts =====

  async createPost(authorId: string, content: string, visibility: UserPost['visibility'] = 'PUBLIC', tenantId: string) {
    if (!content?.trim()) {
      throw new BadRequestException('Content is required');
    }
    const tenantOid = new Types.ObjectId(tenantId);
    return this.postModel.create({
      authorId: new Types.ObjectId(authorId),
      tenantId: tenantOid,
      content,
      visibility,
      likes: [],
      likeCount: 0,
      commentCount: 0,
    });
  }

  async listFeedPosts(userId: string, tenantId: string, limit = 50) {
    const tenantOid = new Types.ObjectId(tenantId);
    // Get user's connections
    const connections = await this.connectionModel
      .find({
        $or: [
          { tenantId: tenantOid, requesterId: new Types.ObjectId(userId), status: 'ACCEPTED' },
          { tenantId: tenantOid, recipientId: new Types.ObjectId(userId), status: 'ACCEPTED' },
        ],
      })
      .lean();

    const connectionIds = connections.map((c: any) => {
      const isReq = String(c.requesterId) === userId;
      return isReq ? c.recipientId : c.requesterId;
    });

    // Feed includes own posts, public posts, and connection-only posts from connections
    const posts = await this.postModel
      .find({
        $or: [
          { tenantId: tenantOid, authorId: new Types.ObjectId(userId) },
          { tenantId: tenantOid, visibility: 'PUBLIC' },
          { tenantId: tenantOid, visibility: 'CONNECTIONS_ONLY', authorId: { $in: connectionIds } },
        ],
      })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return posts.map((p: any) => ({
      ...p,
      isLiked: p.likes?.some((id: any) => String(id) === userId),
    }));
  }

  async toggleLike(postId: string, userId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    const post = await this.postModel.findOne({ _id: postId, tenantId: tenantOid });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const userOid = new Types.ObjectId(userId);
    const idx = post.likes.findIndex((id) => id.equals(userOid));
    if (idx >= 0) {
      post.likes.splice(idx, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(userOid);
      post.likeCount += 1;
    }
    await post.save();
    return post.toObject();
  }

  async addComment(postId: string, authorId: string, content: string, tenantId: string) {
    if (!content?.trim()) {
      throw new BadRequestException('Content is required');
    }
    const tenantOid = new Types.ObjectId(tenantId);
    const post = await this.postModel.findOne({ _id: postId, tenantId: tenantOid });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      authorId: new Types.ObjectId(authorId),
      tenantId: tenantOid,
      content,
    });
    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    return comment;
  }

  async listComments(postId: string, tenantId: string) {
    const tenantOid = new Types.ObjectId(tenantId);
    return this.commentModel
      .find({ postId, tenantId: tenantOid })
      .populate('authorId', 'name email')
      .sort({ createdAt: 1 })
      .lean();
  }
}
