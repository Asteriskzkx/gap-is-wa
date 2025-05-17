import { PrismaClient } from '@prisma/client'

export async function seedInspectionTypes(prisma: PrismaClient) {
    const types = [
        {
            id: 1,
            name: 'ตรวจประเมินสวนยางพาราก่อนเปิดกรีด',
            description: 'การตรวจประเมินมาตรฐานสวนยางพาราก่อนเปิดกรีด'
        },
        {
            id: 2,
            name: 'ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด',
            description: 'การตรวจประเมินมาตรฐานสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด'
        },
        {
            id: 3,
            name: 'ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตยางก้อนถ้วย',
            description: 'การตรวจประเมินมาตรฐานสวนยางพาราหลังเปิดกรีดและการผลิตยางก้อนถ้วย'
        }
    ];

    console.log(`Seeding inspection types...`);

    for (const type of types) {
        await prisma.inspectionTypeMaster.upsert({
            where: { inspectionTypeId: type.id },
            update: {},
            create: {
                inspectionTypeId: type.id,
                typeName: type.name,
                description: type.description
            }
        });
    }

    console.log(`Seeded ${types.length} inspection types`);
}