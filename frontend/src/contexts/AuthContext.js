import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const hasCheckedAuth = useRef(false);

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
      if (token && !hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        
        // Check if it's a demo token - skip API call
        if (token === 'demo-jwt-token-123') {
          // User is already set by demoLogin, don't make API call
          setLoading(false);
          return;
        }
        
        try {
          const response = await axios.get('/auth/profile');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid token without triggering useEffect loop
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      } else if (!token) {
        hasCheckedAuth.current = true;
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
    localStorage.removeItem('user');
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
    localStorage.setItem('user', JSON.stringify(demoUser));
    toast.success('Demo login successful!');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    demoLogin,
    updateUser,
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