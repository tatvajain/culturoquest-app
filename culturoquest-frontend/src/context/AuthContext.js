import React, { createContext, useContext, useState, useEffect } from 'react';

// ✅ FIXED: Remove /login from the base URL
const API_URL = 'https://culturoquest-app-1.onrender.com/api/users';

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

  // --- Registration Function ---
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
      console.error('Registration error:', err);
      return { success: false, message: 'Server error' };
    }
  };

  // --- Login Function ---
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, { // ✅ Now becomes /api/users/login
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
      console.error('Login error:', err);
      return { success: false, message: 'Server error' };
    }
  };

  // --- Logout Function ---
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