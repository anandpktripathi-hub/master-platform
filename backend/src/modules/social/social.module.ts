import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserConnection,
  UserConnectionSchema,
} from '../../database/schemas/user-connection.schema';
import {
  UserPost,
  UserPostSchema,
} from '../../database/schemas/user-post.schema';
import {
  PostComment,
  PostCommentSchema,
} from '../../database/schemas/post-comment.schema';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserConnection.name, schema: UserConnectionSchema },
      { name: UserPost.name, schema: UserPostSchema },
      { name: PostComment.name, schema: PostCommentSchema },
    ]),
  ],
  providers: [SocialService],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
