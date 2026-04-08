import api from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Login failed');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No response from server');
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else {
      throw new Error('Network error or no response from server');
    }
  }
};
