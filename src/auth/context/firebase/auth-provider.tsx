'use client';

import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios from 'src/lib/axios';
import { AUTH, FIRESTORE } from 'src/lib/firebase';
import { setLogoutHandler } from 'src/lib/axios-unified';

import { AuthContext } from '../auth-context';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  // Function to handle logout (called by axios interceptor on auth error)
  const handleLogout = useCallback(async () => {
    try {
      // Sign out from Firebase
      await signOut(AUTH);
      
      // Clear auth state
      setState({ user: null, loading: false });
      
      // Clean up headers
      delete axios.defaults.headers.common.Authorization;
      
      // Add a message to localStorage to show on next page load
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('sessionExpired', 'true');
        
        // Redirect to sign-in page
        window.location.href = '/auth/firebase/sign-in';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [setState]);

  // Register the logout handler with axios interceptor
  useEffect(() => {
    setLogoutHandler(handleLogout);
  }, [handleLogout]);

  const checkUserSession = useCallback(async () => {
    try {
      onAuthStateChanged(AUTH, async (user: AuthState['user']) => {
        if (user) {
          // Check if user is in Admins collection
          const adminProfile = doc(FIRESTORE, 'Admins', user.uid);
          const adminDoc = await getDoc(adminProfile);

          // Check if user is in Agents collection
          const agentProfile = doc(FIRESTORE, 'Agents', user.uid);
          const agentDoc = await getDoc(agentProfile);

          let userData = {};
          let role = 'user'; // Default role

          if (adminDoc.exists()) {
            userData = adminDoc.data();
            role = 'admin';
          } else if (agentDoc.exists()) {
            userData = agentDoc.data();
            role = 'agent';
          }

          const { accessToken } = user;

          setState({
            user: {
              ...user,
              ...userData,
              role,
            },
            loading: false
          });

          axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        } else {
          setState({ user: null, loading: false });
          delete axios.defaults.headers.common.Authorization;
        }
      });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user?.uid,
            accessToken: state.user?.accessToken,
            displayName: state.user?.displayName,
            photoURL: state.user?.photoURL,
          role: state.user?.role,
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
