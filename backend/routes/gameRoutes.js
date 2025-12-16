const express = require('express');
const router = express.Router();
const {
    saveSession,
    getUserSessions,
    getStatistics,
    getLeaderboard,
} = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

// All game routes are protected
router.use(authMiddleware);

// @route   POST /api/games/sessions
// @desc    Save a game session
// @access  Private
router.post('/sessions', saveSession);

// @route   GET /api/games/sessions
// @desc    Get user's game sessions
// @access  Private
router.get('/sessions', getUserSessions);

// @route   GET /api/games/statistics
// @desc    Get user statistics
// @access  Private
router.get('/statistics', getStatistics);

// @route   GET /api/games/leaderboard
// @desc    Get leaderboard data
// @access  Private
router.get('/leaderboard', getLeaderboard);

module.exports = router;
