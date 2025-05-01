'use client';

import { ReactNode, useEffect } from 'react';
import { authAxiosInstance, setAuthToken } from 'src/lib/axios-unified';
import { useAuthContext } from '../hooks/use-auth-context';

// ----------------------------------------------------------------------

type AuthAxiosProviderProps = {
  children: ReactNode;
};

export function AuthAxiosProvider({ children }: AuthAxiosProviderProps) {
  const { user } = useAuthContext();

  useEffect(() => {
    // When user changes, update auth token
    if (user?.accessToken) {
      setAuthToken(user.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [user]);

  return <>{children}</>;
}