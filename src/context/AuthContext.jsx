import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = authService.getToken();
                if (token) {
                    // Try to fetch current user from API
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } else {
                    // Fall back to stored user data
                    const storedUser = authService.getStoredUser();
                    setUser(storedUser);
                }
            } catch (err) {
                console.error('Failed to initialize auth:', err);
                // If token is invalid, clear it
                authService.logout();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Register a new user
     */
    const register = async (email, password, name) => {
        try {
            setError(null);
            setLoading(true);
            const data = await authService.register(email, password, name);
            setUser(data.user);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const data = await authService.login(email, password);
            setUser(data.user);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    /**
     * Update user data
     */
    const updateUser = (updates) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...updates };
            localStorage.setItem('activeplay_user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
