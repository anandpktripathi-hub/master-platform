import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Button, TextField, CircularProgress, Typography } from '@mui/material';

const Login = () => {
  const { login, loading, error } = useAuthContext();
  const [tenantId, setTenantId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const payload = tenantId.trim() ? { email, password, tenantId } : { email, password };
    login(payload).catch(err => {
      setErrorMsg(err.message || 'Login failed');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Tenant ID"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        margin="normal"
        fullWidth
        required
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Login'}
      </Button>
      {(error || errorMsg) && <Typography color="error">{errorMsg || error}</Typography>}
    </form>
  );
};

export default Login;
