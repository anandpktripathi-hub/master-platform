import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import type { Plan, BillingPeriod } from '../types/billing.types';
import { PricingCard } from '../components/billing/PricingCard';
import { PlanComparisonTable } from '../components/billing/PlanComparisonTable';
import api from '../services/api';
import type { Package } from '../types/api.types';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [prefilledFromQuery, setPrefilledFromQuery] = useState(false);

  // Fetch packages (manual billing model)
  useEffect(() => {
    const toDisplayPlan = (pkg: Package): Plan => {
      const featureList = Object.entries(pkg.featureSet || {})
        .filter(([, v]) => v === true)
        .map(([k]) => k);

      const monthlyPaise =
        pkg.billingCycle === 'monthly'
          ? Math.round(pkg.price * 100)
          : pkg.billingCycle === 'annual'
            ? Math.round((pkg.price / 12) * 100)
            : Math.round(pkg.price * 100);

      const yearlyPaise =
        pkg.billingCycle === 'annual'
          ? Math.round(pkg.price * 100)
          : pkg.billingCycle === 'monthly'
            ? Math.round(pkg.price * 12 * 100)
            : Math.round(pkg.price * 100);

      return {
        _id: pkg._id,
        name: pkg.name,
        slug: pkg.name.toLowerCase().replace(/\s+/g, '-'),
        description: pkg.description || '',
        priceMonthly: monthlyPaise,
        priceYearly: yearlyPaise,
        features: featureList,
        userLimit:
          typeof pkg.limits?.maxTeamMembers === 'number'
            ? pkg.limits.maxTeamMembers
            : -1,
        storageLimitMB:
          typeof pkg.limits?.maxStorageMb === 'number'
            ? pkg.limits.maxStorageMb
            : -1,
        ordersLimit: -1,
        productsLimit: -1,
        isActive: pkg.isActive !== false,
        displayOrder: typeof pkg.order === 'number' ? pkg.order : 0,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      };
    };

    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/packages');
        const list: Package[] = Array.isArray(response)
          ? (response as Package[])
          : ((response as any)?.data as Package[]) || [];

        const active = (list || []).filter((p) => p.isActive !== false);
        setPackages(active);

        const filtered = active.filter((p) => {
          if (billingPeriod === 'MONTHLY') return p.billingCycle === 'monthly';
          return p.billingCycle === 'annual';
        });

        const mapped = filtered
          .map(toDisplayPlan)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        setPlans(mapped);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing plans';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [enqueueSnackbar, billingPeriod]);

  // If opened with planId/billingPeriod in the query string (e.g. from Billing Dashboard retry),
  // pre-select that plan and open the confirmation dialog.
  useEffect(() => {
    if (prefilledFromQuery || plans.length === 0) return;

    const params = new URLSearchParams(location.search);
    const planId = params.get('planId');
    const period = params.get('billingPeriod') as BillingPeriod | null;

    if (!planId) return;

    const plan = plans.find((p) => p._id === planId);
    if (!plan) return;

    if (period === 'MONTHLY' || period === 'YEARLY') {
      setBillingPeriod(period);
    }

    setSelectedPlan(plan);
    setShowConfirmDialog(true);
    setPrefilledFromQuery(true);
  }, [plans, location.search, prefilledFromQuery]);

  const handleSubscribe = (plan: Plan) => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      enqueueSnackbar('Please log in to subscribe to a plan', { variant: 'info' });
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const confirmSubscription = async () => {
    if (!selectedPlan) return;

    try {
      setIsSubscribing(true);
      const pkg = packages.find((p) => p._id === selectedPlan._id);
      if (!pkg) {
        throw new Error('Selected package not found');
      }

      await api.post('/offline-payments', {
        amount: pkg.price,
        currency: 'USD',
        method: 'bank_transfer',
        description: `Package upgrade request: ${pkg.name} (${billingPeriod === 'MONTHLY' ? 'monthly' : 'annual'})`,
        metadata: {
          packageId: pkg._id,
          billingPeriod,
          billingCycle: pkg.billingCycle,
        },
      });

      enqueueSnackbar(
        'Offline payment request submitted. An admin will review and apply your upgrade once approved.',
        { variant: 'success' },
      );

      setShowConfirmDialog(false);
      setSelectedPlan(null);

      setTimeout(() => {
        navigate('/app/billing/offline-payments');
      }, 1200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Simple, Transparent Pricing
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, mb: 4 }}
        >
          Choose the perfect plan for your business needs
        </Typography>

        {/* Billing Period Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <ToggleButtonGroup
            value={billingPeriod}
            exclusive
            onChange={(_, newValue) => {
              if (newValue) setBillingPeriod(newValue);
            }}
            aria-label="billing period"
          >
            <ToggleButton value="MONTHLY">Monthly Billing</ToggleButton>
            <ToggleButton value="YEARLY">Yearly Billing</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {billingPeriod === 'YEARLY' && (
          <Alert severity="success" sx={{ maxWidth: 400, mx: 'auto' }}>
            Save up to 20% with annual billing!
          </Alert>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Pricing Cards Grid */}
      {!loading && !error && plans.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan._id}>
                <PricingCard
                  plan={plan}
                  billingPeriod={billingPeriod}
                  onSubscribe={() => handleSubscribe(plan)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Comparison Table */}
          <Box sx={{ mt: 12 }}>
            <PlanComparisonTable plans={plans} />
          </Box>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && plans.length === 0 && (
        <Alert severity="info">No plans available at the moment. Please try again later.</Alert>
      )}

      {/* Subscription Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Subscription</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Plan: <strong>{selectedPlan?.name}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Billing Period: <strong>{billingPeriod === 'MONTHLY' ? 'Monthly' : 'Yearly'}</strong>
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
              {selectedPlan &&
                `₹${((billingPeriod === 'MONTHLY' ? selectedPlan.priceMonthly : selectedPlan.priceYearly) / 100).toFixed(2)}`}
              <Typography component="span" variant="body2" color="textSecondary">
                {' '}
                /{billingPeriod === 'MONTHLY' ? 'month' : 'year'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
              {selectedPlan?.description || 'You will be able to manage your subscription from the billing dashboard.'}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Payment Method
              </Typography>
                <Typography variant="body2" color="textSecondary">
                  Offline / manual payment (bank transfer). After you submit the request, an admin will approve it and your package will be applied.
                </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmDialog(false)}
            disabled={isSubscribing}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSubscription}
            variant="contained"
            disabled={isSubscribing}
          >
            {isSubscribing ? 'Submitting...' : 'Submit Offline Payment Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pricing;
