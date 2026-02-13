import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';

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
        const data = prepareData(req.body, ['startDate']);
        const consultant = await prisma.consultant.create({
            data
        });
        res.status(201).json(consultant);
    } catch (error) {
        console.error("Consultant creation error:", error);
        res.status(500).json({ error: 'Danışman oluşturulurken bir hata oluştu.' });
    }
};

export const updateConsultant = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body, ['startDate']);
        const consultant = await prisma.consultant.update({
            where: { id },
            data
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
