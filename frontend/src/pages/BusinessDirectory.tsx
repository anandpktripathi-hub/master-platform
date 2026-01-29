import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { listPublicBusinesses, PublicBusinessSummary } from '../api/tenants-public';

export default function BusinessDirectory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PublicBusinessSummary[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [priceTier, setPriceTier] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listPublicBusinesses({
          q: q || undefined,
          category: category || undefined,
          city: city || undefined,
          priceTier: (priceTier as any) || undefined,
          minRating: minRating ? Number(minRating) : undefined,
        });
        setItems(res);
      } catch (e: any) {
        setError(e?.message || 'Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [q, category, city, priceTier, minRating]);

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">Business Directory</Typography>
        </Stack>

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, tagline, or tags"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{ minWidth: 160 }}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="price-tier-label">Price</InputLabel>
            <Select
              labelId="price-tier-label"
              label="Price"
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="LOW">Budget</MenuItem>
              <MenuItem value="MEDIUM">Standard</MenuItem>
              <MenuItem value="HIGH">Premium</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="min-rating-label">Min rating</InputLabel>
            <Select
              labelId="min-rating-label"
              label="Min rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="3">3+ stars</MenuItem>
              <MenuItem value="4">4+ stars</MenuItem>
              <MenuItem value="4.5">4.5+ stars</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {loading && <Typography>Loading businesses...</Typography>}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && items.length === 0 && (
          <Typography color="text.secondary">No businesses found.</Typography>
        )}

        <Grid container spacing={3}>
          {items.map((b) => {
            const displayName = b.publicName || b.name;
            return (
              <Grid item xs={12} sm={6} md={4} key={b._id}>
                <Card>
                  <CardActionArea component={RouterLink} to={`/b/${b.slug}`}>
                    <CardHeader
                      title={displayName}
                      subheader={b.tagline}
                    />
                    <CardContent>
                      {b.shortDescription && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {b.shortDescription}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {b.city && b.country && (
                          <Chip label={`${b.city}, ${b.country}`} size="small" sx={{ mb: 1 }} />
                        )}
                        {(b.categories || []).slice(0, 3).map((c) => (
                          <Chip key={c} label={c} size="small" sx={{ mb: 1 }} />
                        ))}
                        {typeof b.avgRating === 'number' && b.reviewCount && b.reviewCount > 0 && (
                          <Chip
                            label={`${b.avgRating.toFixed(1)}★ (${b.reviewCount})`}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
}
