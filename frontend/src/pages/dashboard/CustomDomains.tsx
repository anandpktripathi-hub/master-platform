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
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import StatusChip from '../../components/common/StatusChip';
import {
  useAdminCustomDomainsList,
  useAdminActivateCustomDomain,
} from '../../hooks/useCustomDomains';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending_verification', label: 'Pending verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'ssl_pending', label: 'SSL pending' },
  { value: 'ssl_issued', label: 'SSL issued' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

const SSL_FILTER_OPTIONS = [
  { value: '', label: 'All SSL states' },
  { value: 'expiring', label: 'SSL expiring soon' },
  { value: 'problem', label: 'SSL failed/expired' },
];

const CustomDomains: React.FC = () => {
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [search, setSearch] = React.useState('');
  const [sslFilter, setSslFilter] = React.useState<string>('');

  const domainsQuery = useAdminCustomDomainsList();
  const activateMutation = useAdminActivateCustomDomain();

  const { data, isLoading, isError, refetch } = domainsQuery;

  const EXPIRY_WARNING_DAYS = 14;

  const isExpiringSoon = (sslExpiresAt?: string | null): boolean => {
    if (!sslExpiresAt) return false;
    const expiryDate = new Date(sslExpiresAt);
    if (Number.isNaN(expiryDate.getTime())) return false;
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= EXPIRY_WARNING_DAYS;
  };

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.filter((domain: any) => {
      if (statusFilter && domain.status !== statusFilter) return false;
      if (sslFilter === 'expiring') {
        if (!domain.sslStatus || domain.sslStatus !== 'issued') return false;
        if (!isExpiringSoon(domain.sslExpiresAt)) return false;
      }
      if (sslFilter === 'problem') {
        if (domain.sslStatus !== 'failed' && domain.sslStatus !== 'expired') {
          return false;
        }
      }
      if (!search.trim()) return true;
      const haystack = `${domain.domain} ${
        typeof domain.tenantId === 'string'
          ? domain.tenantId
          : domain.tenantId?.name || domain.tenantId?.slug || ''
      }`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [data, statusFilter, sslFilter, search]);

  const sslOkCount = React.useMemo(
    () => filtered.filter((d: any) => d.sslStatus === 'issued').length,
    [filtered],
  );

  const sslPendingCount = React.useMemo(
    () => filtered.filter((d: any) => d.sslStatus === 'pending').length,
    [filtered],
  );

  const sslProblemCount = React.useMemo(
    () =>
      filtered.filter(
        (d: any) => d.sslStatus === 'failed' || d.sslStatus === 'expired',
      ).length,
    [filtered],
  );

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Custom Domains (Admin Queue)</Typography>
          <Typography variant="body2" color="textSecondary">
            Review all tenant custom domains, monitor DNS/SSL status, and activate domains once verification is complete.
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
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Chip
                label={`SSL OK: ${sslOkCount}`}
                size="small"
                color="success"
              />
              <Chip
                label={`SSL Pending: ${sslPendingCount}`}
                size="small"
                color="warning"
              />
              <Chip
                label={`SSL Failed/Expired: ${sslProblemCount}`}
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>SSL Filter</InputLabel>
              <Select
                label="SSL Filter"
                value={sslFilter}
                onChange={(e) => setSslFilter(e.target.value)}
              >
                {SSL_FILTER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value || 'all-ssl'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Search by domain or tenant"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: 320, width: '100%' }}
            />
          </Stack>

          {isLoading && <LoadingState variant="table" fullHeight />}
          {isError && !isLoading && (
            <ErrorState message="Unable to load custom domains." onRetry={() => refetch()} />
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No custom domains match the current filters.
            </Typography>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Domain</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>SSL Status</TableCell>
                    <TableCell>SSL Expiry</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((domain: any) => {
                    const tenantLabel =
                      typeof domain.tenantId === 'string'
                        ? domain.tenantId
                        : domain.tenantId?.name || domain.tenantId?.slug || domain.tenantId?._id || '';
                    const canActivate =
                      domain.status === 'verified' || domain.status === 'ssl_issued';

                    return (
                      <TableRow key={domain._id}>
                        <TableCell>
                          <Typography variant="body2">{domain.domain}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                            {tenantLabel || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={domain.status.replace(/_/g, ' ').toUpperCase()}
                            status={domain.status}
                          />
                        </TableCell>
                        <TableCell>
                          {domain.sslStatus ? (
                            <Chip
                              label={`SSL ${domain.sslStatus.toUpperCase()}`}
                              size="small"
                              color={domain.sslStatus === 'issued' ? 'success' : 'default'}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {domain.sslExpiresAt ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography
                                variant="body2"
                                color={
                                  new Date(domain.sslExpiresAt).getTime() < Date.now()
                                    ? 'error'
                                    : isExpiringSoon(domain.sslExpiresAt)
                                    ? 'warning'
                                    : 'textPrimary'
                                }
                              >
                                {new Date(domain.sslExpiresAt).toLocaleDateString()}
                              </Typography>
                              {new Date(domain.sslExpiresAt).getTime() < Date.now() && (
                                <Chip label="Expired" size="small" color="error" />
                              )}
                              {new Date(domain.sslExpiresAt).getTime() >= Date.now() &&
                                isExpiringSoon(domain.sslExpiresAt) && (
                                  <Chip label="Expiring soon" size="small" color="warning" />
                                )}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                            >
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {domain.createdAt
                              ? new Date(domain.createdAt).toLocaleString()
                              : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!canActivate || activateMutation.isPending}
                            onClick={() => handleActivate(domain._id)}
                          >
                            Activate
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomDomains;
