import { Request, Response } from 'express';
import prisma from '../prisma';

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

export const createExpense = async (req: Request, res: Response) => {
    try {
        const expense = await prisma.expense.create({
            data: req.body
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Gider oluşturulurken bir hata oluştu.' });
    }
};

export const updateExpense = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const expense = await prisma.expense.update({
            where: { id },
            data: req.body
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Gider güncellenirken bir hata oluştu.' });
    }
};

export const deleteExpense = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.expense.delete({ where: { id } });
        res.json({ message: 'Gider başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Gider silinirken bir hata oluştu.' });
    }
};
