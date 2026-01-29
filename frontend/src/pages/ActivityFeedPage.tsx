import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Card, CardContent, CardActions, IconButton, Collapse, Alert, Select, MenuItem } from '@mui/material';
import { ThumbUp, ThumbUpOutlined, Comment as CommentIcon } from '@mui/icons-material';
import ErrorBoundary from '../components/ErrorBoundary';
import { Post, Comment, getFeed, createPost, toggleLike, addComment, getComments } from '../api/social';
import { useSampleDataStatus } from '../hooks/useSampleDataStatus';

export default function ActivityFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ content: '', visibility: 'PUBLIC' as Post['visibility'] });
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const { status: sampleStatus } = useSampleDataStatus();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeed();
      setPosts(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createPost(newPost.content, newPost.visibility);
      setPosts((prev) => [created, ...prev]);
      setNewPost({ content: '', visibility: 'PUBLIC' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likeCount: updated.likeCount, isLiked: !p.isLiked } : p)));
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle like');
    }
  };

  const handleExpandComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        try {
          const data = await getComments(postId);
          setComments((prev) => ({ ...prev, [postId]: data }));
        } catch (e: any) {
          setError(e?.message || 'Failed to load comments');
        }
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    try {
      const created = await addComment(postId, content);
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), created] }));
      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)));
    } catch (e: any) {
      setError(e?.message || 'Failed to add comment');
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Activity Feed
        </Typography>

        {sampleStatus?.socialSample && (
          <Alert severity="info" sx={{ mb: 2 }}>
            A sample post is present to demonstrate your social feed. You can safely edit or remove it.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Share something
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Select
              size="small"
              value={newPost.visibility}
              onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value as Post['visibility'] })}
            >
              <MenuItem value="PUBLIC">Public</MenuItem>
              <MenuItem value="CONNECTIONS_ONLY">Connections Only</MenuItem>
              <MenuItem value="PRIVATE">Private</MenuItem>
            </Select>
            <Button variant="contained" onClick={handleCreatePost} disabled={submitting || !newPost.content.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </Paper>

        {loading ? (
          <Typography>Loading feed...</Typography>
        ) : posts.length === 0 ? (
          <Typography color="text.secondary">No posts yet. Share something!</Typography>
        ) : (
          posts.map((post) => (
            <Card key={post._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {post.authorId.name} • {new Date(post.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => handleToggleLike(post._id)}>
                  {post.isLiked ? <ThumbUp color="primary" /> : <ThumbUpOutlined />}
                </IconButton>
                <Typography variant="body2">{post.likeCount}</Typography>
                <IconButton size="small" onClick={() => handleExpandComments(post._id)}>
                  <CommentIcon />
                </IconButton>
                <Typography variant="body2">{post.commentCount}</Typography>
              </CardActions>
              <Collapse in={expandedPost === post._id}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {comments[post._id]?.map((c) => (
                    <Box key={c._id} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {c.authorId.name}
                      </Typography>
                      <Typography variant="body2">{c.content}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Add a comment..."
                      value={newComment[post._id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                    />
                    <Button size="small" variant="outlined" onClick={() => handleAddComment(post._id)}>
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Card>
          ))
        )}
      </Container>
    </ErrorBoundary>
  );
}
