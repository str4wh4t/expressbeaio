import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seeding units ...");

    // Array of units to seed
    const units = [
        { codename: "010101", name: 'pusat', description: 'Unit pusat' },
        { codename: "010102", name: 'fakultas', description: 'Unit fakultas' },
        { codename: "010103", name: 'prodi', description: 'Unit prodi' }
    ];

    // Use createMany to seed all units at once
    await prisma.unit.createMany({
        data: units,
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
