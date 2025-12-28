import React from 'react';
import { Box, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';

interface LoadingStateProps {
  label?: string;
  variant?: 'spinner' | 'table' | 'card';
  fullHeight?: boolean;
  rows?: number;
}

export function LoadingState({
  label = 'Loading... please wait',
  variant = 'spinner',
  fullHeight = false,
  rows = 5,
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <Stack spacing={1.5} sx={{ p: 2 }}>
        {Array.from({ length: rows }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" height={48} />
        ))}
      </Stack>
    );
  }

  if (variant === 'card') {
    return (
      <Stack spacing={1} sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={24} />
        <Skeleton variant="rectangular" height={120} />
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        minHeight: fullHeight ? '60vh' : undefined,
        gap: 1,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
    </Box>
  );
}

export default LoadingState;
