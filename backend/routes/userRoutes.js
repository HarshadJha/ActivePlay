const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    deleteAccount,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All user routes are protected
router.use(authMiddleware);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', deleteAccount);

module.exports = router;
