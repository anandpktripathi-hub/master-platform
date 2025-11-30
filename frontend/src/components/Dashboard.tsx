import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

const Dashboard = () => {
  // Simulate loading and error states
  const loading = false;
  const error = null;

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Dashboard</Typography>
      <Typography>Widgets and data go here.</Typography>
    </Box>
  );
};

export default Dashboard;
