import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    ActivePlay
                </h1>
                <p className="text-xl md:text-2xl text-blue-200 max-w-2xl">
                    Transform fitness into fun with AI-powered interactive games
                </p>
                <p className="text-lg text-blue-300 max-w-xl">
                    Using your webcam and advanced pose detection, play engaging games designed for all fitness levels
                </p>
            </div>

            {isAuthenticated ? (
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-blue-200">
                        Welcome back, <span className="font-semibold text-white">{user?.name || 'Player'}</span>!
                    </p>
                    <Link
                        to="/dashboard"
                        className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/login"
                        className="group px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/20 text-white rounded-full text-lg font-semibold hover:bg-white/20 transition-all shadow-lg flex items-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg transform hover:scale-105 flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Get Started
                    </Link>
                </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🎮</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Interactive Games</h3>
                    <p className="text-blue-200 text-sm">
                        Play engaging fitness games powered by real-time motion tracking
                    </p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Track Progress</h3>
                    <p className="text-blue-200 text-sm">
                        Monitor your fitness journey with detailed statistics and achievements
                    </p>
                </div>
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Privacy First</h3>
                    <p className="text-blue-200 text-sm">
                        All processing happens locally in your browser - your data stays private
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
