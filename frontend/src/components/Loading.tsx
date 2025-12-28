import React from 'react';
import { CircularProgress, Typography } from '@mui/material';

const Loading = () => (
  <div className="text-center p-5">
    <CircularProgress />
    <Typography variant="body1" className="mt-2">
      Loading...
    </Typography>
  </div>
);

export default Loading;
