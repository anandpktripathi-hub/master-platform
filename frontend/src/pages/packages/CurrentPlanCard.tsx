import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Box,
  Button,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Upgrade as UpgradeIcon,
} from '@mui/icons-material';
import { useCurrentPackageWithUsage } from '../../hooks/usePackages';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export default function CurrentPlanCard() {
  const navigate = useNavigate();
  const { package: packageDef, tenantPackage, usage, isLoading, isError } = useCurrentPackageWithUsage();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState variant="card" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !tenantPackage || !usage || !packageDef) {
    return (
      <Card>
        <CardContent>
          <ErrorState message="Failed to load your current plan." />
        </CardContent>
      </Card>
    );
  }

  const status = tenantPackage.status || usage.status;
  const isTrialActive = status === 'trial' && (tenantPackage.trialEndsAt || usage.trialEndsAt);
  const isExpired = status === 'expired';
  const pkg = packageDef;

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'expired':
        return 'error';
      case 'suspended':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderUsageBar = (label: string, current: number, limit: number) => {
    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
      <Box key={label} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="body2" color={isAtLimit ? 'error' : isNearLimit ? 'warning.main' : 'textPrimary'}>
            {current} / {limit}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'primary'}
        />
      </Box>
    );
  };

  const renderFeature = (label: string, enabled: boolean) => (
    <Stack key={label} direction="row" spacing={1} alignItems="center">
      {enabled ? (
        <CheckIcon color="success" fontSize="small" />
      ) : (
        <CancelIcon color="disabled" fontSize="small" />
      )}
      <Typography
        variant="body2"
        color={enabled ? 'textPrimary' : 'textSecondary'}
        sx={{ textDecoration: enabled ? 'none' : 'line-through' }}
      >
        {label}
      </Typography>
    </Stack>
  );

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">{pkg.name}</Typography>
          <Chip
            label={status.toUpperCase()}
            color={getStatusColor()}
            size="small"
          />
        </Stack>

        {pkg.description && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {pkg.description}
          </Typography>
        )}

        {/* Trial Info */}
        {isTrialActive && (tenantPackage.trialEndsAt || usage.trialEndsAt) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Trial ends on {new Date((tenantPackage.trialEndsAt || usage.trialEndsAt) as string).toLocaleDateString()}
          </Alert>
        )}

        {/* Expired Warning */}
        {isExpired && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Your plan has expired. Please upgrade to continue using premium features.
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Pricing */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" color="primary">
            ${pkg.price?.toFixed(2) ?? '0.00'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            per {pkg.billingCycle}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Usage Metrics */}
        <Typography variant="h6" gutterBottom>
          Usage
        </Typography>
        {Object.entries(usage.limits || {}).map(([key, limit]) => {
          const current = usage.usage?.[key] || tenantPackage.usageCounters?.[key] || 0;
          const formattedKey = key
            .replace(/^max/, '')
            .replace(/([A-Z])/g, ' $1')
            .trim();
          return renderUsageBar(formattedKey, current, limit);
        })}

        <Divider sx={{ my: 2 }} />

        {/* Features */}
        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(pkg.featureSet).map(([key, enabled]) => {
            const formattedKey = key
              .replace(/^allow/, '')
              .replace(/([A-Z])/g, ' $1')
              .trim();
            return (
              <Grid item xs={12} key={key}>
                {renderFeature(formattedKey, enabled as boolean)}
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<UpgradeIcon />}
            fullWidth
            onClick={() => navigate('/packages')}
          >
            Upgrade Plan
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
