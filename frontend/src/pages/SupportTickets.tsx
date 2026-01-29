import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert, Chip } from '@mui/material';
import { createTicket, getMyTickets, Ticket } from '../api/support';
import { useSampleDataStatus } from '../hooks/useSampleDataStatus';
import { aiApi } from '../lib/api';
import { useApiErrorToast } from '../providers/QueryProvider';

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { status: sampleStatus } = useSampleDataStatus();
  const [sentimentByTicket, setSentimentByTicket] = useState<Record<string, { sentiment: string; confidence: number }>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyTickets();
        setTickets(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tickets');
        showErrorToast(e);
      }
    };
    load();
  }, []);

  const handleCreateTicket = async () => {
    setError(null);
    setSuccess(null);
    if (!subject || !message) {
      setError('Please fill in both subject and message.');
      return;
    }
    try {
      const created = await createTicket(subject, message);
      setTickets([created, ...tickets]);
      setSuccess('Support ticket created successfully!');
      showSuccessToast('Support ticket created successfully.');
      setShowModal(false);
      setSubject('');
      setMessage('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create ticket');
      showErrorToast(e);
    }
  };

  const handleAnalyzeSentiment = async (ticket: Ticket) => {
    setAnalyzingId(ticket._id);
    try {
      const res = await aiApi.analyzeSentiment(ticket.message);
      setSentimentByTicket((prev) => ({ ...prev, [ticket._id]: res }));
      showSuccessToast(
        `Sentiment for this ticket: ${res.sentiment} (${Math.round(res.confidence * 100)}%)`,
      );
    } catch (e: any) {
      showErrorToast(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Support Tickets</Typography>
        <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
          + New Ticket
        </Button>
      </Stack>
      {sampleStatus?.supportSample && (
        <Alert severity="info" sx={{ mb: 2 }}>
          A sample support ticket is present to demonstrate how support works. You can safely close or delete it.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box>
        {tickets.length === 0 ? (
          <Typography>No support tickets found.</Typography>
        ) : (
          tickets.map(ticket => (
            <Box key={ticket._id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant="h6">{ticket.subject}</Typography>
              <Typography variant="body2" color="textSecondary">{ticket.message}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={ticket.status}
                  color={ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'default'}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={ticket.priority}
                  color={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'default'}
                  variant="outlined"
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void handleAnalyzeSentiment(ticket)}
                  disabled={analyzingId === ticket._id}
                >
                  {analyzingId === ticket._id ? 'Analyzing…' : 'Analyze sentiment'}
                </Button>
              </Stack>
              {sentimentByTicket[ticket._id] && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  AI sentiment: {sentimentByTicket[ticket._id].sentiment} (
                  {Math.round(sentimentByTicket[ticket._id].confidence * 100)}%)
                </Typography>
              )}
            </Box>
          ))
        )}
      </Box>
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Support Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              multiline
              rows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreateTicket} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
