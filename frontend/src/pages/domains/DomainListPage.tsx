import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import {
  useDomainsList,
  useSetPrimaryDomain,
  useDeleteDomain,
} from '../../hooks/useDomains';
import {
  useCustomDomainsList,
  useSetPrimaryCustomDomain,
  useDeleteCustomDomain,
} from '../../hooks/useCustomDomains';
import type { Domain } from '../../types/api.types';
import type { CustomDomain } from '../../types/api.types';
import DomainCreateModal from './DomainCreateModal';
import CustomDomainRequestModal from './CustomDomainRequestModal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusChip from '../../components/common/StatusChip';

export default function DomainListPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customDomainModalOpen, setCustomDomainModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{ id: string; isCustom: boolean } | null>(null);

  // Fetch domains
  const {
    data: domainsData = [],
    isLoading: domainsLoading,
    isError: domainsError,
    refetch: refetchDomains,
  } = useDomainsList();
  const {
    data: customDomainsData = [],
    isLoading: customDomainsLoading,
    isError: customDomainsError,
    refetch: refetchCustomDomains,
  } = useCustomDomainsList();

  const domains = domainsData || [];
  const customDomains = customDomainsData || [];

  // Mutations
  const setPrimaryDomainMutation = useSetPrimaryDomain();
  const deleteDomainMutation = useDeleteDomain();
  const setPrimaryCustomDomainMutation = useSetPrimaryCustomDomain();
  const deleteCustomDomainMutation = useDeleteCustomDomain();

  const isLoading = domainsLoading || customDomainsLoading;
  const isError = domainsError || customDomainsError;

  const handleRefresh = () => {
    refetchDomains();
    refetchCustomDomains();
  };

  const handleSetPrimary = (domainId: string, isCustomDomain: boolean) => {
    if (isCustomDomain) {
      setPrimaryCustomDomainMutation.mutate(domainId);
    } else {
      setPrimaryDomainMutation.mutate(domainId);
    }
  };

  const handleDelete = (domainId: string, isCustomDomain: boolean) => {
    setConfirmState({ id: domainId, isCustom: isCustomDomain });
  };

  const handleConfirmDelete = () => {
    if (!confirmState) return;
    const { id, isCustom } = confirmState;
    if (isCustom) {
      deleteCustomDomainMutation.mutate(id, { onSettled: () => setConfirmState(null) });
    } else {
      deleteDomainMutation.mutate(id, { onSettled: () => setConfirmState(null) });
    }
  };

  const renderStatusChip = (status: string) => (
    <StatusChip label={status.replace(/_/g, ' ').toUpperCase()} status={status} />
  );

  if (isLoading) {
    return <LoadingState variant="table" fullHeight />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Domains</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCustomDomainModalOpen(true)}
          >
            Add Custom Domain
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Domain
          </Button>
        </Stack>
      </Stack>

      {/* Error Alert */}
      {isError && <ErrorState onRetry={handleRefresh} message="Failed to load domains." />}

      {/* Path & Subdomain Domains Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Path & Subdomain Domains
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Primary</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <EmptyState title="No domains yet" description="Create a path or subdomain to get started." />
                    </TableCell>
                  </TableRow>
                ) : (
                  domains.map((domain: Domain) => (
                    <TableRow key={domain._id}>
                      <TableCell>
                        <Chip label={domain.type.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{domain.value}</TableCell>
                      <TableCell>
                        {domain.computedUrl && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">{domain.computedUrl}</Typography>
                            <IconButton
                              size="small"
                              href={domain.computedUrl}
                              target="_blank"
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>{renderStatusChip(domain.status)}</TableCell>
                      <TableCell>
                        <Tooltip title={domain.isPrimary ? 'Primary domain' : 'Set as primary'}>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(domain._id, false)}
                            disabled={domain.isPrimary || domain.status !== 'active' || setPrimaryDomainMutation.isPending}
                          >
                            {domain.isPrimary ? (
                              <StarIcon color="primary" />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(domain._id, false)}
                          disabled={domain.isPrimary || deleteDomainMutation.isPending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Custom Domains Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Custom Domains
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Domain</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SSL Status</TableCell>
                  <TableCell>Primary</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <EmptyState title="No custom domains" description="Add your own domain and verify DNS to activate." />
                    </TableCell>
                  </TableRow>
                ) : (
                  customDomains.map((domain: CustomDomain) => (
                    <TableRow key={domain._id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{domain.domain}</Typography>
                          <IconButton
                            size="small"
                            href={`https://${domain.domain}`}
                            target="_blank"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell>{renderStatusChip(domain.status)}</TableCell>
                      <TableCell>
                        {domain.sslStatus ? (
                          <StatusChip
                            label={`SSL ${domain.sslStatus.replace(/_/g, ' ').toUpperCase()}`}
                            status={domain.sslStatus}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={domain.isPrimary ? 'Primary domain' : 'Set as primary'}>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(domain._id, true)}
                            disabled={domain.isPrimary || domain.status !== 'active' || setPrimaryCustomDomainMutation.isPending}
                          >
                            {domain.isPrimary ? (
                              <StarIcon color="primary" />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(domain._id, true)}
                          disabled={domain.isPrimary || deleteCustomDomainMutation.isPending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modals */}
      <DomainCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <CustomDomainRequestModal
        open={customDomainModalOpen}
        onClose={() => setCustomDomainModalOpen(false)}
      />

      <ConfirmDialog
        open={!!confirmState}
        title="Delete domain?"
        description="This action cannot be undone. Any traffic to this domain will stop resolving."
        isLoading={deleteDomainMutation.isPending || deleteCustomDomainMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmState(null)}
        confirmLabel="Delete"
      />
    </Box>
  );
}
