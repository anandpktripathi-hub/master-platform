import React from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullHeight?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again or contact support.',
  onRetry,
  fullHeight = false,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '50vh' : undefined,
        py: 2,
      }}
    >
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
        sx={{ width: '100%', maxWidth: 640 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="body2" color="textSecondary">
            {message}
          </Typography>
        </Stack>
      </Alert>
    </Box>
  );
}

export default ErrorState;
