import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createAuditLog = async (
    req: AuthRequest,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    module: 'TRANSACTION' | 'EXPENSE' | 'CONSULTANT' | 'PERSONNEL' | 'VENDOR' | 'SYSTEM' | 'SALARY',
    details: string
) => {
    try {
        const username = req.user?.username || 'Unknown';
        await prisma.systemLog.create({
            data: {
                user: username,
                action,
                module,
                details,
                date: new Date()
            }
        });
    } catch (error) {
        console.error('Audit log creation failed:', error);
    }
};
