import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCurrentPackageWithUsage } from '../../hooks/usePackages';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useNavigate } from 'react-router-dom';

export default function SystemHealthPage() {
  const navigate = useNavigate();

  const healthQuery = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const data = await api.get('/health');
      return data as { status: string; info?: any; error?: any; details?: any };
    },
  });

  const metricsQuery = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const data = await api.get('/metrics');
      return data as {
        timestamp: string;
        uptime: number;
        requests: {
          total: number;
          byMethod: Record<string, number>;
          byPath: Record<string, number>;
        };
        responses: {
          byStatus: Record<string, number>;
          avgResponseTime: number;
          maxResponseTime: number;
          minResponseTime: number;
        };
        memory: {
          heapUsed: number;
          heapTotal: number;
          external: number;
          rss: number;
        };
      };
    },
  });

  const { package: packageDef, tenantPackage, usage, isLoading: usageLoading, isError: usageError } =
    useCurrentPackageWithUsage();

  const isLoading = healthQuery.isLoading || metricsQuery.isLoading || usageLoading;
  const isError = healthQuery.isError || metricsQuery.isError || usageError;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadingState variant="table" fullHeight />
      </Box>
    );
  }

  if (isError || !healthQuery.data || !metricsQuery.data) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState message="Unable to load system health overview." onRetry={() => healthQuery.refetch()} />
      </Box>
    );
  }

  const status = healthQuery.data.status || 'unknown';
  const isHealthy = status === 'ok';

  const metrics = metricsQuery.data;

  const utilization = usage?.utilization || {};

  const quotaAlerts = Object.entries(utilization)
    .filter(([, value]) => typeof value === 'number' && value >= 80)
    .map(([key, value]) => {
      const formattedKey = key
        .replace(/^max/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      const severity: 'warning' | 'error' = value >= 95 ? 'error' : 'warning';
      return {
        key,
        label: formattedKey || key,
        value,
        severity,
      };
    });

  const renderUsageRow = (label: string, key: string) => {
    if (!usage || !usage.limits) return null;
    const limit = usage.limits[key];
    if (typeof limit !== 'number' || limit <= 0) return null;
    const current = usage.usage?.[key] || tenantPackage?.usageCounters?.[key] || 0;
    const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

    return (
      <Box key={key} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="body2">
            {current} / {limit}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={percentage} />
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">System Health & Usage Overview</Typography>
        <Button variant="outlined" onClick={() => healthQuery.refetch()}>
          Refresh
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">API Status</Typography>
              <Chip
                label={isHealthy ? 'HEALTHY' : status.toUpperCase()}
                color={isHealthy ? 'success' : 'error'}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="textSecondary">
              Overall service status from the backend health endpoint.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Subscription Snapshot</Typography>
              {tenantPackage && (
                <Chip label={tenantPackage.status.toUpperCase()} size="small" />
              )}
            </Stack>

            {packageDef && (
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Plan: {packageDef.name} (${packageDef.price.toFixed(2)} / {packageDef.billingCycle})
              </Typography>
            )}

            {tenantPackage?.trialEndsAt && (
              <Typography variant="body2" color="textSecondary">
                Free trial ends on {new Date(tenantPackage.trialEndsAt).toLocaleDateString()}.
              </Typography>
            )}

            {tenantPackage?.expiresAt && tenantPackage.status === 'active' && (
              <Typography variant="body2" color="textSecondary">
                Current billing period renews on{' '}
                {new Date(tenantPackage.expiresAt).toLocaleDateString()}.
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              {renderUsageRow('Domains', 'maxDomains')}
              {renderUsageRow('Custom domains', 'maxCustomDomains')}
              {renderUsageRow('Team members', 'maxTeamMembers')}
              {renderUsageRow('Pages', 'maxPages')}
            </Box>

            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/app/packages')}>
              Manage subscription
            </Button>
          </CardContent>
        </Card>
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">API Metrics</Typography>
              <Typography variant="body2" color="textSecondary">
                Uptime: {Math.round(metrics.uptime)}s • Total requests: {metrics.requests.total}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Response times (ms)
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg: {metrics.responses.avgResponseTime} • Max: {metrics.responses.maxResponseTime} • Min:{' '}
                  {metrics.responses.minResponseTime}
                </Typography>
              </Box>

              <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Responses by status
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(metrics.responses.byStatus).map(([code, count]) => (
                    <Chip key={code} label={`${code}: ${count}`} size="small" sx={{ mb: 1 }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {quotaAlerts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Quota Alerts
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                The following resources are close to or at their plan limits. Consider upgrading to avoid
                interruptions.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {quotaAlerts.map((alert) => (
                  <Chip
                    key={alert.key}
                    label={`${alert.label}: ${alert.value}% used`}
                    color={alert.severity === 'error' ? 'error' : 'warning'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Button sx={{ mt: 2 }} size="small" variant="outlined" onClick={() => navigate('/app/packages')}>
                Review plans & upgrade
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
