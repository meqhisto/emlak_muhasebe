import { Request, Response } from 'express';
import prisma from '../prisma';
import { prepareData } from '../utils/dataUtils';
import { createAuditLog } from '../utils/logUtils';
import { AuthRequest } from '../middleware/auth';

export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Firmalar alınırken bir hata oluştu.' });
    }
};

export const createVendor = async (req: AuthRequest, res: Response) => {
    try {
        const data = prepareData(req.body);
        const vendor = await prisma.vendor.create({
            data
        });
        res.status(201).json(vendor);

        // Log success
        await createAuditLog(req, 'CREATE', 'VENDOR', `Yeni Firma Eklendi: ${vendor.name}`);
    } catch (error) {
        console.error("Vendor creation error:", error);
        res.status(500).json({ error: 'Firma oluşturulurken bir hata oluştu.' });
    }
};

export const updateVendor = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        const data = prepareData(req.body);
        const vendor = await prisma.vendor.update({
            where: { id },
            data
        });
        res.json(vendor);

        // Log success
        await createAuditLog(req, 'UPDATE', 'VENDOR', `Firma Bilgileri Güncellendi: ${vendor.name} (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Firma güncellenirken bir hata oluştu.' });
    }
};

export const deleteVendor = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.vendor.delete({ where: { id } });
        res.json({ message: 'Firma başarıyla silindi.' });

        // Log success
        await createAuditLog(req, 'DELETE', 'VENDOR', `Firma Silindi (ID: ${id})`);
    } catch (error) {
        res.status(500).json({ error: 'Firma silinirken bir hata oluştu.' });
    }
};
