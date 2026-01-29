import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { tenantsApi } from '../../services/api';
import { Tenant, TenantPlan, TenantStatus } from '../../types/tenant';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../types/rbac';

const STATUS_COLORS: Record<TenantStatus, 'success' | 'warning' | 'info' | 'default'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TRIAL: 'info',
  CANCELLED: 'default',
};

export default function TenantsPage() {
  const { hasPermission } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [, setTotal] = useState(0);
  const [page] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [planFilter, setPlanFilter] = useState<string | undefined>(undefined);
  const [, setLoading] = useState(false);

  const [openNew, setOpenNew] = useState(false);
  const [newPayload, setNewPayload] = useState({ name: '', domain: '', plan: 'FREE', status: 'ACTIVE', ownerEmail: '' });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity?: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );

  interface ApiError {
    message?: string;
  }

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenantsApi.get('/admin/tenants', {
        params: {
          page,
          limit,
          search: search || undefined,
          status: statusFilter,
          plan: planFilter,
        },
      });

      const data = (res as any)?.data ?? [];
      const total = (res as any)?.total ?? 0;

      setTenants(data);
      setTotal(total);
    } catch (err: unknown) {
      const error = err as ApiError;
      setSnackbar({ open: true, message: error.message || 'Failed to fetch tenants', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, planFilter]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    try {
      await tenantsApi.post('/admin/tenants', newPayload);
      setOpenNew(false);
      setSnackbar({ open: true, message: 'Tenant created', severity: 'success' });
      fetchData();
    } catch (err: unknown) {
      const error = err as ApiError;
      setSnackbar({ open: true, message: error.message || 'Create failed', severity: 'error' });
    }
  };

  const openEdit = (t: Tenant) => {
    setEditing(t);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const payload: Partial<Tenant> = {
      status: editing.status,
      plan: editing.plan,
      domain: editing.domain,
      notes: editing.notes,
      maxUsers: editing.maxUsers,
      maxStorageMB: editing.maxStorageMB,
    };
    try {
      if (!editing._id) {
        throw new Error('Missing tenant id');
      }
      await tenantsApi.patch(`/admin/tenants/${editing._id}`, payload);
      setEditOpen(false);
      setSnackbar({ open: true, message: 'Tenant updated', severity: 'success' });
      fetchData();
    } catch (err: unknown) {
      const error = err as ApiError;
      setSnackbar({ open: true, message: error.message || 'Update failed', severity: 'error' });
    }
  };

  const statusOptions: TenantStatus[] = ['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'];
  const planOptions: TenantPlan[] = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Tenants</Typography>
        {hasPermission(PERMISSIONS.MANAGE_TENANTS) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenNew(true)}
          >
            + New Tenant
          </Button>
        )}
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField placeholder="Search by name, domain or owner email" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
        <Select displayEmpty value={statusFilter ?? ''} onChange={(e) => setStatusFilter(e.target.value ? String(e.target.value) : undefined)} size="small">
          <MenuItem value="">All Status</MenuItem>
          {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
        <Select displayEmpty value={planFilter ?? ''} onChange={(e) => setPlanFilter(e.target.value ? String(e.target.value) : undefined)} size="small">
          <MenuItem value="">All Plans</MenuItem>
          {planOptions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>User Count</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t._id || t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{t.name}</Typography>
                    <Typography variant="caption" color="textSecondary">{t.slug}</Typography>
                  </TableCell>
                  <TableCell>{t.domain || '-'}</TableCell>
                  <TableCell>
                    <Chip label={t.plan || '-'} size="small" color="info" />
                  </TableCell>
                  <TableCell>
                    {t.status ? (
                      <Chip
                        label={t.status}
                        size="small"
                        color={STATUS_COLORS[t.status]}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{t.userCount ?? '-'}</TableCell>
                  <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{t.lastLoginAt ? new Date(t.lastLoginAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    {t.slug ? (
                      <Button
                        size="small"
                        onClick={() => window.open(`/b/${t.slug}`, '_blank', 'noopener')}
                      >
                        View Brand
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {hasPermission(PERMISSIONS.MANAGE_TENANTS) && (
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(t)}>
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* New Tenant Dialog */}
      <Dialog open={openNew} onClose={() => setOpenNew(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Tenant</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Tenant Name" value={newPayload.name} onChange={(e) => setNewPayload({ ...newPayload, name: e.target.value })} fullWidth />
            <TextField label="Domain / Subdomain" value={newPayload.domain} onChange={(e) => setNewPayload({ ...newPayload, domain: e.target.value })} fullWidth />
            <Select value={newPayload.plan} onChange={(e) => setNewPayload({ ...newPayload, plan: String(e.target.value) })}>
              {planOptions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
            <Select value={newPayload.status} onChange={(e) => setNewPayload({ ...newPayload, status: String(e.target.value) })}>
              {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <TextField label="Owner Email" value={newPayload.ownerEmail} onChange={(e) => setNewPayload({ ...newPayload, ownerEmail: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent>
          {editing && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField label="Tenant Name" value={editing.name} disabled fullWidth />
              <TextField label="Domain" value={editing.domain || ''} onChange={(e) => setEditing({ ...editing, domain: e.target.value })} fullWidth />
              <Select value={editing.plan} onChange={(e) => setEditing({ ...editing, plan: String(e.target.value) as TenantPlan })}>
                {planOptions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: String(e.target.value) as TenantStatus })}>
                {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
              <TextField label="Max Users" type="number" value={editing.maxUsers ?? ''} onChange={(e) => setEditing({ ...editing, maxUsers: e.target.value ? Number(e.target.value) : undefined })} />
              <TextField label="Max Storage MB" type="number" value={editing.maxStorageMB ?? ''} onChange={(e) => setEditing({ ...editing, maxStorageMB: e.target.value ? Number(e.target.value) : undefined })} />
              <TextField label="Notes" multiline value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity || 'success'} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
