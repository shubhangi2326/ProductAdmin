'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { loginApi, getCurrentUserApi } from '@/api/auth';
import { AUTH_TOKEN_KEY, USER_INFO_KEY } from '@/api/axios';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate auth state on client mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = Cookies.get(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUserStr = localStorage.getItem(USER_INFO_KEY);

        if (savedToken) {
          setToken(savedToken);
          if (savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
            } catch {
              // Fallback to API if stored user JSON is corrupted
              const currentUser = await getCurrentUserApi();
              setUser(currentUser);
              localStorage.setItem(USER_INFO_KEY, JSON.stringify(currentUser));
            }
          } else {
            const currentUser = await getCurrentUserApi();
            setUser(currentUser);
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(currentUser));
          }
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
        // Clear corrupted tokens
        Cookies.remove(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await loginApi(credentials);

      const userObj: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
        accessToken: data.accessToken,
      };

      // Set cookie (valid for 7 days) and localStorage
      Cookies.set(AUTH_TOKEN_KEY, data.accessToken, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userObj));

      setToken(data.accessToken);
      setUser(userObj);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid username or password. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
