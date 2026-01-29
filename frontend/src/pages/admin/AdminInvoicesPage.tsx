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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import type { Invoice, InvoiceStatus } from '../../types/billing.types';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { formatDateWithSystemSettings, formatCurrencyWithSettings } from '../../utils/formatting';
import { publicSettingsApi, ReportsSettingsDto } from '../../lib/api';

interface AdminInvoice extends Invoice {}

const INVOICE_STATUSES: (InvoiceStatus | 'ALL')[] = [
  'ALL',
  'PAID',
  'PENDING',
  'FAILED',
  'REFUNDED',
  'PROCESSING',
];

const PAYMENT_METHODS: (string | 'ALL')[] = ['ALL', 'STRIPE', 'RAZORPAY', 'PAYPAL', 'MANUAL'];

export default function AdminInvoicesPage() {
  const [tenantFilter, setTenantFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | 'ALL'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<string | 'ALL'>('ALL');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<AdminInvoice | null>(null);

  const [createForm, setCreateForm] = React.useState({
    tenantId: '',
    subscriptionId: '',
    planId: '',
    amount: '',
    currency: 'USD',
    description: '',
    dueDate: '',
    paymentMethod: 'MANUAL',
    notes: '',
  });

  const [editForm, setEditForm] = React.useState({
    description: '',
    notes: '',
    dueDate: '',
  });

  const [createLineItems, setCreateLineItems] = React.useState<{
    description: string;
    quantity: string;
    amount: string;
  }[]>([]);

  const [editLineItems, setEditLineItems] = React.useState<{
    description: string;
    quantity: string;
    amount: string;
  }[]>([]);

  const { system, currency } = useAdminSettings();

  // Load report defaults once to initialize status/date filters from Reports settings
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const defaults: ReportsSettingsDto = await publicSettingsApi.getReportsDefaults();

        if (!mounted) return;

        // Apply defaultStatusFilter if present and valid
        if (defaults.defaultStatusFilter && defaults.defaultStatusFilter.length > 0) {
          const first = defaults.defaultStatusFilter[0].toUpperCase() as InvoiceStatus;
          if ((INVOICE_STATUSES as (InvoiceStatus | 'ALL')[]).includes(first)) {
            setStatusFilter(first);
          }
        }

        // Optional future extension: date offsets could be applied here
      } catch {
        // Ignore; fall back to manual filters
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const invoicesQuery = useQuery({
    queryKey: ['admin-invoices', tenantFilter, statusFilter, paymentMethodFilter, fromDate, toDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (tenantFilter.trim()) {
        params.tenantId = tenantFilter.trim();
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (paymentMethodFilter && paymentMethodFilter !== 'ALL') {
        params.paymentMethod = paymentMethodFilter;
      }
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }
      const data = await api.get('/admin/invoices', { params });
      return data as AdminInvoice[];
    },
  });

  const { data, isLoading, isError, refetch } = invoicesQuery;

  const summary = React.useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const byStatus = new Map<InvoiceStatus, { count: number; amount: number }>();
    let totalAmount = 0;

    data.forEach((invoice) => {
      totalAmount += invoice.amount;
      const key = invoice.status;
      const current = byStatus.get(key) || { count: 0, amount: 0 };
      current.count += 1;
      current.amount += invoice.amount;
      byStatus.set(key, current);
    });

    return { byStatus, totalAmount };
  }, [data]);

  const aging = React.useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const buckets: Record<'0-30' | '31-60' | '61-90' | '90+', { count: number; amount: number }> = {
      '0-30': { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '90+': { count: 0, amount: 0 },
    };

    const now = new Date();

    data.forEach((invoice) => {
      // Consider only open receivables for aging
      if (invoice.status === 'PAID' || invoice.status === 'REFUNDED' || invoice.status === 'FAILED') {
        return;
      }

      const refDateRaw = invoice.dueDate || invoice.createdAt;
      if (!refDateRaw) return;

      const refDate = new Date(refDateRaw as any);
      const diffMs = now.getTime() - refDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let bucketKey: '0-30' | '31-60' | '61-90' | '90+';
      if (days <= 30) {
        bucketKey = '0-30';
      } else if (days <= 60) {
        bucketKey = '31-60';
      } else if (days <= 90) {
        bucketKey = '61-90';
      } else {
        bucketKey = '90+';
      }

      buckets[bucketKey].count += 1;
      buckets[bucketKey].amount += invoice.amount;
    });

    const hasAny = Object.values(buckets).some((b) => b.count > 0 && b.amount !== 0);
    if (!hasAny) return null;

    const totalOpen = Object.values(buckets).reduce((sum, b) => sum + b.amount, 0);
    return { buckets, totalOpen };
  }, [data]);

  const handleOpenCreate = () => {
    setCreateForm({
      tenantId: '',
      subscriptionId: '',
      planId: '',
      amount: '',
      currency: 'USD',
      description: '',
      dueDate: '',
      paymentMethod: 'MANUAL',
      notes: '',
    });
    setCreateLineItems([]);
    setCreateOpen(true);
  };

  const handleSubmitCreate = async () => {
    const payload: any = {
      tenantId: createForm.tenantId.trim(),
      subscriptionId: createForm.subscriptionId.trim(),
      planId: createForm.planId.trim(),
      currency: createForm.currency,
      description: createForm.description || undefined,
      dueDate: createForm.dueDate || undefined,
      paymentMethod: createForm.paymentMethod || undefined,
      notes: createForm.notes || undefined,
    };

    const preparedLineItems = createLineItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity || 1),
        amount: Math.round(Number(item.amount || 0) * 100),
      }))
      .filter((li) => li.description && li.amount > 0 && li.quantity > 0);

    if (preparedLineItems.length > 0) {
      payload.lineItems = preparedLineItems;
      const totalCents = preparedLineItems.reduce(
        (sum, li) => sum + li.amount,
        0,
      );
      payload.amount = totalCents;
    } else {
      payload.amount = Math.round(Number(createForm.amount || 0) * 100);
    }

    await api.post('/admin/invoices', payload);
    setCreateOpen(false);
    refetch();
  };

  const handleOpenEdit = (invoice: AdminInvoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      description: invoice.description || '',
      notes: invoice.notes || '',
      dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : '',
    });
    setEditLineItems(
      (invoice.lineItems || []).map((li) => ({
        description: li.description,
        quantity: String(li.quantity ?? 1),
        amount: ((li.amount || 0) / 100).toFixed(2),
      })),
    );
    setEditOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingInvoice) return;
    const payload: any = {
      description: editForm.description || undefined,
      notes: editForm.notes || undefined,
      dueDate: editForm.dueDate || undefined,
    };

    const preparedLineItems = editLineItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity || 1),
        amount: Math.round(Number(item.amount || 0) * 100),
      }))
      .filter((li) => li.description && li.amount > 0 && li.quantity > 0);

    if (preparedLineItems.length > 0) {
      payload.lineItems = preparedLineItems;
    }
    await api.patch(`/admin/invoices/${editingInvoice._id}`, payload);
    setEditOpen(false);
    setEditingInvoice(null);
    refetch();
  };

  const handleDownloadCsv = () => {
    if (!data || data.length === 0) return;

    const headers = [
      'createdAt',
      'tenantId',
      'invoiceNumber',
      'planId',
      'amount',
      'currency',
      'status',
      'paymentMethod',
      'transactionId',
      'paidOn',
      'dueDate',
      'refundedAmount',
    ];

    const escape = (value: unknown) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = data.map((invoice) => [
      invoice.createdAt,
      invoice.tenantId,
      invoice.invoiceNumber,
      invoice.planId,
      (invoice.amount / 100).toFixed(2),
      invoice.currency,
      invoice.status,
      invoice.paymentMethod || '',
      invoice.transactionId || '',
      invoice.paidOn || '',
      invoice.dueDate || '',
      invoice.refundedAmount ?? '',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = new Date().toISOString().split('T')[0];
    a.download = `invoices-${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: InvoiceStatus): 'success' | 'warning' | 'error' | 'info' | 'default' => {
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
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Invoices (Admin)</Typography>
          <Typography variant="body2" color="textSecondary">
            Cross-tenant invoices for reconciliation, revenue reporting, and audits.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleOpenCreate}>
            New Invoice
          </Button>
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

      {summary && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Totals for current filters
                </Typography>
                <Typography variant="h6">
                  {data?.length ?? 0} invoices ·
                  {' '}
                  {data && data[0]
                    ? formatCurrencyWithSettings(summary.totalAmount, data[0].currency, currency)
                    : formatCurrencyWithSettings(summary.totalAmount, null, currency)}
                </Typography>
                {aging && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Open A/R:&nbsp;
                    {data && data[0]
                      ? formatCurrencyWithSettings(aging.totalOpen, data[0].currency, currency)
                      : formatCurrencyWithSettings(aging.totalOpen, null, currency)}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(['PAID', 'PENDING', 'FAILED', 'REFUNDED', 'PROCESSING'] as InvoiceStatus[]).map(
                  (status) => {
                    const entry = summary.byStatus.get(status);
                    if (!entry) return null;
                    return (
                      <Chip
                        key={status}
                        label={`${status}: ${entry.count} · ${formatCurrencyWithSettings(entry.amount, data[0]?.currency, currency)}`}
                        color={getStatusColor(status)}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    );
                  },
                )}
              </Stack>
              {aging && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    A/R Aging (open invoices)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {(['0-30', '31-60', '61-90', '90+'] as const).map((bucketKey) => {
                      const entry = aging.buckets[bucketKey];
                      if (!entry || entry.count === 0) return null;
                      return (
                        <Chip
                          key={bucketKey}
                          label={`${bucketKey} days: ${entry.count} · ${
                            data && data[0]
                              ? formatCurrencyWithSettings(entry.amount, data[0].currency, currency)
                              : formatCurrencyWithSettings(entry.amount, null, currency)
                          }`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

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
              label="Status"
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
              sx={{ maxWidth: 180 }}
            >
              {INVOICE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Payment Method"
              select
              size="small"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as string | 'ALL')}
              sx={{ maxWidth: 200 }}
            >
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
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
            <ErrorState message="Unable to load invoices." onRetry={() => refetch()} />
          )}

          {!isLoading && !isError && (!data || data.length === 0) && (
            <Typography variant="body2" color="textSecondary">
              No invoices matched your filters.
            </Typography>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>Tenant ID</TableCell>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Plan ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Paid On</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell>
                        {invoice.createdAt
                          ? formatDateWithSystemSettings(invoice.createdAt, system)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setTenantFilter(String(invoice.tenantId))}
                          sx={{ maxWidth: 220, textTransform: 'none' }}
                        >
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {invoice.tenantId}
                          </Typography>
                        </Button>
                      </TableCell>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                          {invoice.planId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatCurrencyWithSettings(invoice.amount, invoice.currency, currency)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={getStatusColor(invoice.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.paymentMethod || 'N/A'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {invoice.transactionId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {invoice.paidOn
                          ? formatDateWithSystemSettings(invoice.paidOn, system)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? formatDateWithSystemSettings(invoice.dueDate, system)
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleOpenEdit(invoice)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Manual Invoice</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tenant ID"
              size="small"
              value={createForm.tenantId}
              onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Subscription ID"
              size="small"
              value={createForm.subscriptionId}
              onChange={(e) => setCreateForm({ ...createForm, subscriptionId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Plan ID"
              size="small"
              value={createForm.planId}
              onChange={(e) => setCreateForm({ ...createForm, planId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Amount"
              size="small"
              type="number"
              value={createForm.amount}
              onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
              fullWidth
              helperText="Amount in major units (e.g. 99.99). Will be converted to cents."
            />
            <TextField
              label="Currency"
              size="small"
              value={createForm.currency}
              onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              size="small"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Due date"
              type="date"
              size="small"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Payment Method"
              size="small"
              select
              value={createForm.paymentMethod}
              onChange={(e) => setCreateForm({ ...createForm, paymentMethod: e.target.value })}
            >
              {['MANUAL', 'STRIPE', 'RAZORPAY', 'PAYPAL'].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Internal notes"
              size="small"
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Line items
              </Typography>
              {createLineItems.map((item, index) => (
                <Stack
                  key={index}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    label="Description"
                    size="small"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...createLineItems];
                      next[index] = { ...next[index], description: e.target.value };
                      setCreateLineItems(next);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Qty"
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...createLineItems];
                      next[index] = { ...next[index], quantity: e.target.value };
                      setCreateLineItems(next);
                    }}
                    sx={{ maxWidth: 90 }}
                  />
                  <TextField
                    label="Amount"
                    size="small"
                    type="number"
                    value={item.amount}
                    onChange={(e) => {
                      const next = [...createLineItems];
                      next[index] = { ...next[index], amount: e.target.value };
                      setCreateLineItems(next);
                    }}
                    helperText="Line total in major units"
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      const next = [...createLineItems];
                      next.splice(index, 1);
                      setCreateLineItems(next);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setCreateLineItems([
                    ...createLineItems,
                    { description: '', quantity: '1', amount: '' },
                  ])
                }
              >
                Add line item
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              size="small"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Due date"
              type="date"
              size="small"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Internal notes"
              size="small"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Line items
              </Typography>
              {editLineItems.map((item, index) => (
                <Stack
                  key={index}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    label="Description"
                    size="small"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...editLineItems];
                      next[index] = { ...next[index], description: e.target.value };
                      setEditLineItems(next);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Qty"
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const next = [...editLineItems];
                      next[index] = { ...next[index], quantity: e.target.value };
                      setEditLineItems(next);
                    }}
                    sx={{ maxWidth: 90 }}
                  />
                  <TextField
                    label="Amount"
                    size="small"
                    type="number"
                    value={item.amount}
                    onChange={(e) => {
                      const next = [...editLineItems];
                      next[index] = { ...next[index], amount: e.target.value };
                      setEditLineItems(next);
                    }}
                    helperText="Line total in major units"
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      const next = [...editLineItems];
                      next.splice(index, 1);
                      setEditLineItems(next);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setEditLineItems([
                    ...editLineItems,
                    { description: '', quantity: '1', amount: '' },
                  ])
                }
              >
                Add line item
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
