import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
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
        const transaction = await prisma.transaction.create({
            data
        });
        res.status(201).json(transaction);

        // Log success
        await createAuditLog(req, 'CREATE', 'TRANSACTION', `Yeni İşlem: ${transaction.propertyName} - ${transaction.customerName}`);
    } catch (error) {
        console.error("Transaction creation error:", error);
        res.status(500).json({ error: 'İşlem oluşturulurken bir hata oluştu.' });
    }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body, ['date']);
        const transaction = await prisma.transaction.update({
            where: { id },
            data
        });
        res.json(transaction);

        // Log success
        await createAuditLog(req, 'UPDATE', 'TRANSACTION', `İşlem Güncellendi: ${transaction.propertyName} (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'İşlem güncellenirken bir hata oluştu.' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.transaction.delete({ where: { id } });
        res.json({ message: 'İşlem başarıyla silindi.' });

        // Log success
        await createAuditLog(req, 'DELETE', 'TRANSACTION', `İşlem Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'İşlem silinirken bir hata oluştu.' });
    }
};
