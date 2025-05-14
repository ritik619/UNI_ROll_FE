import type {} from 'src/types/agent';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchCourses = async (
  status: 'active' | 'inactive' | 'all',
  page?: number,
  limit?: number,
  universityId?: string,
  cityId?: string,
  countryCode?: string
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
    if (universityId) {
      params.universityId = universityId;
    }
    if (page) {
      params.page = page;
    }
    if (limit) {
      params.limit = limit;
    }

    const response = await authAxiosInstance.get(endpoints.courses.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching universities:', err);
    toast.error('Error fetching universities!');
    throw err;
  }
};
