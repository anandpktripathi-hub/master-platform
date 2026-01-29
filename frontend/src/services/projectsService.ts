import api from "../lib/api";

export interface ProjectPayload {
  name: string;
  description?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assigneeId?: string;
}

export interface LogTimePayload {
  taskId: string;
  projectId: string;
  hours: number;
  date?: string;
}

const projectsService = {
  async getSummary() {
    return api.get("/projects/summary") as Promise<{ activeProjects: number; overdueTasks: number; hoursLogged: number }>;
  },

  async getProjects() {
    return api.get("/projects");
  },

  async createProject(payload: ProjectPayload) {
    return api.post("/projects", payload);
  },

  async updateProject(id: string, payload: Partial<ProjectPayload>) {
    return api.patch("/projects/" + id, payload);
  },

  async getTasks(projectId: string) {
    return api.get(`/projects/${projectId}/tasks`);
  },

  async createTask(projectId: string, payload: TaskPayload) {
    return api.post(`/projects/${projectId}/tasks`, payload);
  },

  async updateTask(id: string, payload: Partial<TaskPayload>) {
    return api.patch("/projects/tasks/" + id, payload);
  },

  async getTimesheets(projectId?: string) {
    const params = projectId ? { projectId } : undefined;
    return api.get("/projects/timesheets", { params });
  },

  async logTime(payload: LogTimePayload) {
    return api.post("/projects/timesheets/log", payload);
  },
};

export default projectsService;
