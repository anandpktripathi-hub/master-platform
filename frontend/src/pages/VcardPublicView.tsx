import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Box, Container, Paper, Stack, Typography, Link as MuiLink } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import vcardService from '../services/vcardService';

export default function VcardPublicView() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vcard, setVcard] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await vcardService.getPublic(id);
        setVcard(data);
      } catch (e: any) {
        setError(e?.message || 'vCard not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>Loading vCard...</Typography>
      </Container>
    );
  }

  if (error || !vcard) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography color="error">{error || 'vCard not found'}</Typography>
      </Container>
    );
  }

  const initials = vcard.displayName?.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ErrorBoundary>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ width: 80, height: 80 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h4">{vcard.displayName}</Typography>
              {vcard.jobTitle && (
                <Typography variant="subtitle1" color="text.secondary">
                  {vcard.jobTitle}{vcard.companyName ? ` at ${vcard.companyName}` : ''}
                </Typography>
              )}
              {vcard.city && vcard.country && (
                <Typography variant="body2" color="text.secondary">
                  {vcard.city}, {vcard.country}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ mt: 3 }}>
            {vcard.primaryEmail && (
              <Typography variant="body1">Email: <MuiLink href={`mailto:${vcard.primaryEmail}`}>{vcard.primaryEmail}</MuiLink></Typography>
            )}
            {vcard.primaryPhone && (
              <Typography variant="body1" sx={{ mt: 0.5 }}>Phone: {vcard.primaryPhone}</Typography>
            )}
            {vcard.websiteUrl && (
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                Website: <MuiLink href={vcard.websiteUrl} target="_blank" rel="noopener noreferrer">{vcard.websiteUrl}</MuiLink>
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
