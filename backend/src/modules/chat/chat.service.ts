import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject } from 'rxjs';
import { ChatRoom, ChatRoomDocument } from '../../database/schemas/chat-room.schema';
import { ChatMessage, ChatMessageDocument } from '../../database/schemas/chat-message.schema';
import { ChatRoomMember, ChatRoomMemberDocument } from '../../database/schemas/chat-room-member.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly roomModel: Model<ChatRoomDocument>,
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
    @InjectModel(ChatRoomMember.name)
    private readonly memberModel: Model<ChatRoomMemberDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly notifications: NotificationsService,
    private readonly authService: AuthService,
  ) {}

  private tenantStreams = new Map<string, Subject<{ type: string; payload: any }>>();

  getTenantEventStream(tenantId: string): Subject<{ type: string; payload: any }> {
    let stream = this.tenantStreams.get(tenantId);
    if (!stream) {
      stream = new Subject<{ type: string; payload: any }>();
      this.tenantStreams.set(tenantId, stream);
    }
    return stream;
  }

  async listRooms(tenantId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const rooms = await this.roomModel
      .find({ tenantId: tenantObjectId })
      .sort({ isDefault: -1, createdAt: 1 })
      .lean();

    if (rooms.length > 0) {
      return rooms;
    }

    // Bootstrap a default "General" room if none exist yet for this tenant
    const created = await this.roomModel.create({
      tenantId: tenantObjectId,
      name: 'General',
      description: 'Default room for this workspace',
      isDefault: true,
    });

    return [created.toObject()];
  }

  async createRoom(tenantId: string, createdByUserId: string, payload: { name: string; description?: string }) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const userObjectId = new Types.ObjectId(createdByUserId);

    const room = await this.roomModel.create({
      tenantId: tenantObjectId,
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      isDefault: false,
      createdByUserId: userObjectId,
      isPrivate: (payload as any).isPrivate === true,
    });

    await this.ensureMember(tenantId, room._id.toString(), createdByUserId, 'admin');

    return room.toObject();
  }

  async getRoomForTenant(tenantId: string, roomId: string): Promise<ChatRoomDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = new Types.ObjectId(roomId);

    const room = await this.roomModel.findOne({ _id: roomObjectId, tenantId: tenantObjectId });
    if (!room) {
      throw new NotFoundException('Chat room not found');
    }
    return room;
  }

  async ensureMember(
    tenantId: string,
    roomId: string,
    userId: string,
    role: 'member' | 'admin' = 'member',
  ): Promise<ChatRoomMemberDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = new Types.ObjectId(roomId);
    const userObjectId = new Types.ObjectId(userId);

    const existing = await this.memberModel.findOne({
      tenantId: tenantObjectId,
      roomId: roomObjectId,
      userId: userObjectId,
    });
    if (existing) {
      if (role === 'admin' && existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
      }
      return existing;
    }

    const created = await this.memberModel.create({
      tenantId: tenantObjectId,
      roomId: roomObjectId,
      userId: userObjectId,
      role,
    });
    return created;
  }

  async joinRoom(tenantId: string, roomId: string, userId: string) {
    await this.getRoomForTenant(tenantId, roomId);
    const member = await this.ensureMember(tenantId, roomId, userId, 'member');
    return member.toObject();
  }

  async listMembers(tenantId: string, roomId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = new Types.ObjectId(roomId);

    const members = await this.memberModel
      .find({ tenantId: tenantObjectId, roomId: roomObjectId })
      .populate('userId', 'name email username firstName lastName')
      .lean();
    return members;
  }

  async listMessages(tenantId: string, roomId: string, opts?: { before?: string; limit?: number }) {
    throw new Error('listMessages requires user context; use listMessagesForUser');
  }

  async listMessagesForUser(
    tenantId: string,
    roomId: string,
    userId: string,
    opts?: { before?: string; limit?: number },
  ) {
    const room = await this.getRoomForTenant(tenantId, roomId);
    const tenantObjectId = room.tenantId as Types.ObjectId;
    const roomObjectId = room._id as Types.ObjectId;

    if (room.isPrivate) {
      const canSee = await this.canUserSeeRoom(tenantId, roomId, userId);
      if (!canSee) {
        throw new ForbiddenException('You are not a member of this private room');
      }
    }

    const query: any = {
      tenantId: tenantObjectId,
      roomId: roomObjectId,
    };

    if (opts?.before) {
      const beforeDate = new Date(opts.before);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const limit = opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 200) : 50;

    const docs = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Return messages in chronological order (oldest first)
    return docs.reverse();
  }

  async postMessage(tenantId: string, roomId: string, senderId: string, content: string) {
    const room = await this.getRoomForTenant(tenantId, roomId);
    const tenantObjectId = room.tenantId as Types.ObjectId;
    const roomObjectId = room._id as Types.ObjectId;
    const senderObjectId = new Types.ObjectId(senderId);

    const trimmed = content.trim();
    if (!trimmed) {
      throw new NotFoundException('Message content cannot be empty');
    }

    if (room.isArchived) {
      throw new ForbiddenException('This room is archived and cannot accept new messages');
    }

    await this.ensureMember(tenantId, roomId, senderId, 'member');

    const msg = await this.messageModel.create({
      tenantId: tenantObjectId,
      roomId: roomObjectId,
      senderId: senderObjectId,
      content: trimmed,
    });
    const plain = msg.toObject();

    const tenantIdStr = tenantObjectId.toString();
    this.getTenantEventStream(tenantIdStr).next({
      type: 'message',
      payload: {
        ...plain,
        roomId: roomObjectId.toString(),
        tenantId: tenantIdStr,
      },
    });

    void this.handleMentions(tenantIdStr, roomId, senderId, trimmed).catch(() => undefined);

    return plain;
  }

  async handleMentions(tenantId: string, roomId: string, senderId: string, content: string) {
    const mentionMatches = content.match(/@([a-zA-Z0-9_\.\-]+)/g);
    if (!mentionMatches || mentionMatches.length === 0) return;

    const usernamesOrEmails = Array.from(
      new Set(
        mentionMatches.map((m) => m.slice(1)).filter((v) => v && v.length > 1),
      ),
    );
    if (usernamesOrEmails.length === 0) return;

    const users = await this.userModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        $or: [
          { username: { $in: usernamesOrEmails } },
          { email: { $in: usernamesOrEmails } },
        ],
      })
      .lean();
    if (!users.length) return;

    const room = await this.getRoomForTenant(tenantId, roomId);

    const snippet = content.length > 140 ? `${content.slice(0, 137)}...` : content;
    const linkUrl = `/app/chat?room=${room._id.toString()}`;

    await Promise.all(
      users.map((u) =>
        this.notifications.createForUser({
          tenantId,
          userId: u._id.toString(),
          eventKey: 'chat.mentioned',
          title: `You were mentioned in ${room.name}`,
          message: snippet,
          linkUrl,
        }),
      ),
    );
  }

  async archiveRoom(tenantId: string, roomId: string, archived: boolean) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = new Types.ObjectId(roomId);

    const updated = await this.roomModel.findOneAndUpdate(
      { _id: roomObjectId, tenantId: tenantObjectId },
      { $set: { isArchived: archived } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Chat room not found');
    }

    return updated.toObject();
  }

  async removeMember(tenantId: string, roomId: string, userId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = new Types.ObjectId(roomId);
    const userObjectId = new Types.ObjectId(userId);

    await this.memberModel.deleteOne({
      tenantId: tenantObjectId,
      roomId: roomObjectId,
      userId: userObjectId,
    });

    return { success: true };
  }

  async canUserSeeRoom(
    tenantId: string,
    roomId: string,
    userId: string,
  ): Promise<boolean> {
    const room = await this.getRoomForTenant(tenantId, roomId);
    if (!room.isPrivate) {
      return true;
    }

    const tenantObjectId = new Types.ObjectId(tenantId);
    const roomObjectId = room._id as Types.ObjectId;
    const userObjectId = new Types.ObjectId(userId);

    const member = await this.memberModel
      .findOne({
        tenantId: tenantObjectId,
        roomId: roomObjectId,
        userId: userObjectId,
      })
      .lean();
    return !!member;
  }

  async verifyAccessToken(token: string): Promise<{ sub?: string; email?: string; role?: string; tenantId?: string }> {
    return this.authService.verifyAccessToken(token);
  }
}
