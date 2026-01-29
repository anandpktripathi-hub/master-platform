import api from "../lib/api";

export interface WorkspaceDto {
  id: string;
  name: string;
  slug?: string;
  planKey?: string;
  status?: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

const workspaceService = {
  async list(): Promise<WorkspaceDto[]> {
    return api.get("/workspaces");
  },

  async switch(workspaceId: string): Promise<{ success: boolean; workspaceId: string; workspace: WorkspaceDto }> {
    return api.post("/workspaces/switch", { workspaceId });
  },
};

export default workspaceService;
