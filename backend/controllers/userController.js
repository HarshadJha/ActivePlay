const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                profile: true,
                stats: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, age, mobilityStatus, goals, onboardingCompleted, avatarUrl } = req.body;

        // Update user name if provided
        const updates = {};
        if (name) updates.name = name;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updates,
        });

        // Update profile
        const profileData = {};
        if (age !== undefined) profileData.age = parseInt(age);
        if (mobilityStatus) profileData.mobilityStatus = mobilityStatus;
        if (goals) profileData.goals = goals;
        if (onboardingCompleted !== undefined) profileData.onboardingCompleted = onboardingCompleted;
        if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl;

        const profile = await prisma.userProfile.update({
            where: { userId: req.user.userId },
            data: profileData,
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profile,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.userId },
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    deleteAccount,
};
