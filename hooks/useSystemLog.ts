import { useCallback } from 'react';
import { SystemLog, User } from '../types';

export const useSystemLog = (currentUser: User | null) => {
    const logAction = useCallback((action: SystemLog['action'], description: string, moduleOverride?: SystemLog['module']) => {
        if (!currentUser) return;

        try {
            const newLog: SystemLog = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                user: currentUser.name,
                action: action,
                module: moduleOverride || 'SYSTEM',
                description: description
            };

            const storedLogs = localStorage.getItem('emlak_logs');
            let logs = storedLogs ? JSON.parse(storedLogs) : [];
            if (!Array.isArray(logs)) logs = [];
            localStorage.setItem('emlak_logs', JSON.stringify([newLog, ...logs]));
        } catch (e) {
            console.error("Logging failed", e);
        }
    }, [currentUser]);

    return { logAction };
};
