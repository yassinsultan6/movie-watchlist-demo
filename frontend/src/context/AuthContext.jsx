import React, { createContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import api from '../services/api';

// Create authentication context for sharing auth state across the app
const AuthContext = createContext(null);

// AuthProvider component that manages authentication state and provides auth methods
export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage to persist login across browser sessions
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Initialize token state from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Sync axios default headers with current token for authenticated API requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Handle user login - authenticate credentials and update auth state
  const login = async (credentials) => {
    const data = await loginUser(credentials);

    // Ensure backend returned a valid token
    if (!data?.token) {
      throw new Error('No token returned from backend');
    }

    // Update React state
    setToken(data.token);
    setUser(data.user);

    // Persist to localStorage for session persistence
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Handle user registration - create account and automatically log in
  const register = async (userData) => {
    const data = await registerUser(userData);

    // Ensure backend returned a valid token
    if (!data?.token) {
      throw new Error('No token returned from backend');
    }

    // Update React state
    setToken(data.token);
    setUser(data.user);

    // Persist to localStorage for session persistence
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Handle user logout - clear all auth state and storage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
  };

  // Context value object containing auth state and methods for child components
  const value = {
    user,           // Current user object {id, name, email}
    token,          // JWT token string
    isAuthenticated: !!token,  // Boolean indicating if user is logged in
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
