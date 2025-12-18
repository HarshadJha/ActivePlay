import React, { useEffect, useState } from 'react';
import gameService from '../../services/gameService';
import { Trophy, Medal, Award, Loader2, RefreshCw } from 'lucide-react';

const Leaderboard = ({ gameType, limit = 10 }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await gameService.getLeaderboard(gameType, limit);
            setLeaderboard(data);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            setError('Failed to load leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [gameType, limit]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-300" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 text-center font-bold text-purple-300">#{rank}</span>;
        }
    };

    const getRankClass = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
            case 2:
                return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
            case 3:
                return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50';
            default:
                return 'bg-white/5 border-white/10';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                <p className="text-red-300 mb-4">{error}</p>
                <button
                    onClick={fetchLeaderboard}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-blue-200">No scores yet. Be the first to play!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    Leaderboard
                </h3>
                <button
                    onClick={fetchLeaderboard}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5 text-blue-300 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    return (
                        <div
                            key={entry.id || index}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankClass(
                                rank
                            )}`}
                        >
                            {/* Rank */}
                            <div className="flex-shrink-0 w-10 flex justify-center">
                                {getRankIcon(rank)}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">
                                    {entry.userName || entry.user?.name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-blue-200">
                                    {entry.duration ? `${Math.floor(entry.duration / 60)}:${String(entry.duration % 60).padStart(2, '0')}` : 'N/A'}
                                </p>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">{entry.score || 0}</p>
                                {entry.accuracy && (
                                    <p className="text-sm text-blue-200">{Math.round(entry.accuracy)}% acc</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Leaderboard;
