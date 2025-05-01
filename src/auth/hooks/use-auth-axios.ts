import { useEffect } from 'react';
import authAxiosInstance from 'src/lib/authAxios';
import { useAuthContext } from './use-auth-context';

export const useAuthAxios = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    // Add a request interceptor to inject the auth token
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

    // Clean up the interceptor when the component unmounts or user changes
    return () => {
      authAxiosInstance.interceptors.request.eject(interceptor);
    };
  }, [user]);

  return authAxiosInstance;
};

export default useAuthAxios;