import { Request, Response } from 'express';
import prisma from '../prisma';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { date: 'desc' },
            take: 100 // Limit to last 100 logs
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Loglar alınırken bir hata oluştu.' });
    }
};

export const createLog = async (req: Request, res: Response) => {
    try {
        const log = await prisma.systemLog.create({
            data: req.body
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Log oluşturulurken bir hata oluştu.' });
    }
};
