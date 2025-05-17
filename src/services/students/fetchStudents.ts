import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export const fetchStudents = async (
  status: 'active' | 'inactive' | 'all',
  page: number,
  limit: number
) => {
  try {
    const params: Record<string, any> = { page, limit };
    if (status !== 'all') {
      params.status = status;
    }

    const response = await authAxiosInstance.get(endpoints.students.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching students:', err);
    toast.error('Error fetching students!');
    throw err;
  }
};
