import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';

export const getPersonnel = async (req: Request, res: Response) => {
    try {
        const personnel = await prisma.personnel.findMany({
            orderBy: { fullName: 'asc' }
        });
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ error: 'Personel listesi alınırken bir hata oluştu.' });
    }
};

export const createPersonnel = async (req: Request, res: Response) => {
    try {
        const data = prepareData(req.body, ['startDate']);
        const personnel = await prisma.personnel.create({
            data
        });
        res.status(201).json(personnel);
    } catch (error) {
        console.error("Personnel creation error:", error);
        res.status(500).json({ error: 'Personel oluşturulurken bir hata oluştu.' });
    }
};

export const updatePersonnel = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body, ['startDate']);
        const personnel = await prisma.personnel.update({
            where: { id },
            data
        });
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ error: 'Personel güncellenirken bir hata oluştu.' });
    }
};

export const deletePersonnel = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.personnel.delete({ where: { id } });
        res.json({ message: 'Personel başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Personel silinirken bir hata oluştu.' });
    }
};
