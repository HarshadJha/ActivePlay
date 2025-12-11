import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            <h1 className="text-5xl font-bold text-blue-600">ActivePlay</h1>
            <p className="text-xl text-gray-600 max-w-md text-center">
                Fun, AI-powered fitness games designed for active seniors.
            </p>
            <Link
                to="/onboarding"
                className="px-8 py-4 bg-blue-600 text-white rounded-full text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
                Get Started
            </Link>
        </div>
    );
};

export default Home;
