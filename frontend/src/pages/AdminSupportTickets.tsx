import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorBoundary from '../components/ErrorBoundary';
import { getAllTickets, updateTicketStatus, Ticket, TicketStatus } from '../api/support';

function statusColor(status: TicketStatus): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'resolved':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'closed':
      return 'default';
    default:
      return 'error';
  }
}

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllTickets();
        setTickets(res.data ?? res as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    try {
      const res = await updateTicketStatus(id, newStatus);
      const updated = (res.data ?? res) as Ticket;
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status: updated.status } : t)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update status');
    }
  };

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${t.subject} ${t.message} ${t.userId ?? ''} ${t.tenantId ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tickets, search, statusFilter]);

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Support Tickets (Admin)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View and manage all support tickets across tenants.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="Search subject, message, user or tenant"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="status-filter">Status</InputLabel>
                <Select
                  labelId="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={(e: SelectChangeEvent<'all' | TicketStatus>) =>
                    setStatusFilter(e.target.value as 'all' | TicketStatus)
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loading ? (
              <Typography>Loading tickets...</Typography>
            ) : filteredTickets.length === 0 ? (
              <Typography color="text.secondary">No tickets found.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map((t) => {
                    const isExpanded = expandedId === t._id;
                    const preview = t.message.length > 80 ? `${t.message.slice(0, 80)}…` : t.message;
                    return (
                      <React.Fragment key={t._id}>
                        <TableRow hover>
                          <TableCell>
                            {new Date(t.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{t.subject}</TableCell>
                          <TableCell>{t.userId || '—'}</TableCell>
                          <TableCell>{t.tenantId || '—'}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={t.status}
                                color={statusColor(t.status)}
                              />
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel id={`status-${t._id}`}>Change</InputLabel>
                                <Select
                                  labelId={`status-${t._id}`}
                                  value={t.status}
                                  label="Change"
                                  onChange={(e: SelectChangeEvent) =>
                                    handleStatusChange(t._id, e.target.value as TicketStatus)
                                  }
                                >
                                  <MenuItem value="open">open</MenuItem>
                                  <MenuItem value="in_progress">in_progress</MenuItem>
                                  <MenuItem value="resolved">resolved</MenuItem>
                                  <MenuItem value="closed">closed</MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={t.priority}
                              color={t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>
                                {preview}
                              </Typography>
                              {t.message.length > 80 && (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setExpandedId((prev) => (prev === t._id ? null : t._id))
                                  }
                                >
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                        {t.message.length > 80 && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 0 }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Full message
                                  </Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {t.message}
                                  </Typography>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
