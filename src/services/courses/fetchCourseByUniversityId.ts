import axios from 'axios';

import { endpoints, authAxiosInstance } from 'src/lib/axios-unified';

const fetchCoursesByUniversityId = async (universityId: string) => {
  try {
    const response = await authAxiosInstance.get(endpoints.associations.byUniversity(universityId));

    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
};

export default fetchCoursesByUniversityId;
