import React from 'react';
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
  Select,
  InputLabel,
  FormControl,
  TablePagination,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatusChip from '../../components/common/StatusChip';
import {
  useAdminDomainsList,
  useAdminSetPrimaryDomain,
  useAdminUpdateDomain,
  useAdminDeleteDomain,
} from '../../hooks/useDomains';
import type { Domain } from '../../types/api.types';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'path', label: 'Path' },
  { value: 'subdomain', label: 'Subdomain' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'blocked', label: 'Blocked' },
];

const AdminDomainsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const domainsQuery = useAdminDomainsList();
  const setPrimaryMutation = useAdminSetPrimaryDomain();
  const updateDomainMutation = useAdminUpdateDomain();
  const deleteDomainMutation = useAdminDeleteDomain();

  const { data, isLoading, isError, refetch } = domainsQuery;

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.filter((domain: Domain | any) => {
      if (typeFilter && domain.type !== typeFilter) return false;
      if (statusFilter && domain.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const tenantLabel =
        typeof domain.tenantId === 'string'
          ? domain.tenantId
          : domain.tenantId?.name || domain.tenantId?.slug || domain.tenantId?._id || '';

      const haystack = `${domain.value} ${domain.computedUrl || ''} ${tenantLabel}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [data, typeFilter, statusFilter, search]);

  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  const tenantCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((domain: Domain | any) => {
      const tenantLabel =
        typeof domain.tenantId === 'string'
          ? domain.tenantId
          : domain.tenantId?.name || domain.tenantId?.slug || domain.tenantId?._id || '';
      if (!tenantLabel) return;
      counts[tenantLabel] = (counts[tenantLabel] || 0) + 1;
    });
    return counts;
  }, [filtered]);

  const domainSummary = React.useMemo(() => {
    const summary = {
      total: filtered.length,
      path: 0,
      subdomain: 0,
      status: {
        pending: 0,
        active: 0,
        suspended: 0,
        blocked: 0,
      } as Record<string, number>,
    };

    filtered.forEach((domain: Domain | any) => {
      if (domain.type === 'path') summary.path += 1;
      if (domain.type === 'subdomain') summary.subdomain += 1;
      if (summary.status[domain.status] != null) {
        summary.status[domain.status] += 1;
      }
    });

    return summary;
  }, [filtered]);

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryMutation.mutateAsync(id);
    } catch {
      // Error handling via toast in hook
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      await updateDomainMutation.mutateAsync({ id, dto: { status } as any });
    } catch {
      // Error handling via toast in hook
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this domain? This action cannot be undone.',
    );
    if (!confirmed) return;
    try {
      await deleteDomainMutation.mutateAsync(id);
    } catch {
      // Error handling via toast in hook
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Domains (Admin)</Typography>
          <Typography variant="body2" color="textSecondary">
            View and manage all path and subdomain mappings across every tenant. Use this view to audit primary
            domains, status, and ownership.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {filtered.length > 0 && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ mb: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Chip
                label={`Total: ${domainSummary.total}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`Path: ${domainSummary.path}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Subdomain: ${domainSummary.subdomain}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Active: ${domainSummary.status.active}`}
                size="small"
                color="success"
              />
              <Chip
                label={`Pending: ${domainSummary.status.pending}`}
                size="small"
                color="warning"
              />
              <Chip
                label={`Suspended: ${domainSummary.status.suspended}`}
                size="small"
                color="error"
              />
            </Stack>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all-types'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all-statuses'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Search by value, URL, or tenant"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: 320, width: '100%' }}
            />
          </Stack>

          {isLoading && <LoadingState variant="table" fullHeight />}
          {isError && !isLoading && (
            <ErrorState message="Unable to load domains." onRetry={() => refetch()} />
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No domains match the current filters.
            </Typography>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>SSL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>DNS</TableCell>
                    <TableCell>Primary</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((domain: Domain | any) => {
                    const tenantLabel =
                      typeof domain.tenantId === 'string'
                        ? domain.tenantId
                        : domain.tenantId?.name || domain.tenantId?.slug || domain.tenantId?._id || '';

                    const canSetPrimary = domain.status === 'active' && !domain.isPrimary;

                    return (
                      <TableRow key={domain._id}>
                        <TableCell>
                          <Chip label={String(domain.type).toUpperCase()} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{domain.value}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                            {domain.computedUrl || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Platform SSL"
                            size="small"
                            color="success"
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={String(domain.status).toUpperCase()}
                            status={String(domain.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {domain.type === 'subdomain' ? (
                            domain.dnsSyncedAt ? (
                              <Stack spacing={0.5}>
                                <Chip
                                  size="small"
                                  label={`DNS via ${domain.dnsProvider || 'provider'}`}
                                  color={domain.dnsLastError ? 'warning' : 'success'}
                                />
                                <Typography variant="caption" color="textSecondary" noWrap>
                                  {new Date(domain.dnsSyncedAt).toLocaleString()}
                                </Typography>
                                {domain.dnsLastError && (
                                  <Typography variant="caption" color="error" noWrap>
                                    {domain.dnsLastError}
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Not yet synced
                              </Typography>
                            )
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              n/a
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {domain.isPrimary ? (
                            <Chip label="PRIMARY" color="success" size="small" />
                          ) : (
                            <Chip label="Secondary" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              {tenantLabel || '-'}
                            </Typography>
                            {tenantLabel && tenantCounts[tenantLabel] != null && (
                              <Chip
                                label={`${tenantCounts[tenantLabel]} domain${
                                  tenantCounts[tenantLabel] === 1 ? '' : 's'
                                }`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {domain.createdAt ? new Date(domain.createdAt).toLocaleString() : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={String(domain.status)}
                                onChange={(e) =>
                                  handleChangeStatus(domain._id, e.target.value as string)
                                }
                                disabled={updateDomainMutation.isPending}
                                displayEmpty
                              >
                                {STATUS_OPTIONS.filter((opt) => opt.value !== '').map((opt) => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={!canSetPrimary || setPrimaryMutation.isPending}
                              onClick={() => handleSetPrimary(domain._id)}
                            >
                              Set Primary
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={deleteDomainMutation.isPending}
                              onClick={() => handleDelete(domain._id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  const value = parseInt(event.target.value, 10) || 10;
                  setRowsPerPage(value);
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDomainsPage;
