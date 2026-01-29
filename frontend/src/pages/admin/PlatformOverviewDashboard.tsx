import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface SaasOverviewResponse {
  tenants: {
    total: number;
    active: number;
    trialing: number;
    paying: number;
  };
  users: {
    total: number;
    verified: number;
  };
  billing: {
    totalRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    currency: string | null;
  };
  offlinePayments?: {
    pendingCount: number;
  };
  domains: {
    internal: {
      total: number;
      path: number;
      subdomain: number;
      byStatus: {
        pending: number;
        active: number;
        suspended: number;
        blocked: number;
      };
    };
    custom: {
      total: number;
      byStatus: {
        pending_verification: number;
        verified: number;
        ssl_pending: number;
        ssl_issued: number;
        active: number;
        suspended: number;
      };
    };
  };
  orders: {
    totalOrders: number;
    totalSales: number;
    last30Days: {
      orders: number;
      totalSales: number;
    };
    byStatus: {
      completed: number;
      cancelled: number;
    };
    dailySeries: {
      date: string;
      totalOrders: number;
      totalSales: number;
    }[];
  };
  plans: {
    byPlanKey: Record<'FREE' | 'PRO' | 'ENTERPRISE', number>;
  };
  visitors: {
    totalViewsLast30Days: number;
    totalUniqueVisitorsLast30Days: number;
    dailySeries: {
      date: string;
      views: number;
      uniqueVisitors: number;
    }[];
    topTenants: {
      tenantId: string;
      tenantName: string;
      views: number;
      uniqueVisitors: number;
    }[];
  };
  monthlyRevenue: {
    month: string;
    totalAmount: number;
    paidInvoices: number;
  }[];
  sslAutomation: {
    acme: {
      total: number;
      pending: number;
      issued: number;
      failed: number;
    };
  };
  paymentsHealth: {
    totalFailedLast30Days: number;
    recentFailures: {
      transactionId: string;
      gatewayName: string;
      error: string;
      createdAt: string;
    }[];
  };
}

