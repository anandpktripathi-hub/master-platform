import React, { useMemo, useState } from 'react';
import api from '../../lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

type SeoAuditResult = any;

const CmsSeoAuditPage: React.FC = () => {
  const [pageId, setPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<SeoAuditResult | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  const canQuery = useMemo(() => pageId.trim().length > 0, [pageId]);

  const run = async () => {
    if (!canQuery) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.post(`/cms/seo-audit/${encodeURIComponent(pageId.trim())}/run`);
      setAudit(data);
      const rec = await api.get(`/cms/seo-audit/${encodeURIComponent(pageId.trim())}/recommendations`);
      setRecommendations(rec);
    } catch (e: any) {
      setError(e?.message || 'Failed to run audit');
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    if (!canQuery) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/cms/seo-audit/${encodeURIComponent(pageId.trim())}`);
      setAudit(data);
      const rec = await api.get(`/cms/seo-audit/${encodeURIComponent(pageId.trim())}/recommendations`);
      setRecommendations(rec);
    } catch (e: any) {
      setError(e?.message || 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LoadingState variant="table" fullHeight />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState title="CMS SEO Audit" message={error} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4">CMS SEO Audit</Typography>
        <Typography variant="body2" color="text.secondary">
          Run a SEO audit for a CMS page by Page ID.
        </Typography>

        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField
                label="CMS Page ID"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={run} disabled={!canQuery}>
                Run Audit
              </Button>
              <Button variant="outlined" onClick={loadLatest} disabled={!canQuery}>
                Load Latest
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Result
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {JSON.stringify(audit, null, 2) || 'No audit loaded yet.'}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {JSON.stringify(recommendations, null, 2) || 'No recommendations yet.'}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CmsSeoAuditPage;
