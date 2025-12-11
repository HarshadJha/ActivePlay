import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Activity, User, Play } from 'lucide-react';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                        <Activity className="w-8 h-8" />
                        <span className="text-2xl font-bold tracking-tight">ActivePlay</span>
                    </Link>

                    <nav className="flex space-x-6">
                        <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium">
                            <Home className="w-5 h-5" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium">
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium">
                            <Play className="w-5 h-5" />
                            <span className="hidden sm:inline">Play</span>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} ActivePlay. Designed for healthy aging.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
