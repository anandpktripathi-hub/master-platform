import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from '../../database/schemas/chat-room.schema';
import { ChatMessage, ChatMessageSchema } from '../../database/schemas/chat-message.schema';
import { ChatRoomMember, ChatRoomMemberSchema } from '../../database/schemas/chat-room-member.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoomMember.name, schema: ChatRoomMemberSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationsModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
