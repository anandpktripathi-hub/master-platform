import mongoose from 'mongoose';
import {
  UserConnectionSchema,
} from '../database/schemas/user-connection.schema';
import { UserPostSchema } from '../database/schemas/user-post.schema';
import { PostCommentSchema } from '../database/schemas/post-comment.schema';

async function addSocialIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const UserConnection = mongoose.model('UserConnection', UserConnectionSchema);
  const UserPost = mongoose.model('UserPost', UserPostSchema);
  const PostComment = mongoose.model('PostComment', PostCommentSchema);

  // Connections
  await UserConnection.collection.createIndex(
    { tenantId: 1, requesterId: 1, recipientId: 1 },
    { unique: true, name: 'tenant_requester_recipient_unique' },
  );
  await UserConnection.collection.createIndex(
    { tenantId: 1, recipientId: 1, status: 1, createdAt: -1 },
    { name: 'tenant_recipient_status_createdAt' },
  );

  // Posts / feed
  await UserPost.collection.createIndex(
    { tenantId: 1, authorId: 1, createdAt: -1 },
    { name: 'tenant_author_createdAt' },
  );
  await UserPost.collection.createIndex(
    { tenantId: 1, visibility: 1, createdAt: -1 },
    { name: 'tenant_visibility_createdAt' },
  );

  // Comments
  await PostComment.collection.createIndex(
    { tenantId: 1, postId: 1, createdAt: 1 },
    { name: 'tenant_post_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Social indexes created/ensured.');
}

addSocialIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
