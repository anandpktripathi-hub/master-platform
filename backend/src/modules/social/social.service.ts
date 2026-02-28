import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserConnection,
  UserConnectionDocument,
} from '../../database/schemas/user-connection.schema';
import {
  UserPost,
  UserPostDocument,
} from '../../database/schemas/user-post.schema';
import {
  PostComment,
  PostCommentDocument,
} from '../../database/schemas/post-comment.schema';

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

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  // ===== Connections =====

  async sendConnectionRequest(
    requesterId: string,
    recipientId: string,
    tenantId: string,
  ) {
    if (requesterId === recipientId) {
      throw new BadRequestException('Cannot connect to yourself');
    }
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const requesterOid = this.toObjectId(requesterId, 'requesterId');
    const recipientOid = this.toObjectId(recipientId, 'recipientId');
    const existing = await this.connectionModel.findOne({
      tenantId: tenantOid,
      $or: [
        { requesterId: requesterOid, recipientId: recipientOid },
        { requesterId: recipientOid, recipientId: requesterOid },
      ],
    });
    if (existing) {
      throw new BadRequestException('Connection already exists or pending');
    }
    return this.connectionModel.create({
      requesterId: requesterOid,
      recipientId: recipientOid,
      tenantId: tenantOid,
      status: 'PENDING',
    });
  }

  async acceptConnectionRequest(
    userId: string,
    connectionId: string,
    tenantId: string,
  ) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const conn = await this.connectionModel.findOne({
      _id: this.toObjectId(connectionId, 'connectionId'),
      tenantId: tenantOid,
      recipientId: this.toObjectId(userId, 'userId'),
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

  async rejectConnectionRequest(
    userId: string,
    connectionId: string,
    tenantId: string,
  ) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const conn = await this.connectionModel.findOne({
      _id: this.toObjectId(connectionId, 'connectionId'),
      tenantId: tenantOid,
      recipientId: this.toObjectId(userId, 'userId'),
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
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.connectionModel
      .find({
        tenantId: tenantOid,
        recipientId: this.toObjectId(userId, 'userId'),
        status: 'PENDING',
      })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async listMyConnections(userId: string, tenantId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const userOid = this.toObjectId(userId, 'userId');
    const connections = await this.connectionModel
      .find({
        $or: [
          {
            tenantId: tenantOid,
            requesterId: userOid,
            status: 'ACCEPTED',
          },
          {
            tenantId: tenantOid,
            recipientId: userOid,
            status: 'ACCEPTED',
          },
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

  async areConnected(
    userId1: string,
    userId2: string,
    tenantId: string,
  ): Promise<boolean> {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const userOid1 = this.toObjectId(userId1, 'userId1');
    const userOid2 = this.toObjectId(userId2, 'userId2');
    const conn = await this.connectionModel.findOne({
      $or: [
        {
          tenantId: tenantOid,
          requesterId: userOid1,
          recipientId: userOid2,
          status: 'ACCEPTED',
        },
        {
          tenantId: tenantOid,
          requesterId: userOid2,
          recipientId: userOid1,
          status: 'ACCEPTED',
        },
      ],
    });
    return !!conn;
  }

  // ===== Posts =====

  async createPost(
    authorId: string,
    content: string,
    visibility: UserPost['visibility'] = 'PUBLIC',
    tenantId: string,
  ) {
    if (!content?.trim()) {
      throw new BadRequestException('Content is required');
    }
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.postModel.create({
      authorId: this.toObjectId(authorId, 'authorId'),
      tenantId: tenantOid,
      content,
      visibility,
      likes: [],
      likeCount: 0,
      commentCount: 0,
    });
  }

  async listFeedPosts(userId: string, tenantId: string, limit = 50) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const userOid = this.toObjectId(userId, 'userId');
    // Get user's connections
    const connections = await this.connectionModel
      .find({
        $or: [
          {
            tenantId: tenantOid,
            requesterId: userOid,
            status: 'ACCEPTED',
          },
          {
            tenantId: tenantOid,
            recipientId: userOid,
            status: 'ACCEPTED',
          },
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
          { tenantId: tenantOid, authorId: userOid },
          { tenantId: tenantOid, visibility: 'PUBLIC' },
          {
            tenantId: tenantOid,
            visibility: 'CONNECTIONS_ONLY',
            authorId: { $in: connectionIds },
          },
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
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const post = await this.postModel.findOne({
      _id: this.toObjectId(postId, 'postId'),
      tenantId: tenantOid,
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const userOid = this.toObjectId(userId, 'userId');
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

  async addComment(
    postId: string,
    authorId: string,
    content: string,
    tenantId: string,
  ) {
    if (!content?.trim()) {
      throw new BadRequestException('Content is required');
    }
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    const post = await this.postModel.findOne({
      _id: this.toObjectId(postId, 'postId'),
      tenantId: tenantOid,
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    const comment = await this.commentModel.create({
      postId: this.toObjectId(postId, 'postId'),
      authorId: this.toObjectId(authorId, 'authorId'),
      tenantId: tenantOid,
      content,
    });
    await this.postModel.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });
    return comment;
  }

  async listComments(postId: string, tenantId: string) {
    const tenantOid = this.toObjectId(tenantId, 'tenantId');
    return this.commentModel
      .find({ postId: this.toObjectId(postId, 'postId'), tenantId: tenantOid })
      .populate('authorId', 'name email')
      .sort({ createdAt: 1 })
      .lean();
  }
}

