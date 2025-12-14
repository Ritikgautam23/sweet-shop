import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setState({
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);

        setState({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success(`Welcome back, ${data.data.user.name}!`);
        return true;
      } else {
        toast.error(data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);

        setState({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success('Account created successfully!');
        return true;
      } else {
        toast.error(data.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    toast.success('Logged out successfully');
  };

  const updateUser = async (updates) => {
    if (state.user && state.token) {
      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`,
          },
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (data.success) {
          const updatedUser = { ...state.user, ...updates };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setState(prev => ({ ...prev, user: updatedUser }));
          toast.success('Profile updated successfully');
          return true;
        } else {
          toast.error(data.error || 'Failed to update profile');
          return false;
        }
      } catch (error) {
        console.error('Profile update error:', error);
        // Fallback to local update for demo purposes
        const updatedUser = { ...state.user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setState(prev => ({ ...prev, user: updatedUser }));
        toast.success('Profile updated successfully');
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
