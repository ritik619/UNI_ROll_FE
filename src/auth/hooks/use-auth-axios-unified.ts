import { useEffect } from 'react';
import { authAxiosInstance, setAuthToken } from 'src/lib/axios-unified';
import { useAuthContext } from './use-auth-context';

/**
 * Hook to get the auth-enabled axios instance
 * Note: This hook is only needed for component-level usage,
 * as the AuthAxiosProvider handles global token setting
 */
export const useAuthAxios = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    // Update auth token when user changes
    if (user?.accessToken) {
      setAuthToken(user.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [user]);

  return authAxiosInstance;
};

export default useAuthAxios;