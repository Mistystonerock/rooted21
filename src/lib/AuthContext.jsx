import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const u = await base44.auth.me();
      setUser(u);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      if (err?.code === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered' });
      } else {
        setAuthError({ type: 'auth_required' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const logout = async () => {
    queryClientInstance.clear();
    localStorage.clear();
    sessionStorage.clear();
    await base44.auth.logout('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError,
      checkUserAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};