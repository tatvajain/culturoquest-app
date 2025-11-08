import React, { createContext, useContext, useState, useEffect } from 'react';

// In AuthContext.js AND GameContext.js
// This line automatically uses the Vercel variable when deployed,
// or falls back to localhost:5000 when run locally.
const API_URL = 'https://culturoquest-app-1.onrender.com/api/users' || 'http://localhost:5000/api/users';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // ✅ ADD THIS - Store user data

  // ✅ NEW: Function to fetch current user data
  const fetchUserData = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: {
          'x-auth-token': authToken
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return userData;
      } else {
        console.error('Failed to fetch user data');
        return null;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  // Check if the user is already logged in when the app starts
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        setIsAuthenticated(true);
        await fetchUserData(token); // ✅ Fetch user data on app load
      }
      setLoading(false);
    };
    
    initAuth();
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
        await fetchUserData(data.token); // ✅ Fetch user data after registration
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
        await fetchUserData(data.token); // ✅ Fetch user data after login
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
    setUser(null); // ✅ Clear user data
    setIsAuthenticated(false);
  };

  // ✅ NEW: Function to update user progress
  const updateProgress = async (progressData) => {
    try {
      const res = await fetch(`${API_URL}/update-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(progressData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser); // ✅ Update local user state
        return { success: true, user: updatedUser };
      } else {
        const error = await res.json();
        return { success: false, message: error.msg || 'Update failed' };
      }
    } catch (err) {
      console.error('Update progress error:', err);
      return { success: false, message: 'Server error' };
    }
  };

  const value = {
    token,
    isAuthenticated,
    loading,
    user, // ✅ Expose user data
    login,
    logout,
    register,
    updateProgress, // ✅ Expose update function
    fetchUserData, // ✅ Expose fetch function (for manual refresh)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};