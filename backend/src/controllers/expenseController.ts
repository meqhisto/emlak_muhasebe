import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { AuthRequest } from '../middleware/auth';

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { vendor: true }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Giderler alınırken bir hata oluştu.' });
    }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body, ['date']);
        const expense = await prisma.expense.create({
            data
        });
        res.status(201).json(expense);

        // Log success
        await createAuditLog(req, 'CREATE', 'EXPENSE', `Yeni Gider: ${expense.description} (${expense.amount} TL)`);
    } catch (error) {
        console.error("Expense creation error:", error);
        res.status(500).json({ error: 'Gider oluşturulurken bir hata oluştu.' });
    }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body, ['date']);
        const expense = await prisma.expense.update({
            where: { id },
            data
        });
        res.json(expense);

        // Log success
        await createAuditLog(req, 'UPDATE', 'EXPENSE', `Gider Güncellendi: ${expense.description} (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Gider güncellenirken bir hata oluştu.' });
    }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.expense.delete({ where: { id } });
        res.json({ message: 'Gider başarıyla silindi.' });

        // Log success
        await createAuditLog(req, 'DELETE', 'EXPENSE', `Gider Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Gider silinirken bir hata oluştu.' });
    }
};
