import React, { createContext, useContext, useState, useEffect } from 'react';

// This is the URL of our backend server.
const API_URL = 'https://culturoquest-app-1.onrender.com';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if the user is already logged in when the app starts
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [token]);

  // --- NEW: Real Registration Function ---
  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.msg || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  // --- NEW: Real Login Function ---
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.msg || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, message: 'Server error' };
    }
  };

  // --- NEW: Real Logout Function ---
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};