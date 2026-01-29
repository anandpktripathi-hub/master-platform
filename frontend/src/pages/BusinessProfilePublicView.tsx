import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Chip, Container, Paper, Stack, Typography, Link as MuiLink, Rating, TextField, Button, Alert } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { getPublicBusinessBySlug, PublicBusinessDetail, getBusinessReviews, addBusinessReview, BusinessReview } from '../api/tenants-public';

export default function BusinessProfilePublicView() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<PublicBusinessDetail | null>(null);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicBusinessBySlug(slug);
        setBusiness(res);
        const rev = await getBusinessReviews(slug);
        setReviews(rev);
      } catch (e: any) {
        setError(e?.message || 'Business not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleSubmitReview = async () => {
    if (!slug || !rating) return;
    setSubmitting(true);
    setReviewError(null);
    try {
      await addBusinessReview(slug, rating, comment || undefined);
      const rev = await getBusinessReviews(slug);
      setReviews(rev);
      setComment('');
    } catch (e: any) {
      setReviewError(e?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading business...</Typography>
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Business not found'}</Typography>
      </Container>
    );
  }

  const displayName = business.publicName || business.name;
  const isSampleListing = (business.tags || []).includes('sample-data');

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h3" gutterBottom>
            {displayName}
          </Typography>
          {isSampleListing && (
            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
              This is a sample business listing created for demonstration. Actual customer listings will appear in the same layout.
            </Alert>
          )}
          {business.tagline && (
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {business.tagline}
            </Typography>
          )}

          {(typeof business.avgRating === 'number' && business.reviewCount && business.reviewCount > 0) && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Rating value={business.avgRating} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {business.avgRating.toFixed(1)} / 5.0 ({business.reviewCount} reviews)
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: 'wrap' }}>
            {business.city && business.country && (
              <Chip label={`${business.city}, ${business.country}`} size="small" />
            )}
            {(business.categories || []).map((c) => (
              <Chip key={c} label={c} size="small" />
            ))}
          </Stack>

          {business.websiteUrl && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              Website:{' '}
              <MuiLink href={business.websiteUrl} target="_blank" rel="noopener noreferrer">
                {business.websiteUrl}
              </MuiLink>
            </Typography>
          )}

          {business.fullDescription && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">About</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {business.fullDescription}
              </Typography>
            </Box>
          )}

          {(business.tags || []).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Tags</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {business.tags!.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ mb: 1 }} />
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            {reviewError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {reviewError}
              </Alert>
            )}

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
              />
              <TextField
                placeholder="Share your experience"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                disabled={submitting || !rating}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Stack>

            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {reviews.map((r) => (
                  <Box key={r._id} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Rating value={r.rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    {r.comment && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {r.comment}
                      </Typography>
                    )}
                    {r.ownerReply && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Owner reply: {r.ownerReply}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
