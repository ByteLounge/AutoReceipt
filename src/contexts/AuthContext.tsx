import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextExports';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('achievers_auth');
    if (authStatus === 'true') {
      const timer = setTimeout(() => {
        setIsAuthenticated(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const login = (password: string) => {
    if (password === 'admin123') { // Simple password for now as requested
      setIsAuthenticated(true);
      localStorage.setItem('achievers_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('achievers_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
