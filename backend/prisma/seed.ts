import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const altanPassword = await bcrypt.hash('altan2026', 10);
    const suatPassword = await bcrypt.hash('suat2026', 10);
    const nalanPassword = await bcrypt.hash('nalan2026', 10);

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            name: 'Sistem Yöneticisi',
            role: 'ADMIN',
        },
    });

    await prisma.user.upsert({
        where: { username: 'altan' },
        update: {},
        create: {
            username: 'altan',
            password: altanPassword,
            name: 'Altan Bey',
            role: 'ADMIN',
        },
    });

    await prisma.user.upsert({
        where: { username: 'suat' },
        update: {},
        create: {
            username: 'suat',
            password: suatPassword,
            name: 'Suat Bey',
            role: 'ADMIN',
        },
    });

    await prisma.user.upsert({
        where: { username: 'nalan' },
        update: {},
        create: {
            username: 'nalan',
            password: nalanPassword,
            name: 'Nalan Hanım',
            role: 'STAFF',
        },
    });

    console.log('Seed users created successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
