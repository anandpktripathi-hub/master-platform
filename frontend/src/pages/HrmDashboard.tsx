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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useSnackbar } from 'notistack';
import hrmService, { EmployeePayload, AttendancePayload, LeavePayload, JobPayload, TrainingPayload } from '../services/hrmService';

interface Employee extends EmployeePayload {
  _id: string;
  status: 'active' | 'inactive';
}

const HrmDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<{ activeEmployees: number; todayPresent: number; openJobs: number; upcomingTrainings: number } | null>(null);
  const [attendanceOverview, setAttendanceOverview] = useState<{
    totalEmployees: number;
    last30Days: { date: string; present: number; remote: number; onLeave: number; absent: number }[];
  } | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);

  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<EmployeePayload>({ firstName: '', lastName: '', email: '', jobTitle: '', department: '' });

  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState<AttendancePayload>({ employeeId: '', status: 'present' });

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [newLeave, setNewLeave] = useState<LeavePayload>({ employeeId: '', startDate: '', endDate: '', type: '', reason: '' });

  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState<JobPayload>({ title: '', department: '', location: '', description: '' });

  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [newTraining, setNewTraining] = useState<TrainingPayload>({ title: '', description: '', startDate: '', endDate: '', location: '' });

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, employeesData, jobsData, trainingsData, attendanceData] = await Promise.all([
        hrmService.getSummary(),
        hrmService.getEmployees(),
        hrmService.getJobs(),
        hrmService.getTrainings(),
        hrmService.getAttendanceOverview(),
      ]);

      setSummary(summaryData);
      setEmployees(employeesData || []);
      setJobs(jobsData || []);
      setTrainings(trainingsData || []);
      setAttendanceOverview(attendanceData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load HR data';
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

  const handleCreateEmployee = async () => {
    try {
      await hrmService.createEmployee(newEmployee);
      enqueueSnackbar('Employee created successfully', { variant: 'success' });
      setEmployeeDialogOpen(false);
      setNewEmployee({ firstName: '', lastName: '', email: '', jobTitle: '', department: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create employee';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleRecordAttendance = async () => {
    try {
      await hrmService.recordAttendance(newAttendance);
      enqueueSnackbar('Attendance recorded successfully', { variant: 'success' });
      setAttendanceDialogOpen(false);
      setNewAttendance({ employeeId: '', status: 'present' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record attendance';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateLeave = async () => {
    try {
      await hrmService.createLeave(newLeave);
      enqueueSnackbar('Leave request submitted', { variant: 'success' });
      setLeaveDialogOpen(false);
      setNewLeave({ employeeId: '', startDate: '', endDate: '', type: '', reason: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create leave';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateJob = async () => {
    try {
      await hrmService.createJob(newJob);
      enqueueSnackbar('Job posting created', { variant: 'success' });
      setJobDialogOpen(false);
      setNewJob({ title: '', department: '', location: '', description: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job posting';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleCreateTraining = async () => {
    try {
      await hrmService.createTraining(newTraining);
      enqueueSnackbar('Training session created', { variant: 'success' });
      setTrainingDialogOpen(false);
      setNewTraining({ title: '', description: '', startDate: '', endDate: '', location: '' });
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create training session';
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
        {/* Summary cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Active Employees</Typography>
              <Typography variant="h5">{summary?.activeEmployees ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Present Today</Typography>
              <Typography variant="h5">{summary?.todayPresent ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Open Jobs</Typography>
              <Typography variant="h5">{summary?.openJobs ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card><CardContent>
              <Typography variant="subtitle2" color="textSecondary">Upcoming Trainings</Typography>
              <Typography variant="h5">{summary?.upcomingTrainings ?? 0}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Attendance overview chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Attendance Overview (last 30 days)
            </Typography>
            {!attendanceOverview || attendanceOverview.last30Days.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Not enough attendance data to display an overview yet.
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={attendanceOverview.last30Days}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="present"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                      name="Present"
                    />
                    <Area
                      type="monotone"
                      dataKey="remote"
                      stackId="1"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.4}
                      name="Remote"
                    />
                    <Area
                      type="monotone"
                      dataKey="onLeave"
                      stackId="1"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.4}
                      name="On leave"
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.4}
                      name="Absent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Employee directory */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Employees</Typography>
                  <Button size="small" variant="contained" onClick={() => setEmployeeDialogOpen(true)}>New Employee</Button>
                </Box>
                {employees.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No employees yet.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {employees.slice(0, 10).map((emp) => (
                      <li key={emp._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{emp.firstName} {emp.lastName}</Typography>
                          <Typography variant="caption" color="textSecondary">{emp.jobTitle || '—'}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Attendance quick actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Attendance</Typography>
                  <Button size="small" variant="contained" onClick={() => setAttendanceDialogOpen(true)}>Record Attendance</Button>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Use this to mark presence, remote work or leave for today.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Jobs and trainings */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Open Jobs</Typography>
                  <Button size="small" variant="contained" onClick={() => setJobDialogOpen(true)}>Post Job</Button>
                </Box>
                {jobs.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No open job postings.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {jobs.slice(0, 10).map((job: any) => (
                      <li key={job._id}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2">{job.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{job.department}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Upcoming Trainings</Typography>
                  <Button size="small" variant="contained" onClick={() => setTrainingDialogOpen(true)}>Schedule Training</Button>
                </Box>
                {trainings.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">No upcoming trainings.</Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {trainings.slice(0, 10).map((tr: any) => (
                      <li key={tr._id}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2">{tr.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{new Date(tr.startDate).toLocaleDateString()}</Typography>
                        </Box>
                      </li>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            HRM
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage employees, attendance, leaves, jobs and trainings.
          </Typography>
        </Box>
        {content}

        {/* New Employee */}
        <Dialog open={employeeDialogOpen} onClose={() => setEmployeeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Employee</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="First Name" value={newEmployee.firstName} onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })} fullWidth />
              <TextField label="Last Name" value={newEmployee.lastName} onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })} fullWidth />
              <TextField label="Email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} fullWidth />
              <TextField label="Job Title" value={newEmployee.jobTitle} onChange={(e) => setNewEmployee({ ...newEmployee, jobTitle: e.target.value })} fullWidth />
              <TextField label="Department" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmployeeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateEmployee} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Record Attendance */}
        <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField select label="Employee" value={newAttendance.employeeId} onChange={(e) => setNewAttendance({ ...newAttendance, employeeId: e.target.value })} fullWidth>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Status" value={newAttendance.status} onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value as AttendancePayload['status'] })} fullWidth>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="remote">Remote</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordAttendance} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* New Leave */}
        <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField select label="Employee" value={newLeave.employeeId} onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })} fullWidth>
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField label="Start Date" type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" value={newLeave.endDate} onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Type" value={newLeave.type} onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })} fullWidth />
              <TextField label="Reason" value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} fullWidth multiline minRows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateLeave} variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>

        {/* New Job */}
        <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Job Posting</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Title" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} fullWidth />
              <TextField label="Department" value={newJob.department} onChange={(e) => setNewJob({ ...newJob, department: e.target.value })} fullWidth />
              <TextField label="Location" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} fullWidth />
              <TextField label="Description" value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} fullWidth multiline minRows={2} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJob} variant="contained">Post</Button>
          </DialogActions>
        </Dialog>

        {/* New Training */}
        <Dialog open={trainingDialogOpen} onClose={() => setTrainingDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Training Session</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Title" value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} fullWidth />
              <TextField label="Description" value={newTraining.description} onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })} fullWidth multiline minRows={2} />
              <TextField label="Start Date" type="date" value={newTraining.startDate} onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" value={newTraining.endDate} onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Location" value={newTraining.location} onChange={(e) => setNewTraining({ ...newTraining, location: e.target.value })} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTraining} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default HrmDashboard;
