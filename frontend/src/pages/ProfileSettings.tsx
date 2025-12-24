import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import api from '../lib/api';

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    secondName: '',
    lastName: '',
    dateOfBirth: '',
    username: '',
    email: '',
    phone: '',
    homeAddress: '',
    positionInCompany: '',
    companyEmailForUser: '',
    companyPhoneForUser: '',
    companyIdNumberForUser: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // API now returns unwrapped response.data directly
      const response = await api.get('/me/profile');
      setProfile(response);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/me/profile', profile);
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Personal Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Update your personal information
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Middle Name"
              value={profile.secondName}
              onChange={(e) => setProfile({ ...profile, secondName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={profile.dateOfBirth?.substring(0, 10) || ''}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={profile.username}
              disabled
              helperText="Username cannot be changed"
            />
          </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profile.email}
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </Grid>
            <Grid item xs={12}>
            <TextField
              fullWidth
              label="Home Address"
              multiline
              rows={2}
              value={profile.homeAddress}
              onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Work Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Position in Company"
              value={profile.positionInCompany}
              onChange={(e) => setProfile({ ...profile, positionInCompany: e.target.value })}
            />
          </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Work Email"
              type="email"
              value={profile.companyEmailForUser}
              onChange={(e) => setProfile({ ...profile, companyEmailForUser: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Work Phone"
              value={profile.companyPhoneForUser}
              onChange={(e) => setProfile({ ...profile, companyPhoneForUser: e.target.value })}
            />
          </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Employee ID"
              value={profile.companyIdNumberForUser}
              onChange={(e) => setProfile({ ...profile, companyIdNumberForUser: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
