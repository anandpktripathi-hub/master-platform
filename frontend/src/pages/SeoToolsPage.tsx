import React, { useMemo, useState } from 'react';
import api from '../lib/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

type SeoPreview = {
  robotsTxt?: string;
  sitemapXml?: string;
  feedXml?: string;
};

const SeoToolsPage: React.FC = () => {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SeoPreview>({});

  const canFetch = useMemo(() => slug.trim().length > 0, [slug]);

  const fetchAll = async () => {
    if (!canFetch) return;
    setLoading(true);
    setError(null);
    try {
      const safeSlug = encodeURIComponent(slug.trim());
      const [robotsTxt, sitemapXml, feedXml] = await Promise.all([
        api.get(`/seo/tenants/${safeSlug}/robots.txt`, { responseType: 'text' }),
        api.get(`/seo/tenants/${safeSlug}/sitemap.xml`, { responseType: 'text' }),
        api.get(`/seo/tenants/${safeSlug}/feed.xml`, { responseType: 'text' }),
      ]);
      setPreview({
        robotsTxt: String(robotsTxt ?? ''),
        sitemapXml: String(sitemapXml ?? ''),
        feedXml: String(feedXml ?? ''),
      });
    } catch (e: any) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to load SEO previews';
      setError(message);
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
        <ErrorState title="SEO Tools" message={error} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4">SEO Tools</Typography>
        <Typography variant="body2" color="text.secondary">
          Preview tenant robots.txt, sitemap.xml and RSS feed. Enter the tenant public slug (used in `/b/:slug`).
        </Typography>

        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <TextField
                label="Tenant slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={fetchAll} disabled={!canFetch}>
                Load
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              robots.txt
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {preview.robotsTxt || '—'}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              sitemap.xml
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {preview.sitemapXml || '—'}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              feed.xml
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
              {preview.feedXml || '—'}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SeoToolsPage;
