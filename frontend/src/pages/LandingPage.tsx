import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Alert,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Login as LoginIcon, PersonAdd as SignUpIcon } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const contactEndpoint = useMemo(() => {
    const base = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
    if (base && typeof base === 'string' && base.trim().length > 0) {
      return `${base.replace(/\/$/, '')}/public/forms/contact`;
    }
    return '/api/v1/public/forms/contact';
  }, []);

  const isAbsoluteEndpoint = useMemo(() => {
    return /^https?:\/\//i.test(contactEndpoint);
  }, [contactEndpoint]);

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAbsoluteEndpoint ? { 'x-tenant-host': window.location.host } : {}),
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim().length ? phone.trim() : undefined,
          message,
          source: 'website',
        }),
      });

      if (!res.ok) {
        let detail = 'Failed to send message';
        try {
          const data = await res.json();
          detail =
            typeof data?.message === 'string'
              ? data.message
              : Array.isArray(data?.message)
                ? data.message.join(', ')
                : detail;
        } catch {
          // ignore JSON parsing
        }
        throw new Error(detail);
      }

      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubmitSuccess("Thanks — we received your message.");
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to Master Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Multi-Tenant SaaS Platform for Your Business
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SignUpIcon />}
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4,
                py: 1.5,
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5,
              }}
            >
              Log In
            </Button>
            <Button
              variant="text"
              size="large"
              onClick={() => navigate('/directory')}
              sx={{
                color: 'white',
                textDecoration: 'underline',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                px: 4,
                py: 1.5,
              }}
            >
              Browse Business Directory
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🚀 Fast Setup
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get started in minutes with our streamlined onboarding process
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🔒 Secure & Compliant
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enterprise-grade security with complete data isolation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  📈 Scalable
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Grow your business with flexible plans and resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
            Join thousands of businesses using our platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{ px: 6, py: 1.5 }}
          >
            Start Your Free Trial
          </Button>
        </Container>
      </Box>

      {/* Contact Section */}
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom align="center">
          Contact Us
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Send us a message and we’ll get back to you.
        </Typography>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {submitSuccess}
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={submitContact} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            disabled={submitting}
          />
          <TextField
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={submitting}
            multiline
            minRows={4}
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Message'}
          </Button>
        </Box>
      </Container>
      </Box>
    </ErrorBoundary>
  );
}
