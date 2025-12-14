import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

/**
 * 403 Not Authorized page.
 * Shown when user lacks permissions or roles for a protected resource.
 */
export default function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <LockIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          403 - Not Authorized
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 400 }}>
          You do not have permission to access this resource. If you believe this is a mistake,
          please contact your administrator.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 1 }}
        >
          Go to Dashboard
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Container>
  );
}
