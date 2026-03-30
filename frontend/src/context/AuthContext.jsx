import React, { createContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    // Keep axios default header in sync with token
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const normalizeAuthResponse = (data) => {
    // Supports multiple backend response formats
    const normalizedToken = data?.token || data?.accessToken || data?.jwt || null;
    const normalizedUser =
      data?.user ||
      data?.data?.user ||
      data?.newUser ||
      data?.profile ||
      null;

    if (!normalizedToken) {
      throw new Error('No token returned from backend');
    }

    return { normalizedToken, normalizedUser };
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    const { normalizedToken, normalizedUser } = normalizeAuthResponse(data);

    setToken(normalizedToken);
    setUser(normalizedUser);

    localStorage.setItem('token', normalizedToken);
    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const register = async (userData) => {
    const data = await registerUser(userData);

    const { normalizedToken, normalizedUser } = normalizeAuthResponse(data);

    setToken(normalizedToken);
    setUser(normalizedUser);

    localStorage.setItem('token', normalizedToken);
    if (normalizedUser) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
