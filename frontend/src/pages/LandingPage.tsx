import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Login as LoginIcon, PersonAdd as SignUpIcon } from '@mui/icons-material';

export default function LandingPage() {
  const navigate = useNavigate();

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
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
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
      </Box>
    </ErrorBoundary>
  );
}
