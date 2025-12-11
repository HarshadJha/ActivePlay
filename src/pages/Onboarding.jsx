import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { getRecommendedGames } from '../services/personalization';
import StepCard from '../components/ui/StepCard';
import { User, Activity, Heart, CheckCircle, ArrowRight } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, updateUser, completeOnboarding } = useUser();
    const [step, setStep] = useState(1);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleComplete = () => {
        completeOnboarding();
        navigate('/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome! What's your name?</h2>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium">Name</span>
                            <input
                                type="text"
                                value={user.name}
                                onChange={(e) => updateUser({ name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 border"
                                placeholder="Enter your name"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700 font-medium">Age</span>
                            <input
                                type="number"
                                value={user.age}
                                onChange={(e) => updateUser({ age: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 border"
                                placeholder="Enter your age"
                            />
                        </label>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={!user.name || !user.age}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                        <span>Next Step</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Step 2: Mobility */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800">How do you prefer to exercise?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StepCard
                            title="Seated"
                            description="I prefer exercises I can do from a chair."
                            icon={User}
                            selected={user.mobilityStatus === 'seated'}
                            onClick={() => updateUser({ mobilityStatus: 'seated' })}
                        />
                        <StepCard
                            title="Assisted"
                            description="I can stand but may need support for balance."
                            icon={Activity}
                            selected={user.mobilityStatus === 'assisted'}
                            onClick={() => updateUser({ mobilityStatus: 'assisted' })}
                        />
                        <StepCard
                            title="Active"
                            description="I am comfortable moving around freely."
                            icon={Heart}
                            selected={user.mobilityStatus === 'active'}
                            onClick={() => updateUser({ mobilityStatus: 'active' })}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={handleBack} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Back</button>
                        <button
                            onClick={handleNext}
                            disabled={!user.mobilityStatus}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-800">What are your goals?</h2>
                    <div className="space-y-3">
                        {['Improve Balance', 'Build Strength', 'Boost Cardio', 'Flexibility'].map((goal) => (
                            <label key={goal} className="flex items-center p-4 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={user.goals.includes(goal)}
                                    onChange={(e) => {
                                        const newGoals = e.target.checked
                                            ? [...user.goals, goal]
                                            : user.goals.filter(g => g !== goal);
                                        updateUser({ goals: newGoals });
                                    }}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-lg text-gray-700">{goal}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={handleBack} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Back</button>
                        <button
                            onClick={handleNext}
                            disabled={user.goals.length === 0}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            See Recommendations
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-800">You're all set, {user.name}!</h2>
                        <p className="text-gray-600 mt-2">Based on your profile, we recommend starting with:</p>
                    </div>

                    <div className="grid gap-4">
                        {getRecommendedGames(user).map(game => (
                            <div key={game.id} className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-lg text-blue-900">{game.title}</h4>
                                    <p className="text-sm text-gray-600">{game.description}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {game.difficulty}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleComplete}
                        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-xl hover:bg-green-700 shadow-lg transform transition hover:scale-105"
                    >
                        Start Playing
                    </button>
                </div>
            )}
        </div>
    );
};

export default Onboarding;
