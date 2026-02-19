import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import api from '../services/api';
import type { OfflinePaymentRequest } from '../types/billing.types';

const OfflinePaymentsPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('bank_transfer');
  const [description, setDescription] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requests, setRequests] = useState<OfflinePaymentRequest[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoadingList(true);
      const data = await api.get<OfflinePaymentRequest[]>('/offline-payments/me');
      setRequests(data || []);
    } catch (err: any) {
      // Non-fatal for dashboard
      console.error('Failed to load offline payments', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/offline-payments', {
        amount: numericAmount,
        currency,
        method,
        description: description || undefined,
        proofUrl: proofUrl || undefined,
      });
      setSuccess('Offline payment request submitted. Our team will review it shortly.');
      setAmount('');
      setDescription('');
      setProofUrl('');
      fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit offline payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: OfflinePaymentRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Offline / Bank Transfer Payments
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use this form to submit payments made via bank transfer or other offline methods. Attach a proof URL (e.g. screenshot link) if available.
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 0, step: '0.01' }}
              />

              <TextField
                select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                fullWidth
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
              </TextField>

              <TextField
                select
                label="Method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                fullWidth
              >
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="manual">Manual Adjustment</MenuItem>
              </TextField>

              <TextField
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />

              <TextField
                label="Proof URL (optional)"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://..."
                fullWidth
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? <CircularProgress size={20} /> : 'Submit Offline Payment'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Your Offline Payment Requests
      </Typography>

      {loadingList ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You have not submitted any offline payment requests yet.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {requests.map((req) => (
            <Card key={req._id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      {req.amount} {req.currency} via {req.method}
                    </Typography>
                    {req.description && (
                      <Typography variant="body2" color="text.secondary">
                        {req.description}
                      </Typography>
                    )}
                    {req.proofUrl && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Proof: <a href={req.proofUrl} target="_blank" rel="noreferrer">{req.proofUrl}</a>
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Created at: {new Date(req.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={req.status.toUpperCase()}
                    color={statusColor(req.status) as any}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OfflinePaymentsPage;
