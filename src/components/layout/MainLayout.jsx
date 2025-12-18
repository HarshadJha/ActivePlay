import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, User, Play, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const MainLayout = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Don't show header/footer on login/register pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors">
                        <Activity className="w-8 h-8" />
                        <span className="text-2xl font-bold tracking-tight">ActivePlay</span>
                    </Link>

                    <nav className="flex items-center space-x-6">
                        <Link to="/" className="flex items-center space-x-1 text-blue-200 hover:text-white font-medium transition-colors">
                            <Home className="w-5 h-5" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/dashboard" className="flex items-center space-x-1 text-blue-200 hover:text-white font-medium transition-colors">
                                    <Play className="w-5 h-5" />
                                    <span className="hidden sm:inline">Play</span>
                                </Link>
                                <Link to="/stats" className="flex items-center space-x-1 text-blue-200 hover:text-white font-medium transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="hidden sm:inline">Stats</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-blue-200 hover:text-red-300 font-medium transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white/5 border-t border-white/10 mt-auto">
                <div className="max-w-5xl mx-auto px-4 py-6 text-center text-blue-200 text-sm">
                    &copy; {new Date().getFullYear()} ActivePlay. Designed for healthy aging.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
