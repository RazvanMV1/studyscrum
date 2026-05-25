import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, User, AuthTokens } from '../types/auth';
import { getMe } from '../api/auth';

interface AuthContextType extends AuthState {
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokensRaw = localStorage.getItem('tokens');
        const userRaw = localStorage.getItem('user');

        if (tokensRaw && userRaw) {
          const tokens: AuthTokens = JSON.parse(tokensRaw);
          const user: User = JSON.parse(userRaw);

          const freshUser = await getMe();

          setState({
            user: freshUser,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        setState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (tokens: AuthTokens) => {
    localStorage.setItem('tokens', JSON.stringify(tokens));

    const user = await getMe();
    localStorage.setItem('user', JSON.stringify(user));

    setState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul AuthProvider');
  }
  return context;
};
