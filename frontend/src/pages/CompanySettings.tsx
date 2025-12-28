import { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { Box, Button, Container, Paper, TextField, Typography, Alert, Divider, Chip, Grid } from '@mui/material';
import { Save as SaveIcon, CheckCircle } from '@mui/icons-material';
import api from '../lib/api';

export default function CompanySettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [company, setCompany] = useState({
    companyName: '',
    companyDateOfBirth: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    slug: '',
    domain: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedTermsAt: '',
    acceptedPrivacyAt: '',
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      // API now returns unwrapped response.data directly
      const response = await api.get('/tenant/profile');
      setCompany(response);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || 'Failed to load company settings',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put('/tenant/profile', company);
      setSuccess('Company settings updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          'Failed to update company settings',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading company settings...</Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Company Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Manage your company information and compliance
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              value={company.companyName}
              onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subdomain"
              value={company.slug}
              disabled
              helperText="Subdomain cannot be changed"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Domain"
              value={company.domain}
              disabled
              helperText="Custom domain (read-only)"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Established Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={company.companyDateOfBirth?.substring(0, 10) || ''}
              onChange={(e) => setCompany({ ...company, companyDateOfBirth: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Email"
              type="email"
              value={company.companyEmail}
              onChange={(e) => setCompany({ ...company, companyEmail: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company Phone"
              value={company.companyPhone}
              onChange={(e) => setCompany({ ...company, companyPhone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Address"
              multiline
              rows={2}
              value={company.companyAddress}
              onChange={(e) => setCompany({ ...company, companyAddress: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Compliance Status
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {company.acceptedTerms ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Terms Accepted"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip label="Terms Not Accepted" color="error" variant="outlined" />
              )}
            </Box>
            {company.acceptedTermsAt && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Accepted on: {new Date(company.acceptedTermsAt).toLocaleDateString()}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {company.acceptedPrivacy ? (
                <Chip
                  icon={<CheckCircle />}
                  label="Privacy Accepted"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip label="Privacy Not Accepted" color="error" variant="outlined" />
              )}
            </Box>
            {company.acceptedPrivacyAt && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Accepted on: {new Date(company.acceptedPrivacyAt).toLocaleDateString()}
              </Typography>
            )}
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
    </ErrorBoundary>
  );
}
