import React, { useState, useEffect } from 'react';
import { UserContext } from './useUser';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('activeplay_user');
        return savedUser ? JSON.parse(savedUser) : {
            name: '',
            age: '',
            mobilityStatus: null, // 'seated', 'assisted', 'active'
            goals: [], // ['balance', 'strength', 'cardio']
            onboardingCompleted: false,
        };
    });

    useEffect(() => {
        localStorage.setItem('activeplay_user', JSON.stringify(user));
    }, [user]);

    const updateUser = (updates) => {
        setUser((prev) => ({ ...prev, ...updates }));
    };

    const completeOnboarding = () => {
        setUser((prev) => ({ ...prev, onboardingCompleted: true }));
    };

    const resetUser = () => {
        setUser({
            name: '',
            age: '',
            mobilityStatus: null,
            goals: [],
            onboardingCompleted: false,
        });
    };

    return (
        <UserContext.Provider value={{ user, updateUser, completeOnboarding, resetUser }}>
            {children}
        </UserContext.Provider>
    );
};
