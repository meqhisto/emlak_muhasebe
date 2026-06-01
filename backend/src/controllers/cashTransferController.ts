import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { checkPeriodClosed } from '../utils/periodUtils';
import { AuthRequest } from '../middleware/auth';

export const getCashTransfers = async (req: Request, res: Response) => {
    try {
        const transfers = await prisma.cashTransfer.findMany({
            orderBy: { date: 'desc' },
        });
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: 'Transferler alınırken bir hata oluştu.' });
    }
};

export const createCashTransfer = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body, ['date']);

        const periodError = await checkPeriodClosed(data.date);
        if (periodError) return res.status(403).json({ error: periodError });

        const transfer = await prisma.cashTransfer.create({ data });
        res.status(201).json(transfer);

        const partyLabel: Record<string, string> = {
            OFIS_KASASI: 'Ofis Kasası',
            ALTAN: 'Altan',
            SUAT: 'Suat',
        };
        await createAuditLog(
            req,
            'CREATE',
            'SYSTEM',
            `Nakit Transfer: ${partyLabel[transfer.fromParty] ?? transfer.fromParty} → ${partyLabel[transfer.toParty] ?? transfer.toParty} (${transfer.amount} TL)`
        );
    } catch (error) {
        console.error('Cash transfer creation error:', error);
        res.status(500).json({ error: 'Transfer oluşturulurken bir hata oluştu.' });
    }
};

export const deleteCashTransfer = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const existing = await prisma.cashTransfer.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Transfer bulunamadı.' });

        const periodError = await checkPeriodClosed(existing.date);
        if (periodError) return res.status(403).json({ error: periodError });

        await prisma.cashTransfer.delete({ where: { id } });
        res.json({ message: 'Transfer başarıyla silindi.' });
        await createAuditLog(req, 'DELETE', 'SYSTEM', `Nakit Transfer Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Transfer silinirken bir hata oluştu.' });
    }
};
