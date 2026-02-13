import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { AuthRequest } from '../middleware/auth';

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

export const createConsultant = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body, ['startDate']);
        const consultant = await prisma.consultant.create({
            data
        });
        res.status(201).json(consultant);

        // Log success
        await createAuditLog(req, 'CREATE', 'CONSULTANT', `Yeni Danışman Eklendi: ${consultant.fullName}`);
    } catch (error) {
        console.error("Consultant creation error:", error);
        res.status(500).json({ error: 'Danışman oluşturulurken bir hata oluştu.' });
    }
};

export const updateConsultant = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body, ['startDate']);
        const consultant = await prisma.consultant.update({
            where: { id },
            data
        });
        res.json(consultant);

        // Log success
        await createAuditLog(req, 'UPDATE', 'CONSULTANT', `Danışman Bilgileri Güncellendi: ${consultant.fullName} (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Danışman güncellenirken bir hata oluştu.' });
    }
};

export const deleteConsultant = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.consultant.delete({ where: { id } });
        res.json({ message: 'Danışman başarıyla silindi.' });

        // Log success
        await createAuditLog(req, 'DELETE', 'CONSULTANT', `Danışman Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Danışman silinirken bir hata oluştu.' });
    }
};
