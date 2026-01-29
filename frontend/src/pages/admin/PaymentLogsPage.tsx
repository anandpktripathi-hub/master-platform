import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

interface PaymentLog {
  transactionId: string;
  tenantId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  error?: string;
  createdAt: string;
}

export default function PaymentLogsPage() {
  const [tenantFilter, setTenantFilter] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const logsQuery = useQuery({
    queryKey: ['payment-logs', tenantFilter, fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (tenantFilter.trim()) {
        params.tenantId = tenantFilter.trim();
      }
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }
      const data = await api.get('/payments/logs', { params });
      return data as PaymentLog[];
    },
  });

  const { data, isLoading, isError, refetch } = logsQuery;

  const handleDownloadCsv = () => {
    if (!data || data.length === 0) return;

    const headers = [
      'createdAt',
      'tenantId',
      'packageId',
      'amount',
      'currency',
      'status',
      'error',
      'transactionId',
    ];

    const escape = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = data.map((log) => [
      log.createdAt,
      log.tenantId,
      log.packageId,
      log.amount.toFixed(2),
      log.currency,
      log.status,
      log.error || '',
      log.transactionId,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = new Date().toISOString().split('T')[0];
    a.download = `payment-activity-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Payment Activity</Typography>
          <Typography variant="body2" color="textSecondary">
            View and export recent payment attempts for troubleshooting billing issues across tenants.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleDownloadCsv}
            disabled={!data || data.length === 0}
          >
            Download CSV
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Filter by Tenant ID"
              size="small"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              sx={{ maxWidth: 320 }}
            />
            <TextField
              label="From date"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              sx={{ maxWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To date"
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              sx={{ maxWidth: 180 }}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {isLoading && <LoadingState variant="table" fullHeight />}
          {isError && !isLoading && (
            <ErrorState message="Unable to load payment logs." onRetry={() => refetch()} />
          )}

          {!isLoading && !isError && (!data || data.length === 0) && (
            <Typography variant="body2" color="textSecondary">
              No payment activity recorded yet.
            </Typography>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Tenant ID</TableCell>
                    <TableCell>Package ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Error</TableCell>
                    <TableCell>Transaction ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((log) => (
                    <TableRow key={`${log.transactionId}-${log.createdAt}`}>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                          {log.tenantId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                          {log.packageId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {log.currency} {log.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status.toUpperCase()}
                          size="small"
                          color={log.status === 'success' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 220 }}>
                          {log.error || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {log.transactionId}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
