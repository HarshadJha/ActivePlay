import React, { useState, useEffect } from 'react';
import { UserContext } from './useUser';
import { useAuth } from './useAuth';
import userService from '../services/userService';

export const UserProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('activeplay_user_profile');
        return savedUser ? JSON.parse(savedUser) : {
            name: '',
            age: '',
            mobilityStatus: null, // 'seated', 'assisted', 'active'
            goals: [], // ['balance', 'strength', 'cardio']
            onboardingCompleted: false,
        };
    });

    const [isLoading, setIsLoading] = useState(false);

    // Fetch user profile from backend when authenticated
    useEffect(() => {
        const fetchProfile = async () => {
            if (isAuthenticated) {
                try {
                    setIsLoading(true);
                    const profile = await userService.getProfile();

                    // Merge backend profile with local state
                    const mergedUser = {
                        name: profile.user?.name || user.name,
                        age: profile.age || user.age,
                        mobilityStatus: profile.mobilityStatus || user.mobilityStatus,
                        goals: profile.goals || user.goals,
                        onboardingCompleted: profile.onboardingCompleted ?? user.onboardingCompleted,
                    };

                    setUser(mergedUser);
                    localStorage.setItem('activeplay_user_profile', JSON.stringify(mergedUser));
                } catch (err) {
                    console.error('Failed to fetch user profile:', err);
                    // Continue with localStorage data
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    // Save to localStorage on changes
    useEffect(() => {
        localStorage.setItem('activeplay_user_profile', JSON.stringify(user));
    }, [user]);

    const updateUser = async (updates) => {
        // Update local state immediately
        setUser((prev) => ({ ...prev, ...updates }));

        // Sync to backend if authenticated
        if (isAuthenticated) {
            try {
                await userService.updateProfile(updates);
            } catch (err) {
                console.error('Failed to update profile on backend:', err);
                // Continue with local update even if backend fails
            }
        }
    };

    const completeOnboarding = async () => {
        const updates = { onboardingCompleted: true };
        setUser((prev) => ({ ...prev, ...updates }));

        // Sync to backend if authenticated
        if (isAuthenticated) {
            try {
                await userService.updateProfile(updates);
            } catch (err) {
                console.error('Failed to complete onboarding on backend:', err);
            }
        }
    };

    const resetUser = () => {
        setUser({
            name: '',
            age: '',
            mobilityStatus: null,
            goals: [],
            onboardingCompleted: false,
        });
        localStorage.removeItem('activeplay_user_profile');
    };

    return (
        <UserContext.Provider value={{ user, updateUser, completeOnboarding, resetUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};
