import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import api from '../lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/auth/request-password-reset', { email });
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Failed to send reset email. Please try again.';
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
            Forgot Password
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
          </Typography>

          {success ? (
            <Box py={2}>
              <Alert severity="success" sx={{ mb: 2 }}>
                If an account with that email exists, a password reset link has been
                sent. Please check your inbox.
              </Alert>
              <Box display="flex" justifyContent="center">
                <Button variant="contained" onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              </Box>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box display="flex" justifyContent="center" mt={2}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  Back to Login
                </Link>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
