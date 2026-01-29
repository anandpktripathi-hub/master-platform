import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, Checkbox, Select, MenuItem } from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { CrmTask, CrmDeal, getMyTasks, getDeals, createTask, setTaskCompleted } from '../api/crm';

export default function CrmMyTasksPage() {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [form, setForm] = useState({ title: '', dueDate: '', dealId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tasksData, dealsData] = await Promise.all([
          getMyTasks(),
          getDeals(),
        ]);
        setTasks(tasksData);
        setDeals(dealsData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFormChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | { target: { value: string } }>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleCreateTask = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask({
        title: form.title,
        dueDate: form.dueDate || undefined,
        dealId: form.dealId || undefined,
      } as any);
      setTasks((prev) => [created, ...prev]);
      setForm({ title: '', dueDate: '', dealId: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCompleted = async (task: CrmTask) => {
    try {
      const updated = await setTaskCompleted(task._id, !task.completed);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update task');
    }
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My CRM Tasks
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Task
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={handleFormChange('title')}
              size="small"
            />
            <TextField
              label="Due date"
              type="date"
              value={form.dueDate}
              onChange={handleFormChange('dueDate')}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Select
              size="small"
              displayEmpty
              value={form.dealId}
              onChange={handleFormChange('dealId')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">No deal</MenuItem>
              {deals.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.title}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              onClick={handleCreateTask}
              disabled={submitting || !form.title}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Typography>Loading tasks...</Typography>
          ) : tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks assigned.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Done</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Deal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={t.completed}
                        onChange={() => handleToggleCompleted(t)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{t.dealTitle || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </ErrorBoundary>
  );
}
