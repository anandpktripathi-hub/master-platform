import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import billingService from '../services/billingService';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await billingService.getPlans();
        const activePlans = response.filter((plan) => plan.isActive !== false);
        setPlans(activePlans);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing plans';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [enqueueSnackbar]);

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
      await billingService.subscribe({
        planId: selectedPlan._id!,
        billingPeriod,
      });

      enqueueSnackbar(`Successfully subscribed to ${selectedPlan.name} plan!`, {
        variant: 'success',
      });

      setShowConfirmDialog(false);
      setSelectedPlan(null);

      // Redirect to billing dashboard
      setTimeout(() => {
        navigate('/app/billing');
      }, 1500);
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
            {isSubscribing ? 'Subscribing...' : 'Confirm Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Pricing;
