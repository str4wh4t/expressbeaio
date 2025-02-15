import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding permissions ...");

    // Array of permissions to seed
    const permissions = [
        { name: 'access-control', description: 'Access control' },
    ];

    // Use createMany to seed all permissions at once
    await prisma.permission.createMany({
        data: permissions,
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
