import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { checkPeriodClosed } from '../utils/periodUtils';
import { AuthRequest } from '../middleware/auth';

export const getSalaryPayments = async (req: Request, res: Response) => {
    try {
        const payments = await prisma.salaryPayment.findMany({
            include: { personnel: true },
            orderBy: { date: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Maaş ödemeleri alınırken bir hata oluştu.' });
    }
};

export const createSalaryPayment = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body, ['date']);

        const periodError = await checkPeriodClosed(data.date);
        if (periodError) return res.status(403).json({ error: periodError });

        const payment = await prisma.salaryPayment.create({
            data,
            include: { personnel: true }
        });
        res.status(201).json(payment);
        await createAuditLog(req, 'CREATE', 'SALARY',
            `Maaş Ödemesi: ${payment.personnel.fullName} — ${payment.period} (${payment.paidBy ?? 'OFIS_KASASI'})`);
    } catch (error) {
        console.error('Salary payment creation error:', error);
        res.status(500).json({ error: 'Maaş ödemesi oluşturulurken bir hata oluştu.' });
    }
};

export const deleteSalaryPayment = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const existing = await prisma.salaryPayment.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Maaş ödemesi bulunamadı.' });

        const periodError = await checkPeriodClosed(existing.date);
        if (periodError) return res.status(403).json({ error: periodError });

        await prisma.salaryPayment.delete({ where: { id } });
        res.json({ message: 'Maaş ödemesi başarıyla silindi.' });
        await createAuditLog(req, 'DELETE', 'SALARY', `Maaş Ödemesi Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Maaş ödemesi silinirken bir hata oluştu.' });
    }
};
