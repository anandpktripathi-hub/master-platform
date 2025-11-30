import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Button, TextField, CircularProgress, Typography } from '@mui/material';

const Login = () => {
  const { login, loading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
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
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Login'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </form>
  );
};

export default Login;
