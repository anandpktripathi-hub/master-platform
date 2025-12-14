import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import type { Plan, BillingPeriod } from '../types/billing.types';

interface PricingCardProps {
  plan: Plan;
  billingPeriod: BillingPeriod;
  isCurrentPlan?: boolean;
  onSubscribe?: () => void;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  isLoading?: boolean;
  buttonText?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingPeriod,
  isCurrentPlan = false,
  onSubscribe,
  onUpgrade,
  onDowngrade,
  isLoading = false,
  buttonText = 'Subscribe Now',
}) => {
  const price = billingPeriod === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;
  const displayPrice = (price / 100).toFixed(2);
  const period = billingPeriod === 'MONTHLY' ? '/month' : '/year';
  
  const monthlyCost = billingPeriod === 'YEARLY' ? ((plan.priceYearly / 12) / 100).toFixed(2) : null;
  const savings = 
    billingPeriod === 'YEARLY' && plan.priceYearly > 0 && plan.priceMonthly > 0
      ? Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)
      : null;

  const isPopular = plan.displayOrder === 2; // Middle plan is usually popular

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: isCurrentPlan ? '2px solid' : '1px solid',
        borderColor: isCurrentPlan ? 'primary.main' : 'divider',
        transform: isPopular && !isCurrentPlan ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {isPopular && !isCurrentPlan && (
        <Chip
          label="Most Popular"
          color="primary"
          variant="filled"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 600,
          }}
        />
      )}

      {isCurrentPlan && (
        <Chip
          label="Current Plan"
          color="success"
          variant="filled"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 600,
          }}
        />
      )}

      <CardHeader
        title={plan.name}
        subheader={plan.description}
        sx={{
          pb: 2,
        }}
      />

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {/* Price Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
            ₹{displayPrice}
            <Typography component="span" variant="body2" color="textSecondary">
              {period}
            </Typography>
          </Typography>
          {monthlyCost && savings && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
              ≈ ₹{monthlyCost}/month • Save {savings}%
            </Typography>
          )}
        </Box>

        {/* Features List */}
        <List dense sx={{ mb: 3 }}>
          {plan.features.map((feature, idx) => (
            <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        {/* Limits */}
        <Box
          sx={{
            backgroundColor: 'background.default',
            p: 2,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            Resource Limits:
          </Typography>
          <Typography variant="caption" component="div" color="textSecondary">
            {plan.userLimit && plan.userLimit !== -1 ? `Users: ${plan.userLimit}` : 'Users: Unlimited'}
          </Typography>
          <Typography variant="caption" component="div" color="textSecondary">
            {plan.productsLimit && plan.productsLimit !== -1
              ? `Products: ${plan.productsLimit}`
              : 'Products: Unlimited'}
          </Typography>
          <Typography variant="caption" component="div" color="textSecondary">
            {plan.ordersLimit && plan.ordersLimit !== -1
              ? `Orders: ${plan.ordersLimit}`
              : 'Orders: Unlimited'}
          </Typography>
          {plan.storageLimitMB && plan.storageLimitMB !== -1 && (
            <Typography variant="caption" component="div" color="textSecondary">
              Storage: {(plan.storageLimitMB / 1024).toFixed(0)}GB
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* CTA Button */}
      <Box sx={{ p: 2, pt: 0 }}>
        {isCurrentPlan ? (
          <Button fullWidth variant="outlined" color="primary" disabled>
            Current Plan
          </Button>
        ) : plan.priceMonthly === 0 && plan.priceYearly === 0 ? (
          <Button
            fullWidth
            variant="contained"
            onClick={onSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Start Free'}
          </Button>
        ) : (
          <>
            {onUpgrade && (
              <Button
                fullWidth
                variant="contained"
                onClick={onUpgrade}
                disabled={isLoading}
                sx={{ mb: 1 }}
              >
                {isLoading ? 'Processing...' : 'Upgrade'}
              </Button>
            )}
            {onDowngrade && (
              <Button
                fullWidth
                variant="outlined"
                onClick={onDowngrade}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Downgrade'}
              </Button>
            )}
            {!onUpgrade && !onDowngrade && (
              <Button
                fullWidth
                variant="contained"
                onClick={onSubscribe}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : buttonText}
              </Button>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};
