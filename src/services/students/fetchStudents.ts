import { toast } from 'sonner';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

// export const fetchStudents = async (
//   status: 'active' | 'inactive' | 'all',
//   page: number,
//   limit: number
// ) => {
//   try {
//     const params: Record<string, any> = { page, limit };
//     if (status !== 'all') {
//       params.status = status;
//     }

//     const response = await authAxiosInstance.get(endpoints.students.list, { params });
//     return response.data;
//   } catch (err) {
//     console.error('Error fetching students:', err);
//     toast.error('Error fetching students!');
//     throw err;
//   }
// };

import { IStudentsItem } from 'src/types/students';

const USE_MOCK_DATA = true;

export const fetchStudents = async (
  status: 'all' | 'free' | 'interested' | 'enrolled' | 'unenrolled',
  page: number,
  limit: number
): Promise<{ students: IStudentsItem[]; total: number }> => {
  if (USE_MOCK_DATA) {
    await new Promise((res) => setTimeout(res, 300)); // Simulate network delay

    const dummyStudents: IStudentsItem[] = Array.from({ length: limit }, (_, i) => {
      const index = (page - 1) * limit + i + 1;

      return {
        id: `${index}`,
        avatarUrl: null, // or you can use placeholder image URLs like `https://i.pravatar.cc/150?img=${index}`
        firstName: `First${index}`,
        lastName: `Last${index}`,
        dateOfBirth: `199${index % 10}-0${(index % 9) + 1}-15`,
        email: `student${index}@example.com`,
        address: `Flat ${index}, Dummy Street, City ${index}`,
        university: `P${index}C${index + 100}`,
        courses: `UTR${index}`,
        status:
          status === 'all'
            ? index % 4 === 0
              ? 'free'
              : index % 4 === 1
                ? 'interested'
                : index % 4 === 2
                  ? 'enrolled'
                  : 'unenrolled'
            : status,
      };
    });

    return {
      students: dummyStudents,
      total: 100,
    };
  }
  throw new Error('Real API not implemented or USE_MOCK_DATA is false');
};
