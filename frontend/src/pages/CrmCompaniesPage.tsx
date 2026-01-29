import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmCompany, getCompanies, createCompany } from '../api/crm';

export default function CrmCompaniesPage() {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', website: '', industry: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createCompany({
        name: form.name,
        website: form.website || undefined,
        industry: form.industry || undefined,
      });
      setCompanies((prev) => [created, ...prev]);
      setForm({ name: '', website: '', industry: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          CRM Companies
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Company
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label="Name" value={form.name} onChange={handleChange('name')} size="small" />
            <TextField label="Website" value={form.website} onChange={handleChange('website')} size="small" />
            <TextField label="Industry" value={form.industry} onChange={handleChange('industry')} size="small" />
            <Button variant="contained" onClick={handleSubmit} disabled={submitting || !form.name}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading companies...</Typography>
          ) : companies.length === 0 ? (
            <Typography color="text.secondary">No companies yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Industry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.website || '—'}</TableCell>
                    <TableCell>{c.industry || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
