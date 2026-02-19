import React, { useEffect, useMemo, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { CreditCard as CreditCardIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { useAdminSettings } from '../contexts/AdminSettingsContext';
import { formatDateWithSystemSettings, formatCurrencyWithSettings } from '../utils/formatting';
import type { OfflinePaymentRequest } from '../types/billing.types';
import type { Package } from '../types/api.types';

type TenantPackageResponse = {
  _id: string;
  tenantId: string;
  packageId: Package | string;
  status: string;
  startedAt?: string;
  trialEndsAt?: string;
  expiresAt?: string;
};

type BillingRecord = {
  _id: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { system, currency } = useAdminSettings();

  const [tenantPackage, setTenantPackage] = useState<TenantPackageResponse | null>(null);
  const [offlineRequests, setOfflineRequests] = useState<OfflinePaymentRequest[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateString: string) => formatDateWithSystemSettings(dateString, system);

  const formatCurrency = (amountMajor: number, recordCurrency?: string | null) => {
    const cents = Math.round((typeof amountMajor === 'number' ? amountMajor : 0) * 100);
    return formatCurrencyWithSettings(cents, recordCurrency || null, currency);
  };

  const currentPackage = useMemo(() => {
    if (!tenantPackage) return null;
    const pkg = tenantPackage.packageId;
    return typeof pkg === 'string' ? null : (pkg as Package);
  }, [tenantPackage]);

  const statusColor = (status: string) => {
    if (status === 'trial') return 'info';
    if (status === 'active') return 'success';
    if (status === 'expired') return 'warning';
    if (status === 'suspended') return 'error';
    return 'default';
  };

  const fetchData = async (showSpinner: boolean) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const [pkg, off, bill] = await Promise.all([
        api.get<TenantPackageResponse>('/packages/me'),
        api.get<OfflinePaymentRequest[]>('/offline-payments/me'),
        api.get<BillingRecord[]>('/billings'),
      ]);

      setTenantPackage(pkg || null);
      setOfflineRequests(Array.isArray(off) ? off : []);
      setBillingRecords(Array.isArray(bill) ? bill : []);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to load billing data';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestBilling = useMemo(() => {
    const sorted = [...billingRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted.slice(0, 5);
  }, [billingRecords]);

  const latestOffline = useMemo(() => {
    const sorted = [...offlineRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted.slice(0, 5);
  }, [offlineRequests]);

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Billing Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manual billing mode: request upgrades via offline payment and admin approval
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<CreditCardIcon fontSize="small" />}
              onClick={() => navigate('/app/billing/offline-payments')}
            >
              Offline Payments
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={refreshing}
              onClick={() => fetchData(false)}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Current Package
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => navigate('/pricing')}
                    >
                      Request Upgrade
                    </Button>
                  </Box>

                  {!tenantPackage ? (
                    <Alert severity="warning">No package assigned yet.</Alert>
                  ) : (
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentPackage?.name || 'Package'}
                        </Typography>
                        <Chip
                          label={(tenantPackage.status || 'unknown').toUpperCase()}
                          color={statusColor(tenantPackage.status) as any}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {currentPackage?.description && (
                        <Typography variant="body2" color="textSecondary">
                          {currentPackage.description}
                        </Typography>
                      )}

                      {tenantPackage.expiresAt && (
                        <Typography variant="body2" color="textSecondary">
                          Expires: {formatDate(tenantPackage.expiresAt)}
                        </Typography>
                      )}

                      {tenantPackage.trialEndsAt && (
                        <Typography variant="body2" color="textSecondary">
                          Trial ends: {formatDate(tenantPackage.trialEndsAt)}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Offline Payment Requests
                  </Typography>

                  {latestOffline.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No offline payment requests yet.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {latestOffline.map((r) => (
                        <ListItem key={r._id} disableGutters sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={`${r.amount} ${r.currency} • ${r.status.toUpperCase()}`}
                            secondary={formatDate(r.createdAt)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/app/billing/offline-payments')}
                    >
                      View All
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Billing History
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate('/app/billing/invoices')}
                    >
                      View Records
                    </Button>
                  </Box>

                  {latestBilling.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No billing records yet.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {latestBilling.map((b) => (
                        <ListItem key={b._id} disableGutters sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={`${formatCurrency(b.amount, b.currency)} • ${String(b.status || 'PAID').toUpperCase()}`}
                            secondary={formatDate(b.createdAt)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default BillingDashboard;
