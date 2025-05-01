import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// This instance should be used in components via a custom hook
const authAxiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

// Configure response interceptor similar to standard axios
authAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

// Note: The request interceptor is added by the useAuthAxios hook

export default authAxiosInstance;

// ----------------------------------------------------------------------

export const authFetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await authAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};