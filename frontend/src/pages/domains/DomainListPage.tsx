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
import DomainHierarchyAssignment from '../../modules/hierarchy/DomainHierarchyAssignment';
import { usePackageUsage, useCanUseFeature } from '../../hooks/usePackages';
import { useNavigate } from 'react-router-dom';

export default function DomainListPage() {
  const navigate = useNavigate();
  const domainsQuery = useDomainsList();
  const customDomainsQuery = useCustomDomainsList();
  const { data: packageUsage, isLoading: usageLoading } = usePackageUsage();
  const { data: customDomainFeature } = useCanUseFeature('allowCustomDomain');

  const domains = domainsQuery.data || [];
  const customDomains = customDomainsQuery.data || [];
  const isError = domainsQuery.isError || customDomainsQuery.isError;

  const totalDomainsUsed = packageUsage?.usage?.domains ?? domains.length;
  const totalCustomDomainsUsed = packageUsage?.usage?.customDomains ?? customDomains.length;
  const maxDomains = packageUsage?.limits?.maxDomains;
  const maxCustomDomains = packageUsage?.limits?.maxCustomDomains;

  const atDomainLimit = typeof maxDomains === 'number' && maxDomains >= 0 && totalDomainsUsed >= maxDomains;
  const atCustomDomainLimit =
    typeof maxCustomDomains === 'number' && maxCustomDomains >= 0 && totalCustomDomainsUsed >= maxCustomDomains;

  const customDomainsAllowed = customDomainFeature?.canUse ?? true;

  // Fix: Add handleRefresh to refetch both queries
  const handleRefresh = () => {
    domainsQuery.refetch();
    customDomainsQuery.refetch();
  };
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [customDomainModalOpen, setCustomDomainModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{ id: string; isCustom: boolean } | null>(null);

  // ...existing code...
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Domains</Typography>
        <Stack direction="row" spacing={1}>
          {packageUsage && (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 2 }}>
              {typeof maxDomains === 'number' && maxDomains > 0 && (
                <Typography variant="body2" color="textSecondary">
                  Domains: {totalDomainsUsed} / {maxDomains}
                </Typography>
              )}
              {typeof maxCustomDomains === 'number' && maxCustomDomains > 0 && (
                <Typography variant="body2" color="textSecondary">
                  Custom domains: {totalCustomDomainsUsed} / {maxCustomDomains}
                </Typography>
              )}
            </Stack>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Tooltip
            title={
              !customDomainsAllowed
                ? 'Upgrade your plan to use custom domains'
                : atCustomDomainLimit
                ? 'You have reached the custom domain limit for your plan'
                : ''
            }
            disableHoverListener={customDomainsAllowed && !atCustomDomainLimit}
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={usageLoading || atCustomDomainLimit || !customDomainsAllowed}
                onClick={() => {
                  if (!customDomainsAllowed || atCustomDomainLimit) {
                    navigate('/app/packages');
                    return;
                  }
                  setCustomDomainModalOpen(true);
                }}
              >
                Add Custom Domain
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {(atDomainLimit || atCustomDomainLimit) && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" variant="outlined">
            You have reached the domain limits for your current plan.
            Upgrade your subscription on the Packages page to add more domains.
          </Alert>
        </Box>
      )}

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
                  <TableCell>Domain</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SSL</TableCell>
                  <TableCell>SSL Expiry</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <EmptyState title="No domains" description="Add your domain to get started." />
                    </TableCell>
                  </TableRow>
                ) : (
                  domains.map((domain: Domain) => (
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
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
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
          {customDomains.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Chip
                  label={`SSL OK: ${customDomains.filter((d) => d.sslStatus === 'issued').length}`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`SSL Pending: ${customDomains.filter((d) => d.sslStatus === 'pending').length}`}
                  size="small"
                  color="warning"
                />
                <Chip
                  label={`SSL Failed/Expired: ${customDomains.filter((d) => d.sslStatus === 'failed' || d.sslStatus === 'expired').length}`}
                  size="small"
                  color="error"
                />
              </Stack>
            </Box>
          )}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Domain</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SSL Status</TableCell>
                  <TableCell>SSL Expiry</TableCell>
                  <TableCell>Primary</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
                              <Typography variant="body2" color="textSecondary">
                                -
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
