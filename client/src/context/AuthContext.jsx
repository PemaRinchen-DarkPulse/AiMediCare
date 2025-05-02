import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

// Create the auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verify token with backend
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Update user state
        setUser(data.user);
        
        // Return success but don't show toast here
        return { 
          success: true, 
          user: data.user,
          toast: data.toast || { type: 'success', message: `Welcome back, ${data.user?.name || 'User'}!` }
        };
      } else {
        // Return error but don't show toast here
        return { 
          success: false, 
          message: data.message || 'Login failed',
          toast: data.toast || { type: 'error', message: data.message || 'Invalid credentials' }
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: 'Server error',
        toast: { type: 'error', message: 'Login failed. Please try again.' }
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout endpoint if you have one
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });
      
      // Clear local storage and state
      localStorage.removeItem('token');
      setUser(null);
      
      // Return success for redirection handling in component
      return { 
        success: true, 
        toast: { type: 'info', message: 'You have been logged out.' }
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear local data
      localStorage.removeItem('token');
      setUser(null);
      
      return { 
        success: true, 
        toast: { type: 'info', message: 'You have been logged out.' }
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Registration response:', data); // Debug logging
      
      if (response.ok) {
        if (data.toast) {
          toast[data.toast.type](data.toast.message);
        } else {
          toast.success(data.message || 'Registration successful! Please check your email to verify your account.');
        }
        return { success: true };
      } else {
        if (data.toast) {
          toast[data.toast.type](data.toast.message);
        } else {
          toast.error(data.message || 'Registration failed');
        }
        console.error('Registration error from server:', data);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, message: 'Server error' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      isAuthenticated,
      getUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;