import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import type { IAgentItem } from 'src/types/agent';

interface AgentsResponse {
  agents: IAgentItem[];
  total: number;
}

export const fetchAgents = async (
  status: 'active' | 'inactive' | 'all',
  page: number = 0,
  limit: number = 1000
): Promise<AgentsResponse> => {
  try {
    const params: Record<string, any> = {
      page: page + 1, // Convert to 1-based indexing for the API
      limit,
    };
    if (status !== 'all') {
      params.status = status;
    }

    const response = await authAxiosInstance.get<AgentsResponse>(endpoints.agents.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching agents:', err);
    toast.error('Error fetching agents!');
    throw err;
  }
};
