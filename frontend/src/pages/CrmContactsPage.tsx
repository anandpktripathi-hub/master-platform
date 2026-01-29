import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmContact, getContacts, createContact } from '../api/crm';
import { useSampleDataStatus } from '../hooks/useSampleDataStatus';

export default function CrmContactsPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '' });
  const [submitting, setSubmitting] = useState(false);
  const { status: sampleStatus } = useSampleDataStatus();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load contacts');
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
      const created = await createContact({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
      });
      setContacts((prev) => [created, ...prev]);
      setForm({ name: '', email: '', phone: '', companyName: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          CRM Contacts
        </Typography>

        {sampleStatus?.crmSample && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sample CRM records are present in your workspace. You can safely edit or delete them.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Contact
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label="Name" value={form.name} onChange={handleChange('name')} size="small" />
            <TextField label="Email" value={form.email} onChange={handleChange('email')} size="small" />
            <TextField label="Phone" value={form.phone} onChange={handleChange('phone')} size="small" />
            <TextField label="Company" value={form.companyName} onChange={handleChange('companyName')} size="small" />
            <Button variant="contained" onClick={handleSubmit} disabled={submitting || !form.name || !form.email}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading contacts...</Typography>
          ) : contacts.length === 0 ? (
            <Typography color="text.secondary">No contacts yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Company</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone || '—'}</TableCell>
                    <TableCell>{c.companyName || '—'}</TableCell>
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
