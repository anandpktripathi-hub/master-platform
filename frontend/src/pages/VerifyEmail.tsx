import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) {
      setError('No verification token provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
        token,
      });
      setSuccess(true);
      setError(null);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to verify email. Please try again.';
      setError(message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#0a0a23"
    >
      <Card sx={{ minWidth: 400, p: 2, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary">
            Email Verification
          </Typography>

          {loading && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
              <CircularProgress />
              <Typography>Verifying your email...</Typography>
            </Box>
          )}

          {success && (
            <Box py={2}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Email verified successfully! You can now log in.
              </Alert>
              <Typography align="center" color="text.secondary" fontSize={14}>
                Redirecting to login page...
              </Typography>
            </Box>
          )}

          {error && (
            <Box py={2}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Box display="flex" gap={2} justifyContent="center">
                <Button variant="contained" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
                <Button variant="outlined" onClick={() => navigate('/register')}>
                  Register Again
                </Button>
              </Box>
            </Box>
          )}

          {!token && !loading && !error && (
            <Box py={2}>
              <Alert severity="warning">
                No verification token provided. Please check your email for the verification link.
              </Alert>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="contained" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
