import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Alert, Grid, Card, CardContent, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmAnalytics, getCrmAnalytics } from '../api/crm-analytics';
import { useCanUseFeature } from '../hooks/usePackages';
import { useNavigate } from 'react-router-dom';

const STAGE_COLORS: { [key: string]: string } = {
  NEW: '#3b82f6',
  QUALIFIED: '#8b5cf6',
  PROPOSAL: '#f59e0b',
  WON: '#10b981',
  LOST: '#ef4444',
};

export default function CrmAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CrmAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: advancedFeature, isLoading: featureLoading } = useCanUseFeature('advancedAnalytics');

  useEffect(() => {
    if (featureLoading) return;
    if (advancedFeature && !advancedFeature.canUse) {
      setLoading(false);
      setError(null);
      return;
    }
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureLoading, advancedFeature]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCrmAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || featureLoading)
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading analytics...</Typography>
      </Container>
    );

  if (!featureLoading && advancedFeature && !advancedFeature.canUse) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Advanced CRM analytics are not included in your current plan. Upgrade your subscription to unlock the
          Analytics Dashboard.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/app/packages')}>
          View plans & upgrade
        </Button>
      </Container>
    );
  }
  if (error) return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!analytics) return null;

  const pipelineData = analytics.pipelineByStage.map((item) => ({
    stage: item.stage,
    count: item.count,
    value: item.totalValue,
  }));

  const pieData = analytics.pipelineByStage.map((item) => ({
    name: item.stage,
    value: item.count,
  }));

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          CRM Analytics Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Revenue Forecast
                </Typography>
                <Typography variant="h3" color="primary">
                  ${analytics.revenueForecast.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All non-LOST deals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h3" color="primary">
                  {analytics.taskStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {analytics.taskStats.completed} completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Task Completion Rate
                </Typography>
                <Typography variant="h3" color="success.main">
                  {analytics.taskStats.completionRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall completion
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Deal Pipeline by Stage
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Deal Count" />
              <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Total Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Deal Distribution by Stage
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.name] || '#cccccc'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
