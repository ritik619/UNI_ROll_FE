import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { IStudentStatus, IUpdateStudentStatus } from 'src/types/students';

export const fetchStudents = async (
  status: IStudentStatus,
  page: number,
  limit: number,
  universityId?: string,
  courseId?: string,
  countryCode?: string,
  cityId?: string
) => {
  try {
    const params: Record<string, any> = {
      page,
      limit,
    };
    if (status !== 'All') {
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
    if (courseId) {
      params.courseId = courseId;
    }

    const response = await authAxiosInstance.get(endpoints.students.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching students:', err);
    toast.error('Error fetching students!');
    throw err;
  }
};
