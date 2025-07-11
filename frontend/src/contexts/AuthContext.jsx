import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Get user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login mutation
  const loginMutation = useMutation(
    (credentials) => api.post('/auth/login', credentials),
    {
      onSuccess: (response) => {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success('Login successful!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Login failed');
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    (userData) => api.post('/auth/register', userData),
    {
      onSuccess: (response) => {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        toast.success('Registration successful!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Registration failed');
      },
    }
  );

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(
    (preferences) => api.put('/auth/preferences', preferences),
    {
      onSuccess: (response) => {
        const updatedUser = { ...user, preferences: response.data.preferences };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Preferences updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update preferences');
      },
    }
  );

  // Clear authentication data
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    queryClient.clear();
  };

  // Logout function
  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
  };

  // Auto-refresh token
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await api.post('/auth/refresh');
        const { token } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      // Refresh token every 6 hours
      const interval = setInterval(refreshToken, 6 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    clearAuth,
    updatePreferences: updatePreferencesMutation.mutate,
    loginLoading: loginMutation.isLoading,
    registerLoading: registerMutation.isLoading,
    preferencesLoading: updatePreferencesMutation.isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
