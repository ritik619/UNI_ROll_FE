import type { IUserProfile } from 'src/types/agent';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { toast } from 'sonner';

type AgentResponse = {
  agents: IUserProfile[];
  total: number;
  page: number;
  limit: number;
};

export const fetchUniversities = async (
  status: 'active' | 'inactive' | 'all',
  page: number,
  limit: number,
  cityId: string,
  countryCode: string
) => {
  try {
    const params: Record<string, any> = { page, limit };
    if (status !== 'all') {
      params.status = status;
    }
    if (cityId) {
      params.cityId = cityId;
    }
    if (countryCode) {
      params.countryCode = countryCode;
    }

    const response = await authAxiosInstance.get(endpoints.universities.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching universities:', err);
    toast.error('Error fetching universities!');
    throw err;
  }
};
