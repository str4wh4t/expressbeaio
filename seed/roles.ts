import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding roles ...");

    // Array of roles to seed
    const roles = [
        { name: 'system', description: 'System role' },
        { name: 'admin', description: 'Admin role' },
        { name: 'operator', description: 'Operator role' }
    ];

    // Use createMany to seed all roles at once
    await prisma.role.createMany({
        data: roles,
        skipDuplicates: true, // Optional: Skip if the record already exists
    });

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
