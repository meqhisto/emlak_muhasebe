import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { checkPeriodClosed } from '../utils/periodUtils';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'desc' },
            include: { consultant: true }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'İşlemler alınırken bir hata oluştu.' });
    }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body, ['date']);

        const periodError = await checkPeriodClosed(data.date);
        if (periodError) return res.status(403).json({ error: periodError });

        const transaction = await prisma.transaction.create({ data });
        res.status(201).json(transaction);
        await createAuditLog(req, 'CREATE', 'TRANSACTION', `Yeni İşlem: ${transaction.propertyName} - ${transaction.customerName}`);
    } catch (error) {
        console.error('Transaction creation error:', error);
        res.status(500).json({ error: 'İşlem oluşturulurken bir hata oluştu.' });
    }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        // Mevcut kaydı al
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı.' });

        // Kapalı dönem kontrolü
        const periodError = await checkPeriodClosed(existing.date);
        if (periodError) return res.status(403).json({ error: periodError });

        const data = prepareData(req.body, ['date']);
        const transaction = await prisma.transaction.update({ where: { id }, data });
        res.json(transaction);
        await createAuditLog(req, 'UPDATE', 'TRANSACTION', `İşlem Güncellendi: ${transaction.propertyName} (ID: ${id})`);

        // Feature 1: Hakediş PAID olunca otomatik HAKEDIS gideri oluştur
        const wasUnpaid = existing.paymentStatus === 'BEKLIYOR';
        const isNowPaid = transaction.paymentStatus === 'ODENDI';
        if (wasUnpaid && isNowPaid) {
            const consultant = await prisma.consultant.findUnique({ where: { id: transaction.consultantId } });
            await prisma.expense.create({
                data: {
                    date: transaction.date,
                    category: 'HAKEDIS',
                    amount: transaction.consultantShare,
                    description: `Danışman Hakediş: ${consultant?.fullName ?? 'Bilinmiyor'} — ${transaction.propertyName}`,
                    paidBy: 'OFIS_KASASI',
                    isPaid: true,
                },
            });
            await createAuditLog(req, 'CREATE', 'EXPENSE',
                `Otomatik Hakediş Gideri: ${consultant?.fullName} — ${transaction.propertyName} (${transaction.consultantShare} TL)`);
        }
    } catch (error) {
        res.status(500).json({ error: 'İşlem güncellenirken bir hata oluştu.' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'İşlem bulunamadı.' });

        const periodError = await checkPeriodClosed(existing.date);
        if (periodError) return res.status(403).json({ error: periodError });

        await prisma.transaction.delete({ where: { id } });
        res.json({ message: 'İşlem başarıyla silindi.' });
        await createAuditLog(req, 'DELETE', 'TRANSACTION', `İşlem Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'İşlem silinirken bir hata oluştu.' });
    }
};
