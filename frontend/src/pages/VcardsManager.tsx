import React, { useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import vcardService, { VcardPayload } from '../services/vcardService';

interface Vcard extends VcardPayload {
  _id: string;
}

const VcardsManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vcards, setVcards] = useState<Vcard[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vcard | null>(null);
  const [form, setForm] = useState<VcardPayload>({
    displayName: '',
    jobTitle: '',
    companyName: '',
    primaryEmail: '',
    primaryPhone: '',
    websiteUrl: '',
    city: '',
    country: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vcardService.list();
      setVcards(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load vCards';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNewDialog = () => {
    setEditing(null);
    setForm({
      displayName: '',
      jobTitle: '',
      companyName: '',
      primaryEmail: '',
      primaryPhone: '',
      websiteUrl: '',
      city: '',
      country: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (v: Vcard) => {
    setEditing(v);
    setForm({
      displayName: v.displayName,
      jobTitle: v.jobTitle,
      companyName: v.companyName,
      primaryEmail: v.primaryEmail,
      primaryPhone: v.primaryPhone,
      websiteUrl: v.websiteUrl,
      city: v.city,
      country: v.country,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!form.displayName) {
        enqueueSnackbar('Display name is required', { variant: 'warning' });
        return;
      }
      if (editing) {
        await vcardService.update(editing._id, form);
        enqueueSnackbar('vCard updated', { variant: 'success' });
      } else {
        await vcardService.create(form);
        enqueueSnackbar('vCard created', { variant: 'success' });
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save vCard';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this vCard?')) return;
    try {
      await vcardService.remove(id);
      enqueueSnackbar('vCard deleted', { variant: 'success' });
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vCard';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  let content;
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = <Alert severity="error">{error}</Alert>;
  } else {
    content = (
      <Grid container spacing={3}>
        {vcards.map((v) => (
          <Grid item xs={12} md={6} key={v._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{v.displayName}</Typography>
                    {v.jobTitle && (
                      <Typography variant="body2" color="text.secondary">
                        {v.jobTitle}{v.companyName ? ` at ${v.companyName}` : ''}
                      </Typography>
                    )}
                    {v.primaryEmail && (
                      <Typography variant="body2" color="text.secondary">{v.primaryEmail}</Typography>
                    )}
                    {v.primaryPhone && (
                      <Typography variant="body2" color="text.secondary">{v.primaryPhone}</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => openEditDialog(v)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(v._id)}>Delete</Button>
                  </Box>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Public link: /vcard/{v._id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              vCards
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create shareable business cards for your team.
            </Typography>
          </Box>
          <Button variant="contained" onClick={openNewDialog}>New vCard</Button>
        </Box>
        {content}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Edit vCard' : 'New vCard'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Display Name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Job Title"
                value={form.jobTitle || ''}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                fullWidth
              />
              <TextField
                label="Company Name"
                value={form.companyName || ''}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Primary Email"
                type="email"
                value={form.primaryEmail || ''}
                onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })}
                fullWidth
              />
              <TextField
                label="Primary Phone"
                value={form.primaryPhone || ''}
                onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Website URL"
                value={form.websiteUrl || ''}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                fullWidth
              />
              <TextField
                label="City"
                value={form.city || ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                fullWidth
              />
              <TextField
                label="Country"
                value={form.country || ''}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default VcardsManager;
