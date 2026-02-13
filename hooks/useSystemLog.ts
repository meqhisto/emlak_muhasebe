import { useCallback } from 'react';
import { SystemLog, User } from '../types';
import api from '../services/api';

export const useSystemLog = (currentUser: User | null) => {
    const logAction = useCallback(async (action: SystemLog['action'], details: string, moduleOverride?: SystemLog['module']) => {
        if (!currentUser) return;

        try {
            const logData = {
                user: currentUser.username, // Send username string as expected by backend
                action: action,
                module: moduleOverride || 'SYSTEM',
                details: details
            };

            await api.post('/logs', logData);
        } catch (e) {
            console.error("Logging failed", e);
        }
    }, [currentUser]);

    return { logAction };
};
