import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../services/api';
import type { OfflinePaymentRequest } from '../types/billing.types';

const OfflinePaymentsAdminPage: React.FC = () => {
  const [requests, setRequests] = useState<OfflinePaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantFilter, setTenantFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = tenantFilter ? { tenantId: tenantFilter } : undefined;
      const data = await api.get<OfflinePaymentRequest[]>('/offline-payments', {
        params,
      } as any);
      setRequests(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load offline payment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(id);
      setError(null);
      await api.patch(`/offline-payments/${id}/status`, { status });
      await fetchRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to update offline payment status.');
    } finally {
      setUpdatingId(null);
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
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Offline Payments – Admin Review
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Review and approve or reject offline payment requests submitted by tenants. Approving a request will automatically record a paid billing entry for the tenant.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          label="Filter by Tenant ID"
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={fetchRequests} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !requests.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No offline payment requests found.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {requests.map((req) => (
            <Card key={req._id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Tenant: {req.tenantId}
                    </Typography>
                    <Typography variant="body2">
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

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={req.status.toUpperCase()}
                      color={statusColor(req.status) as any}
                      variant="outlined"
                    />

                    {req.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusChange(req._id, 'approved')}
                          disabled={updatingId === req._id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusChange(req._id, 'rejected')}
                          disabled={updatingId === req._id}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OfflinePaymentsAdminPage;
