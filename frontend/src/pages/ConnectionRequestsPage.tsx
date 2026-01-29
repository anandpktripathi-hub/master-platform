import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Alert, List, ListItem, ListItemText, Button } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { ConnectionRequest, getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../api/social';

export default function ConnectionRequestsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingRequests();
      setRequests(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptConnectionRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectConnectionRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to reject request');
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Connection Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading requests...</Typography>
          ) : requests.length === 0 ? (
            <Typography color="text.secondary">No pending requests.</Typography>
          ) : (
            <List>
              {requests.map((req) => (
                <ListItem key={req._id}>
                  <ListItemText
                    primary={req.requesterId.name}
                    secondary={`${req.requesterId.email} • Sent ${new Date(req.createdAt).toLocaleDateString()}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="success" onClick={() => handleAccept(req._id)}>
                      Accept
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => handleReject(req._id)}>
                      Reject
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
