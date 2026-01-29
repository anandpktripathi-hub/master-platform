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

interface BillingRevenueMonthBucket {
  month: string;
  totalAmount: number;
  paidInvoices: number;
}

interface BillingRevenueByCurrencyBucket {
  currency: string;
  totalAmount: number;
  paidInvoices: number;
}

interface BillingRevenueStatusSummary {
  paidLast30: number;
  overdue: number;
  cancelled: number;
}

interface BillingRevenueAnalyticsResponse {
  totalRevenueLast30: number;
  totalRevenueLast365: number;
  mrrApprox: number;
  arrApprox: number;
  defaultCurrency: string | null;
  status: BillingRevenueStatusSummary;
  byMonth: BillingRevenueMonthBucket[];
  byCurrency: BillingRevenueByCurrencyBucket[];
}

const AdminBillingAnalyticsPage: React.FC = () => {
  const query = useQuery<BillingRevenueAnalyticsResponse, Error>({
    queryKey: ['admin-billing-analytics'],
    queryFn: async () => {
      const data = await api.get('/billing/analytics/revenue');
      return data as BillingRevenueAnalyticsResponse;
    },
  });

  const { data, isLoading, isError, refetch } = query;

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
          message="Unable to load billing analytics."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  const { totalRevenueLast30, totalRevenueLast365, mrrApprox, arrApprox, defaultCurrency, status, byMonth, byCurrency } = data;

  const currency = defaultCurrency || '';

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Billing & Revenue Analytics</Typography>
          <Typography variant="body2" color="textSecondary">
            High-level revenue KPIs for the entire SaaS platform.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            label="Last 30 days"
            size="small"
            color="primary"
          />
          <Chip
            label="Last 12 months"
            size="small"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Revenue (30 days)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {currency} {totalRevenueLast30.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Sum of all paid invoices issued in the last 30 days.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Revenue (365 days)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {currency} {totalRevenueLast365.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Paid invoices over the last 12 months.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Approx. MRR
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {currency} {mrrApprox.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Based on the most recent full month of paid invoices.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Approx. ARR
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {currency} {arrApprox.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                MRR × 12, for quick annualized view.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Monthly revenue trend (last 12 months)
              </Typography>
              {byMonth.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No paid invoices recorded in the last 12 months.
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={byMonth} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
                Invoice status snapshot
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label={`Paid (30d): ${status.paidLast30}`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Overdue: ${status.overdue}`}
                  color="warning"
                  size="small"
                />
                <Chip
                  label={`Cancelled: ${status.cancelled}`}
                  color="error"
                  size="small"
                />
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Revenue by currency
                </Typography>
                {byCurrency.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No invoices found.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Currency</TableCell>
                        <TableCell align="right">Paid invoices</TableCell>
                        <TableCell align="right">Total amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {byCurrency.map((row) => (
                        <TableRow key={row.currency}>
                          <TableCell>{row.currency}</TableCell>
                          <TableCell align="right">{row.paidInvoices}</TableCell>
                          <TableCell align="right">{row.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminBillingAnalyticsPage;
