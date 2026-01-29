import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmDeal, DealStage, CrmContact, CrmCompany, getDeals, createDeal, updateDealStage, getContacts, getCompanies } from '../api/crm';
import { aiApi } from '../lib/api';
import { useApiErrorToast } from '../providers/QueryProvider';

const STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export default function CrmDealsPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', value: '', contactId: '', companyId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dealsData, contactsData, companiesData] = await Promise.all([
          getDeals(),
          getContacts(),
          getCompanies(),
        ]);
        setDeals(dealsData);
        setContacts(contactsData);
        setCompanies(companiesData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load deals');
        showErrorToast(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | { target: { value: string } }>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createDeal({
        title: form.title,
        value: form.value ? Number(form.value) : undefined,
        contactId: form.contactId || undefined,
        companyId: form.companyId || undefined,
      });
      setDeals((prev) => [created, ...prev]);
      setForm({ title: '', value: '', contactId: '', companyId: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create deal');
      showErrorToast(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageChange = async (id: string, stage: DealStage) => {
    try {
      const updated = await updateDealStage(id, stage);
      setDeals((prev) => prev.map((d) => (d._id === id ? updated : d)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update stage');
      showErrorToast(e);
    }
  };

  const handleGenerateAiSummary = async (deal: CrmDeal) => {
    setAiLoadingId(deal._id);
    setAiSummary(null);
    try {
      const prompt = `You are an assistant helping a sales team prioritize deals. Summarize this CRM deal in 2-3 sentences and propose the single most impactful next step.

Title: ${deal.title}
Value: ${deal.value}
Stage: ${deal.stage}
Contact: ${deal.contactName || 'N/A'}
Company: ${deal.companyName || 'N/A'}`;

      const res = await aiApi.generateCompletion({ prompt, maxTokens: 220, temperature: 0.6 });
      setAiSummary(res.text);
      showSuccessToast('AI suggestion generated for this deal.');
    } catch (e: any) {
      showErrorToast(e);
    } finally {
      setAiLoadingId(null);
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          CRM Deals
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Use the AI assistant below to get next-step recommendations on key deals, and connect extra CRM
          integrations any time from the Marketplace.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Deal
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label="Title" value={form.title} onChange={handleChange('title')} size="small" />
            <TextField label="Value" value={form.value} onChange={handleChange('value')} size="small" />
            <Select
              size="small"
              displayEmpty
              value={form.contactId}
              onChange={handleChange('contactId')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">No contact</MenuItem>
              {contacts.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              displayEmpty
              value={form.companyId}
              onChange={handleChange('companyId')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">No company</MenuItem>
              {companies.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting || !form.title}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading deals...</Typography>
          ) : deals.length === 0 ? (
            <Typography color="text.secondary">No deals yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>AI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deals.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell>{d.title}</TableCell>
                    <TableCell>{d.value}</TableCell>
                    <TableCell>{d.contactName || '—'}</TableCell>
                    <TableCell>{d.companyName || '—'}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={d.stage}
                        onChange={(e: SelectChangeEvent) =>
                          handleStageChange(d._id, e.target.value as DealStage)
                        }
                      >
                        {STAGES.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => void handleGenerateAiSummary(d)}
                        disabled={aiLoadingId === d._id}
                      >
                        {aiLoadingId === d._id ? 'Thinking…' : 'Ask AI'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {aiSummary && (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              AI suggestion
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {aiSummary}
            </Typography>
          </Paper>
        )}
      </Container>
    </ErrorBoundary>
  );
}
