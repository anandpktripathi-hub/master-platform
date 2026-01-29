import api from './client';

export interface Connection {
  _id: string;
  connectedUser: {
    _id: string;
    name: string;
    email: string;
  };
  acceptedAt?: string;
}

export interface ConnectionRequest {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Post {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  visibility: 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE';
  createdAt: string;
}

export interface Comment {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

// Connections
export async function sendConnectionRequest(recipientId: string) {
  const res = await api.post<ConnectionRequest>('/social/connections/request', { recipientId });
  return res.data;
}

export async function acceptConnectionRequest(id: string) {
  const res = await api.patch<ConnectionRequest>(`/social/connections/${id}/accept`);
  return res.data;
}

export async function rejectConnectionRequest(id: string) {
  const res = await api.patch<ConnectionRequest>(`/social/connections/${id}/reject`);
  return res.data;
}

export async function getPendingRequests() {
  const res = await api.get<ConnectionRequest[]>('/social/connections/pending');
  return res.data;
}

export async function getMyConnections() {
  const res = await api.get<Connection[]>('/social/connections/my');
  return res.data;
}

// Posts
export async function createPost(content: string, visibility: Post['visibility'] = 'PUBLIC') {
  const res = await api.post<Post>('/social/posts', { content, visibility });
  return res.data;
}

export async function getFeed() {
  const res = await api.get<Post[]>('/social/feed');
  return res.data;
}

export async function toggleLike(postId: string) {
  const res = await api.patch<Post>(`/social/posts/${postId}/like`);
  return res.data;
}

export async function addComment(postId: string, content: string) {
  const res = await api.post<Comment>(`/social/posts/${postId}/comments`, { content });
  return res.data;
}

export async function getComments(postId: string) {
  const res = await api.get<Comment[]>(`/social/posts/${postId}/comments`);
  return res.data;
}
