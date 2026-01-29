import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Alert, List, ListItem, ListItemText, Chip } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { Connection, getMyConnections } from '../api/social';

export default function MyConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyConnections();
        setConnections(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <ErrorBoundary>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Connections
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading connections...</Typography>
          ) : connections.length === 0 ? (
            <Typography color="text.secondary">No connections yet. Send connection requests to grow your network!</Typography>
          ) : (
            <List>
              {connections.map((conn) => (
                <ListItem key={conn._id}>
                  <ListItemText
                    primary={conn.connectedUser.name}
                    secondary={conn.connectedUser.email}
                  />
                  {conn.acceptedAt && (
                    <Chip
                      label={`Connected ${new Date(conn.acceptedAt).toLocaleDateString()}`}
                      size="small"
                      color="success"
                    />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
