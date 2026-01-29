import React, { useEffect, useState } from 'react';
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
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import {
  Info as InfoIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { Subscription, Plan, Invoice } from '../types/billing.types';
import BillingHierarchyAssignment from '../modules/hierarchy/BillingHierarchyAssignment';
import billingService from '../services/billingService';
import { getCurrentSubscription, changePlan as apiChangePlan, cancelSubscription as apiCancelSubscription } from '../api/subscriptions';
import { getInvoices } from '../api/invoices';
import { useAdminSettings } from '../contexts/AdminSettingsContext';
import { formatDateWithSystemSettings, formatCurrencyWithSettings } from '../utils/formatting';

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
}

const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { system, currency } = useAdminSettings();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [latestInvoice, setLatestInvoice] = useState<Invoice | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRetryPayment = () => {
    if (!subscription) return;

    const query = new URLSearchParams();
    if (subscription.planId) {
      query.set('planId', subscription.planId);
    }
    if (subscription.billingPeriod) {
      query.set('billingPeriod', subscription.billingPeriod);
    }

    navigate(`/pricing?${query.toString()}`);
  };

  const fetchBillingData = async (showSpinner: boolean = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const [subData, plansData, invoicePage] = await Promise.all([
        getCurrentSubscription(),
        billingService.getPlans(),
        getInvoices(1, 5),
      ]);

      const invoices = Array.isArray(invoicePage.data) ? invoicePage.data : [];

      setSubscription(subData);
      setPlans(plansData.filter((p: Plan) => p.isActive !== false));
      setLatestInvoice(invoices.length > 0 ? invoices[0] : null);
      setRecentInvoices(invoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load billing data';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      if (showSpinner) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Fetch subscription, plans and latest invoice on mount
  useEffect(() => {
    fetchBillingData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRIAL':
        return 'info';
      case 'ACTIVE':
        return 'success';
      case 'PAST_DUE':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateWithSystemSettings(dateString, system);
  };

  const calculateDaysRemaining = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getUsageMetrics = (): UsageMetric[] => {
    if (!subscription) return [];

    return [
      {
        name: 'Active Users',
        current: subscription.usageMetrics?.activeUsers || 0,
        limit: subscription.usageLimits?.userLimit || 0,
        unit: 'users',
      },
      {
        name: 'Products',
        current: subscription.usageMetrics?.productsCreated || 0,
        limit: subscription.usageLimits?.productsLimit || 0,
        unit: 'products',
      },
      {
        name: 'Orders',
        current: subscription.usageMetrics?.ordersProcessed || 0,
        limit: subscription.usageLimits?.ordersLimit || 0,
        unit: 'orders',
      },
      {
        name: 'Storage Used',
        current: subscription.usageMetrics?.storageUsedMB || 0,
        limit: subscription.usageLimits?.storageLimitMB || 0,
        unit: 'MB',
      },
    ];
  };

  const getCurrentPlan = () => {
    return plans.find((p) => p._id === subscription?.planId);
  };

  const getAvailablePlans = () => {
    return plans.filter((p) => p._id !== subscription?.planId);
  };

  const handleChangePlan = async (newPlan: Plan) => {
    try {
      setIsChanging(true);
      await apiChangePlan({
        newPlanId: newPlan._id!,
        billingPeriod: subscription?.billingPeriod || 'MONTHLY',
      });

      enqueueSnackbar(`Successfully changed to ${newPlan.name} plan!`, {
        variant: 'success',
      });

      setUpgradeDialogOpen(false);
      setSelectedPlan(null);

      // Refresh subscription
      const updatedSub = await getCurrentSubscription();
      setSubscription(updatedSub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change plan';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancelAutoRenew = async () => {
    try {
      await apiCancelSubscription(true);
      enqueueSnackbar('Auto-renewal has been cancelled', { variant: 'success' });

      // Refresh subscription
      const updatedSub = await getCurrentSubscription();
      setSubscription(updatedSub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel auto-renewal';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  let content;
  if (loading) {
    content = (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  } else if (error || !subscription) {
    content = (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error || 'No active subscription found'}</Alert>
      </Container>
    );
  } else {
    const currentPlan = getCurrentPlan();
    const usageMetrics = getUsageMetrics();
    const daysRemaining =
      subscription.status === 'TRIAL'
        ? calculateDaysRemaining(subscription.trialEndsAt || '')
        : calculateDaysRemaining(subscription.renewsAt || '');
    content = (
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Billing Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your subscription and billing information
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<CreditCardIcon fontSize="small" />}
            onClick={() => navigate('/app/billing/offline')}
            title="Submit bank transfers or manual payments for review"
          >
            Offline payment
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fetchBillingData(false)}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh status'}
          </Button>
        </Box>
      </Box>

      {/* Payment Status Notice */}
      {latestInvoice && (
        <Box sx={{ mb: 4 }}>
          <Alert
            severity={
              latestInvoice.status === 'PAID'
                ? 'success'
                : latestInvoice.status === 'FAILED' || latestInvoice.status === 'REFUNDED'
                ? 'error'
                : latestInvoice.status === 'PROCESSING'
                ? 'info'
                : 'warning'
            }
          >
            <Typography variant="body2">
              Latest payment via{' '}
              <strong>{latestInvoice.paymentMethod || 'UNKNOWN'}</strong>{' '}
              for invoice <strong>{latestInvoice.invoiceNumber}</strong> is{' '}
              <strong>{latestInvoice.status}</strong>.
            </Typography>
            {latestInvoice.paidOn && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Paid on: <strong>{formatDate(latestInvoice.paidOn)}</strong>
              </Typography>
            )}
            {!latestInvoice.paidOn && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Due date: <strong>{formatDate(latestInvoice.dueDate)}</strong>
              </Typography>
            )}
            {(subscription.status === 'PAST_DUE' ||
              subscription.status === 'CANCELLED' ||
              latestInvoice.status === 'FAILED' ||
              latestInvoice.status === 'PENDING') && (
              <Box
                sx={{
                  mt: 1.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1.5,
                }}
              >
                <Typography variant="body2">
                  We couldn't process your last payment. You can retry checkout with a
                  different payment method.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleRetryPayment}
                >
                  Retry payment
                </Button>
              </Box>
            )}
          </Alert>
        </Box>
      )}

      {/* Current Plan Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Current Plan
                </Typography>
                <Chip
                  label={subscription.status}
                  color={getStatusColor(subscription.status)}
                  size="small"
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {currentPlan?.name}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {currentPlan?.description}
              </Typography>

              {/* Assignment UI for Billing */}
              {subscription?._id && (
                <BillingHierarchyAssignment billingId={subscription._id} />
              )}

              {subscription.status === 'TRIAL' && subscription.trialEndsAt && (
                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                  Trial ends in {daysRemaining} days ({formatDate(subscription.trialEndsAt)})
                </Alert>
              )}

              {subscription.status === 'ACTIVE' && subscription.renewsAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Renews on: <strong>{formatDate(subscription.renewsAt)}</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ({daysRemaining} days remaining)
                  </Typography>
                </Box>
              )}

              {subscription.paymentMethod && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Payment method:
                    <Chip
                      label={subscription.paymentMethod}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setUpgradeDialogOpen(true)}
                  fullWidth
                >
                  Change Plan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CreditCardIcon />}
                  onClick={() => navigate('/app/billing/invoices')}
                  fullWidth
                >
                  View Invoices
                </Button>
              </Box>

              {subscription.autoRenew && (
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  onClick={handleCancelAutoRenew}
                  sx={{ mt: 2 }}
                >
                  Cancel Auto-Renewal
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Features Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Plan Features
              </Typography>

              <List dense>
                {currentPlan?.features.map((feature, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Metrics */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Usage & Limits
      </Typography>

      <Grid container spacing={2}>
        {usageMetrics.map((metric, idx) => {
          const percentage = metric.limit > 0 ? (metric.current / metric.limit) * 100 : 0;
          const isWarning = percentage >= 80;
          const isCritical = percentage >= 95;

          return (
            <Grid item xs={12} sm={6} key={idx}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metric.name}
                    </Typography>

        {/* Payment & Plan History */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Payment & Plan History
          </Typography>

          {recentInvoices.length === 0 ? (
            <Alert severity="info">No invoices yet. Once you subscribe or renew, your payment history will appear here.</Alert>
          ) : (
            <Card>
              <CardContent>
                {recentInvoices.map((invoice) => {
                  const isActivationInvoice =
                    invoice.subscriptionId === subscription._id && invoice.status === 'PAID';

                  return (
                    <Box
                      key={invoice._id}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ mb: { xs: 1, md: 0 } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(invoice.createdAt)}
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={invoice.status}
                            size="small"
                            color={
                              invoice.status === 'PAID'
                                ? 'success'
                                : invoice.status === 'FAILED' || invoice.status === 'REFUNDED'
                                ? 'error'
                                : invoice.status === 'PROCESSING'
                                ? 'info'
                                : 'warning'
                            }
                            variant="outlined"
                          />
                          {invoice.paymentMethod && (
                            <Chip
                              label={invoice.paymentMethod}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {isActivationInvoice && (
                            <Chip
                              label="Current plan activation"
                              size="small"
                              color="primary"
                            />
                          )}
                          {invoice.affiliateId && (
                            <>
                              <Chip
                                label="Affiliate referral"
                                size="small"
                                color="secondary"
                              />
                              <Chip
                                label={`Commission: ${((invoice.amount * 0.30) / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </>
                          )}
                        </Box>
                        {invoice.notes && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            Notes: {invoice.notes}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrencyWithSettings(invoice.amount, invoice.currency, currency)}
                        </Typography>
                        <Button
                          size="small"
                          sx={{ mt: 0.5 }}
                          variant="text"
                          onClick={() => navigate(`/app/billing/invoices?invoiceId=${invoice._id}`)}
                        >
                          View & Download
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: isCritical ? 'error.main' : isWarning ? 'warning.main' : 'success.main',
                      }}
                    >
                      {metric.current} / {metric.limit === 0 ? '∞' : metric.limit} {metric.unit}
                    </Typography>
                  </Box>

                  {metric.limit > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: isCritical ? 'error.main' : isWarning ? 'warning.main' : 'success.main',
                        },
                      }}
                    />
                  )}

                  {metric.limit === 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'success.main',
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Change Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Your Plan</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {getAvailablePlans().length === 0 ? (
            <Typography color="textSecondary">No other plans available</Typography>
          ) : (
            <List>
              {getAvailablePlans().map((plan) => (
                <ListItemButton
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan)}
                  selected={selectedPlan?._id === plan._id}
                  sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <ListItemText
                    primary={plan.name}
                    secondary={`${formatCurrencyWithSettings(
                      subscription.billingPeriod === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly,
                      subscription.currency,
                      currency,
                    )}/${subscription.billingPeriod === 'MONTHLY' ? 'month' : 'year'}`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)} disabled={isChanging}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedPlan && handleChangePlan(selectedPlan)}
            variant="contained"
            disabled={!selectedPlan || isChanging}
          >
            {isChanging ? 'Changing...' : 'Change Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
      );
    }
    return <ErrorBoundary>{content}</ErrorBoundary>;
};

export default BillingDashboard;