export default function PlatformOverviewDashboard() {
  const overviewQuery = useQuery<SaasOverviewResponse, Error>({
    queryKey: ['admin-saas-overview'],
    queryFn: async () => {
      const data = await api.get('/dashboards/admin/saas-overview');
      return data as SaasOverviewResponse;
    },
  });

  const { data, isLoading, isError, refetch } = overviewQuery;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadingState variant="table" fullHeight />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState
          message="Unable to load SaaS overview."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  const { tenants, users, billing, monthlyRevenue, domains, orders, plans, visitors, offlinePayments, sslAutomation, paymentsHealth } = data;

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">SaaS Super Admin Overview</Typography>
          <Typography variant="body2" color="textSecondary">
            Global KPIs across all tenants, users, and billing activity.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => window.location.assign('/app/admin/analytics/billing')}
          >
            View billing analytics
          </Button>
          <Button variant="outlined" onClick={() => refetch()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Tenants
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {tenants.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Active: ${tenants.active}`}
                  color="success"
                />
                <Chip
                  size="small"
                  label={`Trial: ${tenants.trialing}`}
                  color="warning"
                />
                <Chip
                  size="small"
                  label={`Paying: ${tenants.paying}`}
                  color="primary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                SSL automation (ACME)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {sslAutomation.acme.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Pending: ${sslAutomation.acme.pending}`}
                  color={sslAutomation.acme.pending > 0 ? 'warning' : 'default'}
                />
                <Chip
                  size="small"
                  label={`Issued: ${sslAutomation.acme.issued}`}
                  color="success"
                />
                <Chip
                  size="small"
                  label={`Failed: ${sslAutomation.acme.failed}`}
                  color={sslAutomation.acme.failed > 0 ? 'error' : 'default'}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Users
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {users.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Verified: ${users.verified}`}
                  color="success"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Billing
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {billing.currency || ''}{' '}
                {billing.totalRevenue.toFixed(2)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Paid invoices: ${billing.paidInvoices}`}
                  color="primary"
                />
                <Chip
                  size="small"
                  label={`Total invoices: ${billing.totalInvoices}`}
                  variant="outlined"
                />
                {offlinePayments && (
                  <Chip
                    size="small"
                    label={`Pending offline: ${offlinePayments.pendingCount}`}
                    color={offlinePayments.pendingCount > 0 ? 'warning' : 'default'}
                    variant={offlinePayments.pendingCount > 0 ? 'filled' : 'outlined'}
                    sx={{ ml: 0.5 }}
                    onClick={() => window.location.assign('/app/admin/payments/offline')}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Domains
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {domains.internal.total + domains.custom.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Internal: ${domains.internal.total}`}
                  color="primary"
                />
                <Chip
                  size="small"
                  label={`Path: ${domains.internal.path}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Subdomain: ${domains.internal.subdomain}`}
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Active: ${domains.internal.byStatus.active}`}
                  color="success"
                />
                <Chip
                  size="small"
                  label={`Pending: ${domains.internal.byStatus.pending}`}
                  color="warning"
                />
                <Chip
                  size="small"
                  label={`Suspended: ${domains.internal.byStatus.suspended}`}
                  color="error"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Custom: ${domains.custom.total}`}
                  color="secondary"
                />
                <Chip
                  size="small"
                  label={`Custom active: ${domains.custom.byStatus.active}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Custom pending: ${domains.custom.byStatus.pending_verification}`}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Plans
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {tenants.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`FREE: ${plans.byPlanKey.FREE ?? 0}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`PRO: ${plans.byPlanKey.PRO ?? 0}`}
                  color="primary"
                />
                <Chip
                  size="small"
                  label={`ENTERPRISE: ${plans.byPlanKey.ENTERPRISE ?? 0}`}
                  color="secondary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Orders (POS)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {orders.totalOrders}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Total sales: ${(billing.currency || '')} ${orders.totalSales.toFixed(2)}`}
                  color="primary"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Last 30 days: ${orders.last30Days.orders} orders`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Last 30 days sales: ${(billing.currency || '')} ${orders.last30Days.totalSales.toFixed(2)}`}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Plans
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {tenants.total}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`FREE: ${plans.byPlanKey.FREE ?? 0}`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`PRO: ${plans.byPlanKey.PRO ?? 0}`}
                  color="primary"
                />
                <Chip
                  size="small"
                  label={`ENTERPRISE: ${plans.byPlanKey.ENTERPRISE ?? 0}`}
                  color="secondary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Orders (POS)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {orders.totalOrders}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Total sales: ${(billing.currency || '')} ${orders.totalSales.toFixed(2)}`}
                  color="primary"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Completed: ${orders.byStatus.completed}`}
                  color="success"
                />
                <Chip
                  size="small"
                  label={`Cancelled: ${orders.byStatus.cancelled}`}
                  color="error"
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Last 30 days: ${orders.last30Days.orders} orders`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`Last 30 days sales: ${(billing.currency || '')} ${orders.last30Days.totalSales.toFixed(2)}`}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Visitors (30d)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {visitors.totalViewsLast30Days}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Unique: ${visitors.totalUniqueVisitorsLast30Days}`}
                  color="primary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Revenue (last 12 months)
              </Typography>
              {monthlyRevenue.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No paid invoices recorded in the selected period.
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={monthlyRevenue} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => value.toFixed?.(2) ?? value} />
                      <Line
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Total revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Orders & sales (last 30 days)
              </Typography>
              {orders.dailySeries.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No POS orders recorded in the last 30 days.
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={orders.dailySeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => value.toFixed?.(2) ?? value} />
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Total sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Visitors (last 30 days)
              </Typography>
              {visitors.dailySeries.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No CMS page views recorded in the last 30 days.
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={visitors.dailySeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => value.toFixed?.(2) ?? value} />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Page views"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top tenants by traffic (30d)
              </Typography>
              {visitors.topTenants.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No tenant-level traffic data available yet.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 280, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tenant</TableCell>
                        <TableCell align="right">Views</TableCell>
                        <TableCell align="right">Unique visitors</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitors.topTenants.map((tenant) => (
                        <TableRow key={tenant.tenantId} hover>
                          <TableCell>{tenant.tenantName || tenant.tenantId}</TableCell>
                          <TableCell align="right">{tenant.views}</TableCell>
                          <TableCell align="right">{tenant.uniqueVisitors}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Payments health (recent failures)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  label={`Failed in last 30d: ${paymentsHealth.totalFailedLast30Days}`}
                  color={paymentsHealth.totalFailedLast30Days > 0 ? 'warning' : 'success'}
                />
              </Stack>
              {paymentsHealth.recentFailures.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No failed payments recorded yet.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 260, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Gateway</TableCell>
                        <TableCell>Error</TableCell>
                        <TableCell>When</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentsHealth.recentFailures.map((failure) => (
                        <TableRow key={failure.transactionId} hover>
                          <TableCell>{failure.gatewayName}</TableCell>
                          <TableCell>{failure.error.length > 80 ? failure.error.slice(0, 77) + '…' : failure.error}</TableCell>
                          <TableCell>{new Date(failure.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
