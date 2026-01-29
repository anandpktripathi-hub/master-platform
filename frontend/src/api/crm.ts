import api from './client';

export type DealStage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';

export interface CrmContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  source?: string;
}

export interface CrmDeal {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
   contactId?: string;
   contactName?: string;
   companyId?: string;
   companyName?: string;
  source?: string;
}

export interface CrmTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
   dealId?: string;
   dealTitle?: string;
}

export interface CrmCompany {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
}

export async function getContacts() {
  const res = await api.get<CrmContact[]>('/crm/contacts');
  return res.data;
}

export async function createContact(payload: { name: string; email: string; phone?: string; companyName?: string; source?: string }) {
  const res = await api.post<CrmContact>('/crm/contacts', payload);
  return res.data;
}

export async function getCompanies() {
  const res = await api.get<CrmCompany[]>('/crm/companies');
  return res.data;
}

export async function createCompany(payload: { name: string; website?: string; industry?: string }) {
  const res = await api.post<CrmCompany>('/crm/companies', payload);
  return res.data;
}

export async function getDeals() {
  const res = await api.get<CrmDeal[]>('/crm/deals');
  return res.data;
}

export async function createDeal(payload: { title: string; value?: number; source?: string }) {
  const res = await api.post<CrmDeal>('/crm/deals', payload);
  return res.data;
}

export async function updateDealStage(id: string, stage: DealStage) {
  const res = await api.patch<CrmDeal>(`/crm/deals/${id}/stage`, { stage });
  return res.data;
}

export async function getMyTasks() {
  const res = await api.get<CrmTask[]>('/crm/tasks/my');
  return res.data;
}

export async function createTask(payload: { title: string; description?: string; assigneeId: string; dueDate?: string; dealId?: string }) {
  const res = await api.post<CrmTask>('/crm/tasks', payload);
  return res.data;
}

export async function setTaskCompleted(id: string, completed: boolean) {
  const res = await api.patch<CrmTask>(`/crm/tasks/${id}/completed`, { completed });
  return res.data;
}
