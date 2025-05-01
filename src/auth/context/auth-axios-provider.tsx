'use client';

import type { ReactNode} from 'react';

import { useEffect } from 'react';

import authAxiosInstance from 'src/lib/authAxios';

import { useAuthContext } from '../hooks/use-auth-context';

// ----------------------------------------------------------------------

type AuthAxiosProviderProps = {
  children: ReactNode;
};

export function AuthAxiosProvider({ children }: AuthAxiosProviderProps) {
  const { user } = useAuthContext();

  useEffect(() => {
    // Set up request interceptor to add auth token to all requests
    const interceptor = authAxiosInstance.interceptors.request.use(
      (config) => {
        // If user is authenticated, add the token
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      authAxiosInstance.interceptors.request.eject(interceptor);
    };
  }, [user]);

  return <>{children}</>;
}