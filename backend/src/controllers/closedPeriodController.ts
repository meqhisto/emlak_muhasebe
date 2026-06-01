import { Request, Response } from 'express';
import prisma from '../prisma';
import { createAuditLog } from '../utils/logUtils';
import { AuthRequest } from '../middleware/auth';

export const getClosedPeriods = async (req: Request, res: Response) => {
    try {
        const periods = await prisma.closedPeriod.findMany({ orderBy: [{ year: 'desc' }, { month: 'desc' }] });
        res.json(periods);
    } catch (error) {
        res.status(500).json({ error: 'Kapalı dönemler alınırken hata oluştu.' });
    }
};

export const closePeriod = async (req: AuthRequest, res: Response) => {
    const { year, month, notes } = req.body;
    try {
        const period = await prisma.closedPeriod.create({
            data: { year: Number(year), month: Number(month), closedBy: req.user?.username ?? 'admin', notes }
        });
        res.status(201).json(period);
        const label = month === -1 ? `${year} tüm yılı` : `${year}/${String(Number(month) + 1).padStart(2, '0')}`;
        await createAuditLog(req, 'APPROVE', 'SYSTEM', `Dönem Kapatıldı: ${label}`);
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'Bu dönem zaten kapalı.' });
        res.status(500).json({ error: 'Dönem kapatılırken hata oluştu.' });
    }
};

export const openPeriod = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const period = await prisma.closedPeriod.findUnique({ where: { id } });
        if (!period) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
        await prisma.closedPeriod.delete({ where: { id } });
        res.json({ message: 'Dönem yeniden açıldı.' });
        await createAuditLog(req, 'RESET', 'SYSTEM', `Dönem Açıldı: ${period.year}/${period.month}`);
    } catch (error) {
        res.status(500).json({ error: 'Dönem açılırken hata oluştu.' });
    }
};
