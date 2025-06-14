import type { IStudentStatus } from 'src/types/students';

import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';
import { StudentsTableFiltersResult } from 'src/sections/students/students-table-filters-result';

export const fetchStudents = async (
 
  status: IStudentStatus,
  page?: number,
  limit?: number,
  universityId?: string,
  courseId?: string,
  agentId?: string,
  intakeId?: string,
  countryCode?: string,
  cityId?: string,
  studentName?:string
) => {
  try {
    const params: Record<string, any> = {};
    if (limit) {
      params.limit = limit;
    }
    if (page) {
      params.page = page + 1;
    }
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
    if (agentId) {
      params.agentId = agentId;
    }
    if (intakeId) {
      params.intakeId = intakeId;
    }
    if (courseId) {
      params.courseId = courseId;
    }
    if (studentName) {
      params.search = studentName;
    }

    const response = await authAxiosInstance.get(endpoints.students.list, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching students:', err);
    toast.error('Error fetching students!');
    throw err;
  }
};
