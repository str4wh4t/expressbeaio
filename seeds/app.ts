import { PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';
import { PASSWORD_LOGIN_DEFAULT } from '../src/utils/constants';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding app ...");

    // Periksa atau buat role "system"
    let systemRole = await prisma.role.findUnique({
        where: { name: 'system' },
    });

    if (!systemRole) {
        systemRole = await prisma.role.create({
            data: { name: 'system', description: 'System role' }
        });
    }

    // Periksa atau buat permission "access-control"
    let systemPermissions = await prisma.permission.findUnique({
        where: { name: 'access-control' },
    });

    if (!systemPermissions) {
        systemPermissions = await prisma.permission.create({
            data: { name: 'access-control', description: 'Access control' }
        });
    }

    // Perbarui role dengan permission jika belum ada
    const existingRolePermission = await prisma.role.findUnique({
        where: { id: systemRole.id },
        include: { permissions: true },
    });

    if (!existingRolePermission?.permissions.some((perm) => perm.id === systemPermissions.id)) {
        await prisma.role.update({
            where: {
                id: systemRole.id,
            },
            data: {
                permissions: {
                    connect: { id: systemPermissions.id },
                },
            },
        });
    }

    // Periksa atau buat user "Super"
    let user = await prisma.user.findUnique({
        where: { email: 'super@man.com' },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: 'Super',
                username: 'super',
                identity: '999',
                email: 'super@man.com',
                password: '***'
            }
        })
    }

    const superUser = await prisma.user.findUnique({
        where: { id: 1 }, // << 1 is the id of the first user
        include: { roles: true }, // Pastikan roles ter-load
    });

    if (!superUser) {
        throw new Error("User not found");
    }

    const zenstack = enhance(prisma, { user: superUser });

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
    })

    if (!superUser?.roles.some((role) => role.id === systemRole.id)) {
        await zenstack.user.update({
            where: {
                id: user.id,
            },
            data: {
                roles: {
                    connect: [{ id: systemRole.id }],
                },
            }
        });
    }

    console.log(`Seeded users, roles, and permission for user: ${user.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
