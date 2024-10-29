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

    const superUser = await prisma.user.create({
        data: {
            name: 'Super',
            username: 'super',
            identity: '999',
            email: 'super@man.com',
            password: PASSWORD_LOGIN_DEFAULT
        }
    });

    const zenstack = enhance(prisma, { user: { id: superUser.id } });

    // Menambahkan user dengan role Admin
    const user = await zenstack.user.update({
        where: {
            id: superUser.id,
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