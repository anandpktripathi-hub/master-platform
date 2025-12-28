import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'You can add a new item to get started.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 480 }}>
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default EmptyState;
