import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

/**
 * Create a base axios instance that can be used throughout the app
 */
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({ 
    baseURL: baseURL || CONFIG.serverUrl,
  });

  // Add response interceptor to handle errors more gracefully
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
  );

  return instance;
};

// Default axios instance without auth
export const axiosInstance = createAxiosInstance();

// Auth-enabled axios instance
export const authAxiosInstance = createAxiosInstance();

// ----------------------------------------------------------------------

/**
 * Generic data fetcher for axios requests
 */
export const fetcher = async (args: string | [string, AxiosRequestConfig], instance = axiosInstance) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];
    const res = await instance.get(url, { ...config });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

/**
 * Auth-enabled fetcher
 */
export const authFetcher = async (args: string | [string, AxiosRequestConfig]) => fetcher(args, authAxiosInstance);

// ----------------------------------------------------------------------

/**
 * Add authorization token to all requests
 * @param token The access token to add to requests
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    authAxiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete authAxiosInstance.defaults.headers.common.Authorization;
  }
};

// ----------------------------------------------------------------------

/**
 * API endpoints definition
 */
export const endpoints = {
  agents: {
    list: 'agents',
    details: (id: string) => `agents/${id}`,
    profilePhoto: (id: string) => `agents/${id}/profile-photo`,
  },
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },

};

export default axiosInstance;