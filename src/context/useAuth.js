import { useContext } from 'react';
import { AuthContext } from './AuthContext';

/**
 * Custom hook to use the Auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
