import type {} from 'src/types/agent';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchCourses = async (
  status: 'active' | 'inactive' | 'all',
  page: number = 0,
  limit: number = 5,
  universityId?: string,
  cityId?: string,
  countryCode?: string
) => {
  try {
    const params: Record<string, any> = {
      page: page + 1, // Convert to 1-based indexing for the API
      limit,
    };
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
    // Remove redundant page and limit assignments
    const response = await authAxiosInstance.get(endpoints.courses.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching courses:', err);
    toast.error('Error fetching courses!');
    throw err;
  }
};
