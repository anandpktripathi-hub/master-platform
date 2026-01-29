import React, { useEffect, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import projectsService, { ProjectPayload, TaskPayload, LogTimePayload } from '../services/projectsService';

interface Project extends ProjectPayload {
  _id: string;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

interface Task extends TaskPayload {
  _id: string;
  status: 'todo' | 'in_progress' | 'done';
}

interface TimesheetEntry {
  _id: string;
  taskId: string;
  projectId: string;
  userId: string;
  date: string;
  hours: number;
}

const ProjectsDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<{ activeProjects: number; overdueTasks: number; hoursLogged: number } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | ''>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<ProjectPayload>({ name: '', description: '', status: 'planned' });

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<TaskPayload>({ title: '', description: '', status: 'todo' });

  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [newTime, setNewTime] = useState<LogTimePayload>({ projectId: '', taskId: '', hours: 0 });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, projectsData, timesheetsData] = await Promise.all([
        projectsService.getSummary(),
        projectsService.getProjects(),
        projectsService.getTimesheets(),
      ]);

      setSummary(summaryData);
      setProjects(projectsData || []);
      setTimesheets(timesheetsData || []);

      if (projectsData && projectsData.length > 0) {
        const firstId = projectsData[0]._id as string;
        setSelectedProjectId(firstId);
        const tasksData = await projectsService.getTasks(firstId);
        setTasks(tasksData || []);
      } else {
        setSelectedProjectId('');
        setTasks([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects data';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    if (!projectId) {
      setTasks([]);
      return;
    }
    try {
      const data = await projectsService.getTasks(projectId);
      setTasks(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateProject = async () => {
    try {
      await projectsService.createProject(newProject);
      enqueueSnackbar('Project created successfully', { variant: 'success' });
      setProjectDialogOpen(false);
      setNewProject({ name: '', description: '', status: 'planned' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateTask = async () => {
    if (!selectedProjectId) {
      enqueueSnackbar('Select a project first', { variant: 'warning' });
      return;
    }
    try {
      await projectsService.createTask(selectedProjectId, newTask);
      enqueueSnackbar('Task created successfully', { variant: 'success' });
      setTaskDialogOpen(false);
      setNewTask({ title: '', description: '', status: 'todo' });
      handleProjectChange(selectedProjectId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleLogTime = async () => {
    if (!selectedProjectId || !newTime.taskId) {
      enqueueSnackbar('Select project and task first', { variant: 'warning' });
      return;
    }
    try {
      await projectsService.logTime({ ...newTime, projectId: selectedProjectId });
      enqueueSnackbar('Time logged successfully', { variant: 'success' });
      setTimeDialogOpen(false);
      setNewTime({ projectId: selectedProjectId, taskId: '', hours: 0 });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log time';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  let content;
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = <Alert severity="error">{error}</Alert>;
  } else {
    content = (
      <>
        {/* Summary KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Active Projects</Typography>
              <Typography variant="h5">{summary?.activeProjects ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Open / Overdue Tasks</Typography>
              <Typography variant="h5">{summary?.overdueTasks ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Hours Logged</Typography>
              <Typography variant="h5">{summary?.hoursLogged ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Projects and tasks */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Projects</Typography>
                  <Button size="small" variant="contained" onClick={() => setProjectDialogOpen(true)}>New Project</Button>
                </Box>
                {projects.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No projects yet.</Typography>
                ) : (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Selected Project"
                      margin="dense"
                      value={selectedProjectId}
                      onChange={(e) => handleProjectChange(e.target.value)}
                    >
                      {projects.map((p) => (
                        <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                      ))}
                    </TextField>
                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
                      {projects.slice(0, 10).map((project) => (
                        <li key={project._id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2">{project.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{project.status}</Typography>
                          </Box>
                        </li>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Tasks</Typography>
                  <Button size="small" variant="contained" onClick={() => setTaskDialogOpen(true)}>New Task</Button>
                </Box>
                {tasks.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No tasks for this project.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {tasks.slice(0, 10).map((task) => (
                      <li key={task._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{task.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{task.status}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Timesheets */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Time Entries</Typography>
              <Button size="small" variant="contained" onClick={() => setTimeDialogOpen(true)}>Log Time</Button>
            </Box>
            {timesheets.length === 0 ? (
              <Typography variant="body2" color="textSecondary">No time entries yet.</Typography>
            ) : (
              <Grid container spacing={1}>
                {timesheets.slice(0, 10).map((t) => (
                  <Grid item xs={12} md={6} key={t._id}>
                    <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                      <Typography variant="subtitle2">{new Date(t.date).toLocaleDateString()}</Typography>
                      <Typography variant="body2" color="textSecondary">Hours: {t.hours}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Projects
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track projects, tasks and billable hours.
          </Typography>
        </Box>
        {content}

        {/* New Project Dialog */}
        <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Project</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                select
                label="Status"
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value as ProjectPayload['status'] })}
                fullWidth
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* New Task Dialog */}
        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Task</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                select
                label="Status"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskPayload['status'] })}
                fullWidth
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Log Time Dialog */}
        <Dialog open={timeDialogOpen} onClose={() => setTimeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Log Time</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                select
                label="Project"
                value={selectedProjectId}
                onChange={(e) => {
                  const projectId = e.target.value;
                  setSelectedProjectId(projectId);
                  handleProjectChange(projectId);
                  setNewTime((prev) => ({ ...prev, projectId }));
                }}
                fullWidth
              >
                {projects.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Task"
                value={newTime.taskId}
                onChange={(e) => setNewTime({ ...newTime, taskId: e.target.value })}
                fullWidth
              >
                {tasks.map((t) => (
                  <MenuItem key={t._id} value={t._id}>{t.title}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Hours"
                type="number"
                value={newTime.hours}
                onChange={(e) => setNewTime({ ...newTime, hours: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Date"
                type="date"
                value={newTime.date || ''}
                onChange={(e) => setNewTime({ ...newTime, date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLogTime} variant="contained">Log</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default ProjectsDashboard;
