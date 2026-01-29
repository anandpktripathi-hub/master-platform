import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Chip, Stack, Alert } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { getMyPublicProfile, updateMyPublicProfile, checkHandleAvailability } from '../api/profiles';

export default function ProfilePublicEdit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    handle: '',
    headline: '',
    bio: '',
    location: '',
    currentTitle: '',
    currentCompanyName: '',
    skillsText: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await getMyPublicProfile();
        setForm({
          handle: p.handle || '',
          headline: p.headline || '',
          bio: p.bio || '',
          location: p.location || '',
          currentTitle: p.currentTitle || '',
          currentCompanyName: p.currentCompanyName || '',
          skillsText: (p.skills || []).join(', '),
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load public profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: e.target.value });
      if (field === 'handle') setHandleAvailable(null);
    };

  const handleCheckHandle = async () => {
    if (!form.handle) return;
    try {
      const res = await checkHandleAvailability(form.handle);
      setHandleAvailable(res.available);
    } catch (e: any) {
      setError(e?.message || 'Failed to check handle');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const skills = form.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await updateMyPublicProfile({
        handle: form.handle || undefined,
        headline: form.headline || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        currentTitle: form.currentTitle || undefined,
        currentCompanyName: form.currentCompanyName || undefined,
        skills,
      });
      setSuccess('Public profile updated');
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading public profile...</Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Public Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This information will appear on your public profile page.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack spacing={3}>
            <TextField
              label="Public Handle"
              helperText="Unique URL handle, e.g. john-doe"
              value={form.handle}
              onChange={onChange('handle')}
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={handleCheckHandle} disabled={!form.handle}>
                    Check
                  </Button>
                ),
              }}
            />
            {handleAvailable !== null && (
              <Chip
                label={handleAvailable ? 'Handle available' : 'Handle taken'}
                color={handleAvailable ? 'success' : 'error'}
                variant="outlined"
              />
            )}

            <TextField
              label="Headline"
              value={form.headline}
              onChange={onChange('headline')}
              fullWidth
            />
            <TextField
              label="Bio"
              value={form.bio}
              onChange={onChange('bio')}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Location"
              value={form.location}
              onChange={onChange('location')}
              fullWidth
            />
            <TextField
              label="Current Title"
              value={form.currentTitle}
              onChange={onChange('currentTitle')}
              fullWidth
            />
            <TextField
              label="Current Company"
              value={form.currentCompanyName}
              onChange={onChange('currentCompanyName')}
              fullWidth
            />
            <TextField
              label="Skills (comma separated)"
              value={form.skillsText}
              onChange={onChange('skillsText')}
              fullWidth
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
