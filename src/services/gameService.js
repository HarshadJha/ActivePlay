import api from './api';

/**
 * Game Service
 * Handles game session operations, statistics, and leaderboards
 */

const gameService = {
    /**
     * Save a game session
     * @param {Object} sessionData - Session data to save
     * @param {string} sessionData.gameType - Type of game played
     * @param {number} sessionData.score - Score achieved
     * @param {number} sessionData.duration - Duration in seconds
     * @param {number} sessionData.accuracy - Accuracy percentage (optional)
     * @param {Object} sessionData.metadata - Additional game-specific data (optional)
     * @returns {Promise} Saved session data
     */
    async saveSession(sessionData) {
        const response = await api.post('/api/games/sessions', sessionData);
        return response.data;
    },

    /**
     * Get user's game sessions
     * @param {Object} filters - Optional filters (gameType, limit, offset)
     * @returns {Promise} Array of game sessions
     */
    async getSessions(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/api/games/sessions${params ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Get user statistics
     * @returns {Promise} User statistics
     */
    async getStatistics() {
        const response = await api.get('/api/games/statistics');
        return response.data;
    },

    /**
     * Get leaderboard for a specific game
     * @param {string} gameType - Type of game (optional, if null returns global leaderboard)
     * @param {number} limit - Number of entries to return (default: 10)
     * @returns {Promise} Leaderboard data
     */
    async getLeaderboard(gameType = null, limit = 10) {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (gameType) {
            params.append('gameType', gameType);
        }
        const response = await api.get(`/api/games/leaderboard?${params.toString()}`);
        return response.data;
    },
};

export default gameService;
