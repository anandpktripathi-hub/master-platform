import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('No reset token provided');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setSuccess(true);
      setError(null);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Failed to reset password. Please try again or request a new reset link.';
      setError(message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
              Reset Password
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              No reset token provided. Please request a new password reset link.
            </Alert>
            <Box display="flex" justifyContent="center">
              <Button variant="contained" onClick={() => navigate('/forgot-password')}>
                Request Reset Link
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            Reset Password
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your new password below.
          </Typography>

          {success ? (
            <Box py={2}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Password reset successfully! You can now log in with your new
                password.
              </Alert>
              <Typography align="center" color="text.secondary" fontSize={14}>
                Redirecting to login page...
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                required
                autoFocus
                helperText="Must be at least 8 characters"
              />

              <TextField
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
