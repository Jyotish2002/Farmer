import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Set authorization header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        // Check if it's a demo token - skip API call
        if (token === 'demo-jwt-token-123') {
          // User is already set by demoLogin, don't make API call
          setLoading(false);
          return;
        }
        
        try {
          const response = await axios.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    toast.success('Login successful!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const demoLogin = () => {
    // Create a demo user for development
    const demoUser = {
      _id: 'demo-user-123',
      name: 'Demo Farmer',
      email: 'demo@farmer.com',
      role: 'farmer',
      location: 'Kolkata',
      farmSize: 5,
      crops: ['Rice', 'Wheat'],
      avatar: null
    };
    
    const demoToken = 'demo-jwt-token-123';
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('token', demoToken);
    toast.success('Demo login successful!');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    demoLogin,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };