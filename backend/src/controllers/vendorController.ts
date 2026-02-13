import { Request, Response } from 'express';
import prisma from '../prisma';

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

export const createVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await prisma.vendor.create({
            data: req.body
        });
        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ error: 'Firma oluşturulurken bir hata oluştu.' });
    }
};

export const updateVendor = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const vendor = await prisma.vendor.update({
            where: { id },
            data: req.body
        });
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: 'Firma güncellenirken bir hata oluştu.' });
    }
};

export const deleteVendor = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        await prisma.vendor.delete({ where: { id } });
        res.json({ message: 'Firma başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Firma silinirken bir hata oluştu.' });
    }
};
