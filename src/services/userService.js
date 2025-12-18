import api from './api';

/**
 * User Service
 * Handles user profile operations
 */

const userService = {
    /**
     * Get user profile
     * @returns {Promise} User profile data
     */
    async getProfile() {
        const response = await api.get('/api/users/profile');
        return response.data;
    },

    /**
     * Update user profile
     * @param {Object} data - Profile data to update
     * @returns {Promise} Updated profile data
     */
    async updateProfile(data) {
        const response = await api.put('/api/users/profile', data);
        return response.data;
    },

    /**
     * Delete user account
     * @returns {Promise} Deletion confirmation
     */
    async deleteAccount() {
        const response = await api.delete('/api/users/account');
        return response.data;
    },
};

export default userService;
