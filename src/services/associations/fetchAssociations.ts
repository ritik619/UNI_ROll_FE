import type {} from 'src/types/agent';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchAssociations = async (
  status: 'active' | 'inactive' | 'all',
  courseId?: string,
  universityId?: string,
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
    if (universityId) {
      params.universityId = universityId;
    }
    if (courseId) {
      params.courseId = courseId;
    }

    const response = await authAxiosInstance.get(endpoints.associations.root, {
      params,
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching universities:', err);
    toast.error('Error fetching universities!');
    throw err;
  }
};
