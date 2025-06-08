import type {} from 'src/types/agent';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchUniversitiesByCourseId = async (
  courseId: string,
  status: 'active' | 'inactive' | 'all',
  page?: number,
  limit?: number,
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
    if (page) {
      params.countryCode = countryCode;
    }
    if (limit) {
      params.countryCode = countryCode;
    }

    const response = await authAxiosInstance.get(endpoints.associations.byCourses(courseId), {
      params,
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching universities:', err);
    toast.error('Error fetching universities!');
    throw err;
  }
};
