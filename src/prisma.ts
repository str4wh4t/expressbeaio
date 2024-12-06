import { PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';

export const enhancePrisma = async (userId?: number) => {

    let prisma: PrismaClient;

    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }

    prisma = global.prisma;

    if (userId) {
        // Jika userId diberikan, lakukan pencarian user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }, // Pastikan roles ter-load
        });

        if (!user) {
            throw new Error("User not found");
        }

        return enhance(prisma, { user });
    }

    // Jika userId tidak diberikan, kembalikan PrismaClient yang di-enhance tanpa informasi user
    return enhance(prisma);
};
