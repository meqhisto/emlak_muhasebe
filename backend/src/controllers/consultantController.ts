import { Request, Response } from 'express';
import prisma from '../prisma';

export const getConsultants = async (req: Request, res: Response) => {
    try {
        const consultants = await prisma.consultant.findMany({
            orderBy: { fullName: 'asc' }
        });
        res.json(consultants);
    } catch (error) {
        res.status(500).json({ error: 'Danışmanlar alınırken bir hata oluştu.' });
    }
};

export const createConsultant = async (req: Request, res: Response) => {
    try {
        const consultant = await prisma.consultant.create({
            data: req.body
        });
        res.status(201).json(consultant);
    } catch (error) {
        res.status(500).json({ error: 'Danışman oluşturulurken bir hata oluştu.' });
    }
};

export const updateConsultant = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const consultant = await prisma.consultant.update({
            where: { id },
            data: req.body
        });
        res.json(consultant);
    } catch (error) {
        res.status(500).json({ error: 'Danışman güncellenirken bir hata oluştu.' });
    }
};

export const deleteConsultant = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.consultant.delete({ where: { id } });
        res.json({ message: 'Danışman başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Danışman silinirken bir hata oluştu.' });
    }
};
