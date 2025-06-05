import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

export interface IEarningsParams {
  page?: number;
  limit?: number;
  agentId?: string;
  intakeId?: string;
  universityId?: string;
  studentId?: string;
  status?: 'Pending' | 'Paid' | 'Failed';
  courseId?: string;
}

export const fetchEarnings = async ({
  page = 1,
  limit = 1,
  agentId,
  intakeId,
  universityId,
  studentId,
  status,
  courseId,
}: IEarningsParams) => {
  try {
    const params: Record<string, any> = {};

    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (agentId) params.agentId = agentId;
    if (intakeId) params.intakeId = intakeId;
    if (universityId) params.universityId = universityId;
    if (studentId) params.studentId = studentId;
    if (status) params.status = status;
    if (courseId) params.courseId = courseId;

    const response = await authAxiosInstance.get(endpoints.earnings.root, { params });
    return response.data;
  } catch (err) {
    console.error('Error fetching earnings:', err);
    toast.error('Error fetching earnings!');
    throw err;
  }
};

// Example usage:
// const earnings = await fetchEarnings({
//   page: 1,
//   limit: 10,
//   agentId: '56cvuSccZKSfJk30kjQdkRQsAKk1',
//   intakeId: 'wdmyoqBN5gR7B4PBQa3U',
//   universityId: '8Z7McxnL1Moaln9IRyWX',
//   studentId: 'UIBgMlBctebOS3S7iRUS',
//   status: 'Pending'
// });
