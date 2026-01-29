import api from './client';
import { DealStage } from './crm';

export interface PipelineStageStats {
  stage: DealStage;
  count: number;
  totalValue: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  completionRate: string;
}

export interface CrmAnalytics {
  pipelineByStage: PipelineStageStats[];
  revenueForecast: number;
  taskStats: TaskStats;
}

export async function getCrmAnalytics() {
  const res = await api.get<CrmAnalytics>('/crm/analytics');
  return res.data;
}
