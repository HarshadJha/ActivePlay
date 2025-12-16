const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');

// @route   POST /api/games/sessions
// @desc    Save a game session
// @access  Private
const saveSession = async (req, res) => {
    try {
        const { gameType, score, duration, accuracy, metadata } = req.body;

        if (!gameType || score === undefined || !duration) {
            return res.status(400).json({ error: 'Missing required fields: gameType, score, duration' });
        }

        // Create game session
        const session = await prisma.gameSession.create({
            data: {
                userId: req.user.userId,
                gameType,
                score: parseInt(score),
                duration: parseInt(duration),
                accuracy: accuracy ? parseFloat(accuracy) : null,
                metadata: metadata || {},
            },
        });

        // Update user stats
        await updateUserStats(req.user.userId, gameType, duration);

        res.status(201).json({
            message: 'Game session saved successfully',
            session,
        });
    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   GET /api/games/sessions
// @desc    Get user's game sessions
// @access  Private
const getUserSessions = async (req, res) => {
    try {
        const { limit = 10, offset = 0, gameType } = req.query;

        const where = { userId: req.user.userId };
        if (gameType) where.gameType = gameType;

        const sessions = await prisma.gameSession.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
        });

        const total = await prisma.gameSession.count({ where });

        res.json({
            sessions,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   GET /api/games/statistics
// @desc    Get user statistics
// @access  Private
const getStatistics = async (req, res) => {
    try {
        const stats = await prisma.userStats.findUnique({
            where: { userId: req.user.userId },
        });

        // Get game breakdown
        const gameBreakdown = await prisma.gameSession.groupBy({
            by: ['gameType'],
            where: { userId: req.user.userId },
            _count: { id: true },
            _avg: { score: true },
            _max: { score: true },
        });

        // Get recent sessions for trend analysis
        const recentSessions = await prisma.gameSession.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                gameType: true,
                score: true,
                duration: true,
                createdAt: true,
            },
        });

        res.json({
            stats,
            gameBreakdown,
            recentSessions,
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @route   GET /api/games/leaderboard
// @desc    Get leaderboard data
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const { gameType, limit = 10 } = req.query;

        if (!gameType) {
            return res.status(400).json({ error: 'gameType is required' });
        }

        // Get top scores for the game
        const topSessions = await prisma.gameSession.findMany({
            where: { gameType },
            orderBy: { score: 'desc' },
            take: parseInt(limit),
            distinct: ['userId'],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profile: {
                            select: { avatarUrl: true },
                        },
                    },
                },
            },
        });

        // Find current user's rank
        const userBestScore = await prisma.gameSession.findFirst({
            where: {
                userId: req.user.userId,
                gameType,
            },
            orderBy: { score: 'desc' },
        });

        let userRank = null;
        if (userBestScore) {
            const betterScores = await prisma.gameSession.count({
                where: {
                    gameType,
                    score: { gt: userBestScore.score },
                },
                distinct: ['userId'],
            });
            userRank = betterScores + 1;
        }

        res.json({
            leaderboard: topSessions.map((session, index) => ({
                rank: index + 1,
                userId: session.user.id,
                userName: session.user.name,
                avatarUrl: session.user.profile?.avatarUrl,
                score: session.score,
                date: session.createdAt,
            })),
            userRank,
            userBestScore: userBestScore?.score,
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper function to update user stats
async function updateUserStats(userId, gameType, duration) {
    const stats = await prisma.userStats.findUnique({
        where: { userId },
    });

    await prisma.userStats.update({
        where: { userId },
        data: {
            totalGamesPlayed: stats.totalGamesPlayed + 1,
            totalPlayTime: stats.totalPlayTime + duration,
            lastPlayedAt: new Date(),
            favoriteGame: gameType, // Simple logic - can be improved
        },
    });

    // Check for achievements
    await checkAchievements(userId, stats.totalGamesPlayed + 1);
}

// Helper function to check and unlock achievements
async function checkAchievements(userId, totalGames) {
    const achievementsToUnlock = [];

    // First game
    if (totalGames === 1) {
        achievementsToUnlock.push('first_game');
    }

    // 10 games milestone
    if (totalGames === 10) {
        achievementsToUnlock.push('games_10');
    }

    // 50 games milestone
    if (totalGames === 50) {
        achievementsToUnlock.push('games_50');
    }

    // 100 games milestone
    if (totalGames === 100) {
        achievementsToUnlock.push('games_100');
    }

    // Create achievements
    for (const achievementType of achievementsToUnlock) {
        try {
            await prisma.achievement.create({
                data: {
                    userId,
                    achievementType,
                },
            });
        } catch (error) {
            // Achievement already exists, ignore
        }
    }
}

module.exports = {
    saveSession,
    getUserSessions,
    getStatistics,
    getLeaderboard,
};
