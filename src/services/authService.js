import api from './api';

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */

const authService = {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User name
     * @returns {Promise} User data and tokens
     */
    async register(email, password, name) {
        const response = await api.post('/api/auth/register', {
            email,
            password,
            name,
        });

        if (response.data.token) {
            localStorage.setItem('activeplay_token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('activeplay_refresh_token', response.data.refreshToken);
            }
            localStorage.setItem('activeplay_user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} User data and tokens
     */
    async login(email, password) {
        const response = await api.post('/api/auth/login', {
            email,
            password,
        });

        if (response.data.token) {
            localStorage.setItem('activeplay_token', response.data.token);
            if (response.data.refreshToken) {
                localStorage.setItem('activeplay_refresh_token', response.data.refreshToken);
            }
            localStorage.setItem('activeplay_user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('activeplay_token');
        localStorage.removeItem('activeplay_refresh_token');
        localStorage.removeItem('activeplay_user');
    },

    /**
     * Get current authenticated user
     * @returns {Promise} User data
     */
    async getCurrentUser() {
        const response = await api.get('/api/auth/me');

        if (response.data && response.data.user) {
            localStorage.setItem('activeplay_user', JSON.stringify(response.data.user));
            return response.data.user;
        }

        return response.data;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has valid token
     */
    isAuthenticated() {
        const token = localStorage.getItem('activeplay_token');
        return !!token;
    },

    /**
     * Get stored user from localStorage
     * @returns {Object|null} User object or null
     */
    getStoredUser() {
        const userStr = localStorage.getItem('activeplay_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get stored token from localStorage
     * @returns {string|null} JWT token or null
     */
    getToken() {
        return localStorage.getItem('activeplay_token');
    },
};

export default authService;
