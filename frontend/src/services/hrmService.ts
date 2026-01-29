import api from "../lib/api";

export interface EmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

export interface AttendancePayload {
  employeeId: string;
  status: 'present' | 'absent' | 'remote' | 'on_leave';
  date?: string;
}

export interface LeavePayload {
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
}

export interface JobPayload {
  title: string;
  department: string;
  location?: string;
  description?: string;
}

export interface TrainingPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
}

const hrmService = {
  async getSummary() {
    return api.get("/hrm/summary") as Promise<{ activeEmployees: number; todayPresent: number; openJobs: number; upcomingTrainings: number }>;
  },

  async getEmployees() {
    return api.get("/hrm/employees");
  },

  async createEmployee(payload: EmployeePayload) {
    return api.post("/hrm/employees", payload);
  },

  async getAttendance() {
    return api.get("/hrm/attendance");
  },

  async getAttendanceOverview() {
    return api.get("/hrm/attendance/overview") as Promise<{
      totalEmployees: number;
      last30Days: { date: string; present: number; remote: number; onLeave: number; absent: number }[];
    }>;
  },

  async recordAttendance(payload: AttendancePayload) {
    return api.post("/hrm/attendance", payload);
  },

  async getLeaves() {
    return api.get("/hrm/leaves");
  },

  async createLeave(payload: LeavePayload) {
    return api.post("/hrm/leaves", payload);
  },

  async updateLeaveStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    return api.patch("/hrm/leaves/" + id + "/status", { status });
  },

  async getJobs() {
    return api.get("/hrm/jobs");
  },

  async createJob(payload: JobPayload) {
    return api.post("/hrm/jobs", payload);
  },

  async getTrainings() {
    return api.get("/hrm/trainings");
  },

  async createTraining(payload: TrainingPayload) {
    return api.post("/hrm/trainings", payload);
  },
};

export default hrmService;
