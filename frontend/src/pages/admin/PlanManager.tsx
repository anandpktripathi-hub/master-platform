import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import type { BillingCycle, Package } from '../../types/api.types';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import { formatCurrencyWithSettings } from '../../utils/formatting';

type PackageFormData = {
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  trialDays: number;
  isActive: boolean;
  order: number;
  enabledFeatureKeys: string;
  maxTeamMembers?: number;
  maxStorageMb?: number;
  maxDomains?: number;
  maxCustomDomains?: number;
  maxPages?: number;
};

const initialFormData: PackageFormData = {
  name: '',
  description: '',
  price: 0,
  billingCycle: 'monthly',
  trialDays: 0,
  isActive: true,
  order: 0,
  enabledFeatureKeys: '',
  maxTeamMembers: undefined,
  maxStorageMb: undefined,
  maxDomains: undefined,
  maxCustomDomains: undefined,
  maxPages: undefined,
};

function parseFeatureKeys(input: string): Record<string, boolean> {
  const keys = input
    .split(/[\n,]/g)
    .map((k) => k.trim())
    .filter(Boolean);

  const featureSet: Record<string, boolean> = {};
  for (const key of keys) {
    featureSet[key] = true;
  }
  return featureSet;
}

function buildLimits(form: PackageFormData): Record<string, number> {
  const out: Record<string, number> = {};

  const maybeSet = (key: string, value: number | undefined) => {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      out[key] = value;
    }
  };

  maybeSet('maxTeamMembers', form.maxTeamMembers);
  maybeSet('maxStorageMb', form.maxStorageMb);
  maybeSet('maxDomains', form.maxDomains);
  maybeSet('maxCustomDomains', form.maxCustomDomains);
  maybeSet('maxPages', form.maxPages);

  return out;
}

const PlanManager: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { currency } = useAdminSettings();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [packages]);

  const formatCurrency = (amountInCents: number) => {
    return formatCurrencyWithSettings(amountInCents, null, currency);
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/packages/admin/all');
      const list: Package[] = Array.isArray(data)
        ? (data as Package[])
        : ((data as any)?.data as Package[]) || [];
      setPackages(list);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to load packages';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenForm = (pkg?: Package) => {
    if (pkg) {
      setEditing(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
        price: typeof pkg.price === 'number' ? pkg.price : 0,
        billingCycle: pkg.billingCycle,
        trialDays: typeof pkg.trialDays === 'number' ? pkg.trialDays : 0,
        isActive: pkg.isActive !== false,
        order: typeof pkg.order === 'number' ? pkg.order : 0,
        enabledFeatureKeys: Object.keys(pkg.featureSet || {})
          .filter((k) => (pkg.featureSet as any)?.[k] === true)
          .join(', '),
        maxTeamMembers: (pkg.limits as any)?.maxTeamMembers,
        maxStorageMb: (pkg.limits as any)?.maxStorageMb,
        maxDomains: (pkg.limits as any)?.maxDomains,
        maxCustomDomains: (pkg.limits as any)?.maxCustomDomains,
        maxPages: (pkg.limits as any)?.maxPages,
      });
    } else {
      setEditing(null);
      setFormData(initialFormData);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormData(initialFormData);
  };

  const handleSubmitForm = async () => {
    if (!formData.name.trim()) {
      enqueueSnackbar('Please provide a package name', { variant: 'warning' });
      return;
    }
    if (!Number.isFinite(formData.price) || formData.price < 0) {
      enqueueSnackbar('Price must be a valid non-negative number', {
        variant: 'warning',
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description || undefined,
      price: Number(formData.price),
      billingCycle: formData.billingCycle,
      trialDays: Number.isFinite(formData.trialDays) ? formData.trialDays : 0,
      isActive: !!formData.isActive,
      order: Number.isFinite(formData.order) ? formData.order : 0,
      featureSet: parseFeatureKeys(formData.enabledFeatureKeys),
      limits: buildLimits(formData),
    };

    try {
      setIsSubmitting(true);

      if (editing?._id) {
        await api.patch(`/packages/${editing._id}`, payload);
        enqueueSnackbar('Package updated successfully', { variant: 'success' });
      } else {
        await api.post('/packages', payload);
        enqueueSnackbar('Package created successfully', { variant: 'success' });
      }

      await fetchPackages();
      handleCloseForm();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to save package';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete?._id) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/packages/${packageToDelete._id}`);
      enqueueSnackbar('Package deleted successfully', { variant: 'success' });

      setPackages((prev) => prev.filter((p) => p._id !== packageToDelete._id));
      setDeleteConfirmOpen(false);
      setPackageToDelete(null);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to delete package';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Packages
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage subscription packages available to tenants
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Create Package
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Billing</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Price
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Order
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No packages created yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedPackages.map((pkg) => (
                    <TableRow key={pkg._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{pkg.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {pkg.billingCycle}
                          {pkg.trialDays ? ` • trial ${pkg.trialDays}d` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(Math.round((pkg.price || 0) * 100))}
                      </TableCell>
                      <TableCell align="center">
                        {pkg.isActive !== false ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : (
                          <Chip label="Inactive" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {pkg.order || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(pkg)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setPackageToDelete(pkg);
                              setDeleteConfirmOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? `Edit ${editing.name}` : 'Create New Package'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Package Name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              fullWidth
              placeholder="e.g., Professional"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Billing Cycle"
                select
                value={formData.billingCycle}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, billingCycle: e.target.value as BillingCycle }))
                }
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="lifetime">Lifetime</MenuItem>
              </TextField>

              <TextField
                label="Trial Days"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.trialDays}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, trialDays: parseInt(e.target.value || '0', 10) }))
                }
              />
            </Box>

            <TextField
              label="Price (major units, e.g. 29.99)"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) }))}
              fullWidth
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Limits (optional)
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Max Team Members"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.maxTeamMembers ?? ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxTeamMembers: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
              />
              <TextField
                label="Max Storage (MB)"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.maxStorageMb ?? ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxStorageMb: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
              />
              <TextField
                label="Max Domains"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.maxDomains ?? ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxDomains: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
              />
              <TextField
                label="Max Custom Domains"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.maxCustomDomains ?? ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxCustomDomains:
                      e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
              />
              <TextField
                label="Max Pages"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.maxPages ?? ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxPages: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
                  }))
                }
              />
              <TextField
                label="Display Order"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.order}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, order: parseInt(e.target.value || '0', 10) }))
                }
              />
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
              Enabled Feature Keys (optional)
            </Typography>

            <TextField
              label="Feature keys (comma or newline separated)"
              value={formData.enabledFeatureKeys}
              onChange={(e) => setFormData((p) => ({ ...p, enabledFeatureKeys: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              placeholder="allowCustomDomain, brandingRemoval, api"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitForm} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Package</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Are you sure you want to delete <strong>{packageToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePackage}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlanManager;
