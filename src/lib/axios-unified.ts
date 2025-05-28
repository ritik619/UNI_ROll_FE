import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

import axios from 'axios';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// For redirecting to login page on token expiration
let logoutHandler: () => void;

/**
 * Set a handler function to be called when token expires
 */
export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

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
    (error) => {
      // Check if this is an auth error (401 Unauthorized)
      if (
        error.response &&
        error.response.status === 401 &&
        error.config &&
        !error.config.__isRetryRequest
      ) {
        console.warn('Token expired or invalid. Redirecting to login...');

        // If we have a logout handler, call it
        if (logoutHandler) {
          logoutHandler();
        } else {
          // Fallback: attempt to redirect to sign-in page
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('unauthorizedRedirect', 'true');
              window.location.href = '/auth/firebase/sign-in';
            }
          } catch (e) {
            console.error('Failed to redirect after auth error:', e);
          }
        }
      }

      return Promise.reject((error.response && error.response.data) || 'Something went wrong!');
    }
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
export const fetcher = async (
  args: string | [string, AxiosRequestConfig],
  instance = axiosInstance
) => {
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
export const authFetcher = async (args: string | [string, AxiosRequestConfig]) =>
  fetcher(args, authAxiosInstance);

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
    status: (id: string) => `agents/${id}/status`,
  },
  students: {
    list: 'students',
    details: (id: string) => `students/${id}`,
    enroll: (id: string) => `students/${id}/enroll`,
    profilePhoto: (id: string) => `students/${id}/profile-photo`,
    status: (id: string) => `students/${id}/status`,
    removeIntakeLink: (id: string) => `students/${id}/remove-intake-link`,
  },
  universities: {
    list: 'universities',
    details: (id: string) => `universities/${id}`,
    status: (id: string) => `universities/${id}/status`,
  },
  courses: {
    list: 'courses',
    details: (id: string) => `courses/${id}`,
    status: (id: string) => `courses/${id}/status`,
  },
  intakes: {
    list: 'intakes',
    details: (id: string) => `intakes/${id}`,
    status: (id: string) => `intakes/${id}/status`,
  },
  location: {
    countries: 'locations/countries',
    cities: 'locations/cities',
  },
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  associations: {
    root: 'course-associations',
    byUniversity: (id: string) => `course-associations/university/${id}`,
    byCourses: (id: string) => `course-associations/courses/${id}`,
  },
  dashboard: {
    stats: 'dashboard/stats',
  },
};

export default axiosInstance;
