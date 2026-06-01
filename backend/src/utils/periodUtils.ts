import prisma from '../prisma';

/**
 * Verilen tarih kapalı bir döneme ait mi kontrol eder.
 * Kapalıysa hata mesajı döner, değilse null.
 */
export const checkPeriodClosed = async (date: Date | string): Promise<string | null> => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11

    const closed = await prisma.closedPeriod.findFirst({
        where: {
            year,
            OR: [
                { month },   // o ay kapalı
                { month: -1 }, // tüm yıl kapalı
            ],
        },
    });

    if (closed) {
        const label = closed.month === -1
            ? `${year} yılı`
            : `${year}/${String(month + 1).padStart(2, '0')} dönemi`;
        return `${label} kapalıdır. Bu döneme ait kayıtlar düzenlenemez.`;
    }
    return null;
};
