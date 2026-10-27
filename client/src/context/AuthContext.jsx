import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chat_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout action
  const logout = () => {
    localStorage.removeItem('chat_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Sync axios authorization header with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on initial app load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/me`);
        setUser(res.data);
      } catch (err) {
        console.error('Session load error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token: newToken, ...userData } = res.data;
      
      localStorage.setItem('chat_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Register action
  const register = async (username, email, password, avatar, statusMessage) => {
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        avatar,
        statusMessage
      });
      const { token: newToken, ...userData } = res.data;

      localStorage.setItem('chat_token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };


  // Update profile
  const updateProfile = async (updates) => {
    try {
      const res = await axios.put(`${API_URL}/profile`, updates);
      setUser(res.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
