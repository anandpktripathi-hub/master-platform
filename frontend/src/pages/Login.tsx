import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Link } from "@mui/material";

interface LoginError {
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/app/dashboard', { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate("/app/dashboard");
    } catch (err: any) {
      // Try to extract backend error details
      let backendMsg = err?.response?.data?.details || err?.response?.data?.message || err?.message;
      if (backendMsg) backendMsg = backendMsg.toLowerCase();
      if (backendMsg?.includes("user not found")) {
        setError("User can't be found. Please check your email.");
      } else if (backendMsg?.includes("incorrect password")) {
        setError("Wrong password. Please try again.");
      } else if (backendMsg?.includes("tenant not found")) {
        setError("Tenant not found. Please contact support or check your account type.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
      console.error("LOGIN ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#0a0a23">
      <Card sx={{ minWidth: 350, p: 2, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom color="primary">Login</Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
              autoFocus
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            
            <Box display="flex" justifyContent="flex-end">
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
