import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

const Billing = () => {
  // Simulate loading and error states
  const loading = false;
  const error = null;

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Billing</Typography>
      <Typography>Billing data goes here.</Typography>
    </Box>
  );
};

export default Billing;
