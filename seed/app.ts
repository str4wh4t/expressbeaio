import { PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { PASSWORD_LOGIN_DEFAULT } from '../src/utils/constants';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding app ...");
    // Menambahkan role
    const systemRole = await prisma.role.create({
        data: { name: 'system', description: 'System role' }
    });

    const systemPermissions = await prisma.permission.create({
        data: { name: 'access-control', description: 'Access control' }
    });

    await prisma.role.update({
        where: {
            id: systemRole.id,
        },
        data: {
            permissions: {
                set: { id: systemPermissions.id },
            },
        }
    });

    await prisma.user.create({
        data: {
            name: 'Super',
            username: 'super',
            identity: '999',
            email: 'super@man.com',
            password: PASSWORD_LOGIN_DEFAULT
        }
    });

    const user = await (new PrismaClient()).user.findUnique({
        where: { id: 1 }, // << 1 is the id of the first user
        include: { roles: true }, // Pastikan roles ter-load
    });

    if (!user) {
        throw new Error("User not found");
    }

    const zenstack = enhance(prisma, { user });

    // Menambahkan user dengan role Admin
    await zenstack.user.update({
        where: {
            id: user.id,
        },
        data: {
            roles: {
                set: [{ id: systemRole.id }],
            },
            password: PASSWORD_LOGIN_DEFAULT
        }
    });

    console.log(`Seeded users, roles and permission for user : ${user.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });