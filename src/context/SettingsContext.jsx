import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const defaultSettings = {
    videoQuality: 'high', // 'high' | 'medium' | 'low'
    soundEnabled: true,
    voiceFeedback: true,
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('activeplay_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('activeplay_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
