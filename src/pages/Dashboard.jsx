import { Link } from 'react-router-dom';
import { gameList } from '../games';
import { Play } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Choose Your Workout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gameList.map((game) => (
                    <Link
                        key={game.id}
                        to={`/game/${game.id}`}
                        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                        <div className="p-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-current" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {game.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                {game.instructions}
                            </p>

                            <div className="flex items-center text-sm font-medium text-blue-600">
                                <span>Start Game</span>
                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
