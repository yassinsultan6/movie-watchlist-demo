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

  // Handle login from a pre-issued token (OAuth callback / email verification)
  // Fetches full user info from the server and updates auth state
  const loginWithToken = async (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const response = await api.get('/user/me');
      const userData = response.data;
      setToken(token);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData; // caller can use role for redirect
    } catch (err) {
      // Token may be invalid — clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common.Authorization;
      throw new Error('Failed to fetch user info after login');
    }
  };

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
    return data; // caller can use user.role for redirect
  };

  // Handle user registration - create account (no auto-login until email verified)
  const register = async (userData) => {
    const data = await registerUser(userData);

    // Registration successful but no token yet - user must verify email first
    // Store user info for reference but don't auto-login
    if (data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      // Return message to indicate verification is needed
      return { message: data.message, user: data.user };
    } else {
      throw new Error('Registration failed - no user data returned');
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
    user,           // Current user object {id, name, email, role}
    token,          // JWT token string
    isAuthenticated: !!token,  // Boolean indicating if user is logged in
    isAdmin: user?.role === 'admin',  // Boolean indicating if user is admin
    login,          
    loginWithToken,
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
