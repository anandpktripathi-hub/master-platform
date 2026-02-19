import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import api from '../../services/api';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { formatCurrencyWithSettings, formatDateWithSystemSettings } from '../../utils/formatting';

type BillingRecordStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PROCESSING' | 'UNKNOWN';

type AdminBillingRecord = {
  _id: string;
  tenantId: string;
  amount: number; // major units (backend schema)
  currency: string;
  status: string;
  createdAt: string;
};

const STATUSES: (BillingRecordStatus | 'ALL')[] = [
  'ALL',
  'PAID',
  'PENDING',
  'FAILED',
  'REFUNDED',
  'PROCESSING',
];

function normalizeStatus(value: string | undefined | null): BillingRecordStatus {
  const raw = String(value || '').toUpperCase();
  if (raw === 'PAID') return 'PAID';
  if (raw === 'PENDING') return 'PENDING';
  if (raw === 'FAILED') return 'FAILED';
  if (raw === 'REFUNDED') return 'REFUNDED';
  if (raw === 'PROCESSING') return 'PROCESSING';
  return 'UNKNOWN';
}

function statusColor(
  status: BillingRecordStatus,
): 'success' | 'warning' | 'error' | 'info' | 'default' {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
    case 'PROCESSING':
      return 'info';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'warning';
    default:
      return 'default';
  }
}

export default function AdminInvoicesPage() {
  const { system, currency } = useAdminSettings();

  const [tenantFilter, setTenantFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<BillingRecordStatus | 'ALL'>('ALL');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminBillingRecord | null>(null);

  const [createForm, setCreateForm] = React.useState({
    tenantId: '',
    amount: '',
    currency: 'USD',
    status: 'PAID' as BillingRecordStatus,
  });

  const [editForm, setEditForm] = React.useState({
    amount: '',
    currency: 'USD',
    status: 'PAID' as BillingRecordStatus,
  });

  const billingsQuery = useQuery({
    queryKey: ['admin-billings', tenantFilter, statusFilter, fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (tenantFilter.trim()) params.tenantId = tenantFilter.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const data = await api.get('/billings/admin/all', { params });
      return (Array.isArray(data) ? data : []) as AdminBillingRecord[];
    },
  });

  const { data, isLoading, isError, refetch } = billingsQuery;

  const totalAmountMajor = React.useMemo(() => {
    return (data || []).reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0);
  }, [data]);

  const handleDownloadCsv = () => {
    if (!data || data.length === 0) return;

    const headers = ['createdAt', 'tenantId', 'amount', 'currency', 'status', 'id'];
    const escape = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = data.map((r) => [
      r.createdAt,
      r.tenantId,
      r.amount,
      r.currency,
      normalizeStatus(r.status),
      r._id,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = new Date().toISOString().split('T')[0];
    a.download = `billing-records-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => {
    setCreateForm({ tenantId: '', amount: '', currency: 'USD', status: 'PAID' });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    const payload = {
      tenantId: createForm.tenantId.trim(),
      amount: Number(createForm.amount || 0),
      currency: createForm.currency || 'USD',
      status: createForm.status,
    };
    await api.post('/billings/admin', payload);
    setCreateOpen(false);
    refetch();
  };

  const openEdit = (record: AdminBillingRecord) => {
    setEditing(record);
    setEditForm({
      amount: String(record.amount ?? ''),
      currency: record.currency || 'USD',
      status: normalizeStatus(record.status),
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editing) return;
    const payload = {
      amount: Number(editForm.amount || 0),
      currency: editForm.currency || 'USD',
      status: editForm.status,
    };
    await api.patch(`/billings/admin/${editing._id}`, payload);
    setEditOpen(false);
    setEditing(null);
    refetch();
  };

  const deleteRecord = async (record: AdminBillingRecord) => {
    await api.delete(`/billings/admin/${record._id}`);
    refetch();
  };

  const formatMoney = (amountMajor: number, currencyCode?: string | null) => {
    const cents = Math.round((typeof amountMajor === 'number' ? amountMajor : 0) * 100);
    return formatCurrencyWithSettings(cents, currencyCode || null, currency);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Billing Records (Admin)</Typography>
          <Typography variant="body2" color="textSecondary">
            Manual billing mode: cross-tenant billing records for reconciliation and reporting.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={openCreate}>
            New Record
          </Button>
          <Button variant="outlined" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="contained" onClick={handleDownloadCsv} disabled={!data || data.length === 0}>
            Download CSV
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              label="Tenant ID"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 260 }}
            />
            <TextField
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              size="small"
              select
              sx={{ minWidth: 180 }}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ flex: 1 }} />
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total
              </Typography>
              <Typography variant="h6">
                {formatMoney(totalAmountMajor, data?.[0]?.currency || null)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Failed to load billing records" />}

      {!isLoading && !isError && (
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data || []).map((r) => {
                  const s = normalizeStatus(r.status);
                  return (
                    <TableRow key={r._id} hover>
                      <TableCell>{formatDateWithSystemSettings(r.createdAt, system)}</TableCell>
                      <TableCell>{r.tenantId}</TableCell>
                      <TableCell align="right">{formatMoney(r.amount, r.currency)}</TableCell>
                      <TableCell>{r.currency}</TableCell>
                      <TableCell>
                        <Chip size="small" label={s} color={statusColor(s)} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r._id}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => openEdit(r)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => deleteRecord(r)}>
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="textSecondary">
                        No billing records found for current filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Billing Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tenant ID"
              value={createForm.tenantId}
              onChange={(e) => setCreateForm((p) => ({ ...p, tenantId: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Amount (major units)"
              value={createForm.amount}
              onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
              type="number"
              fullWidth
            />
            <TextField
              label="Currency"
              value={createForm.currency}
              onChange={(e) => setCreateForm((p) => ({ ...p, currency: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Status"
              value={createForm.status}
              onChange={(e) => setCreateForm((p) => ({ ...p, status: e.target.value as BillingRecordStatus }))}
              select
              fullWidth
            >
              {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Billing Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Amount (major units)"
              value={editForm.amount}
              onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
              type="number"
              fullWidth
            />
            <TextField
              label="Currency"
              value={editForm.currency}
              onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as BillingRecordStatus }))}
              select
              fullWidth
            >
              {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
