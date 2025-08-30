import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('peerfact_token'));

  // Set axios default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('peerfact_token', access_token);
      localStorage.setItem('peerfact_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        username,
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('peerfact_token', access_token);
      localStorage.setItem('peerfact_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('peerfact_token');
    localStorage.removeItem('peerfact_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const loginAsAnonymous = async (username = null) => {
    try {
      const response = await axios.post(`${API_BASE}/users/bootstrap`, { username });
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('peerfact_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Anonymous login failed:', error);
      return {
        success: false,
        message: 'Failed to create anonymous user',
      };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loginAsAnonymous,
    loading,
    isAuthenticated: !!token,
    isAnonymous: user?.is_anonymous || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};