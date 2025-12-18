import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../services/gameService';
import { useAuth } from '../context/useAuth';
import {
    Trophy,
    Target,
    Clock,
    Flame,
    TrendingUp,
    ArrowLeft,
    Loader2,
    GamepadIcon
} from 'lucide-react';

const Stats = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsResponse, sessionsResponse] = await Promise.all([
                    gameService.getStatistics(),
                    gameService.getSessions({ limit: 10 })
                ]);

                // Backend returns {stats, gameBreakdown, recentSessions}
                setStats(statsResponse.stats);

                // Backend returns {sessions, total, limit, offset}
                setSessions(sessionsResponse.sessions || []);

                console.log('Stats loaded:', statsResponse.stats);
                console.log('Sessions loaded:', sessionsResponse.sessions);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading your stats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">Your Statistics</h1>
                    <p className="text-blue-200">Track your fitness journey progress</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Games */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <GamepadIcon className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-blue-200 text-sm font-medium">Total Games</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {stats?.totalGamesPlayed || 0}
                        </p>
                    </div>

                    {/* Total Play Time */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-blue-200 text-sm font-medium">Total Time</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {formatDuration(stats?.totalPlayTime || 0)}
                        </p>
                    </div>

                    {/* Current Streak */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                                <Flame className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-blue-200 text-sm font-medium">Current Streak</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {stats?.currentStreak || 0} days
                        </p>
                    </div>

                    {/* Best Streak */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-blue-200 text-sm font-medium">Best Streak</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {stats?.longestStreak || 0} days
                        </p>
                    </div>
                </div>

                {/* Favorite Game */}
                {stats?.favoriteGame && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <h3 className="text-xl font-bold text-white">Favorite Game</h3>
                        </div>
                        <p className="text-2xl font-semibold text-purple-300 capitalize">
                            {stats.favoriteGame.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                    </div>
                )}

                {/* Recent Sessions */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-blue-400" />
                        Recent Games
                    </h3>

                    {sessions.length === 0 ? (
                        <p className="text-blue-200 text-center py-8">No game sessions yet. Start playing!</p>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="text-white font-semibold capitalize">
                                                {session.gameType.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <p className="text-sm text-blue-200">
                                                {formatDate(session.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">{session.score}</p>
                                            <p className="text-sm text-blue-200">points</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm text-blue-200">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatDuration(session.duration)}
                                        </span>
                                        {session.accuracy && (
                                            <span className="flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                {Math.round(session.accuracy)}% accuracy
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Stats;
