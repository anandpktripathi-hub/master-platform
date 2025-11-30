import React from 'react';
import { CircularProgress, Typography } from '@mui/material';

const Loading = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <CircularProgress />
    <Typography variant="body1" style={{ marginTop: '10px' }}>
      Loading...
    </Typography>
  </div>
);

export default Loading;
