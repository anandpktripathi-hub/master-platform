import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

type TenantCmsAnalytics = {
  totalPages: number;
  totalViews: number;
  totalUniqueVisitors: number;
  topPages: Array<{ pageId: string; views: number; visitors: number }>;
};

const CmsAnalyticsPage: React.FC = () => {
  const query = useQuery<TenantCmsAnalytics, Error>({
    queryKey: ['cms-analytics-tenant'],
    queryFn: async () => {
      const data = await api.get('/cms/analytics/tenant?days=30');
      return data as TenantCmsAnalytics;
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
          title="CMS Analytics"
          message="Unable to load CMS analytics."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4">CMS Analytics</Typography>
        <Typography variant="body2" color="text.secondary">
          Tenant-level page analytics (last 30 days).
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Published Pages (tracked)
                </Typography>
                <Typography variant="h5">{data.totalPages}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Views
                </Typography>
                <Typography variant="h5">{data.totalViews}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Unique Visitors
                </Typography>
                <Typography variant="h5">{data.totalUniqueVisitors}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Pages
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Page ID</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Visitors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.topPages || []).map((p) => (
                  <TableRow key={p.pageId}>
                    <TableCell>{p.pageId}</TableCell>
                    <TableCell align="right">{p.views}</TableCell>
                    <TableCell align="right">{p.visitors}</TableCell>
                  </TableRow>
                ))}
                {(!data.topPages || data.topPages.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="body2" color="text.secondary">
                        No analytics data yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CmsAnalyticsPage;
