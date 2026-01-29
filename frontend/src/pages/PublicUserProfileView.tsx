import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { getPublicProfile } from '../api/profiles';

export default function PublicUserProfileView() {
  const { handle } = useParams<{ handle: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!handle) return;
      setLoading(true);
      setError(null);
      try {
        const p = await getPublicProfile(handle);
        setProfile(p);
      } catch (e: any) {
        setError(e?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [handle]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Profile not found'}</Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar src={profile.avatarUrl || undefined} sx={{ width: 80, height: 80 }}>
              {profile.handle?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4">{profile.handle}</Typography>
              {profile.headline && (
                <Typography variant="subtitle1" color="text.secondary">
                  {profile.headline}
                </Typography>
              )}
              {profile.location && (
                <Typography variant="body2" color="text.secondary">
                  {profile.location}
                </Typography>
              )}
            </Box>
          </Stack>

          {profile.bio && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">About</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {profile.bio}
              </Typography>
            </Box>
          )}

          {profile.currentTitle && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Current Role</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {profile.currentTitle}
                {profile.currentCompanyName ? ` at ${profile.currentCompanyName}` : ''}
              </Typography>
            </Box>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Skills</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {profile.skills.map((s: string) => (
                  <Chip key={s} label={s} size="small" sx={{ mb: 1 }} />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
