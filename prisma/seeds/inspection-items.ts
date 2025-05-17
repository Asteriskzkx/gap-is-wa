import { PrismaClient } from '@prisma/client'

export async function seedInspectionItems(prisma: PrismaClient) {
    // ข้อมูลรายการตรวจของแต่ละประเภท
    const itemsType1 = [
        { id: 1, typeId: 1, itemNo: 1, name: 'น้ำ' },
        { id: 2, typeId: 1, itemNo: 2, name: 'พื้นที่ปลูก' },
        { id: 3, typeId: 1, itemNo: 3, name: 'วัตถุอันตรายทางการเกษตร' },
        { id: 4, typeId: 1, itemNo: 4, name: 'การจัดการคุณภาพในกระบวนการผลิตก่อนการเปิดกรีด' },
        { id: 5, typeId: 1, itemNo: 5, name: 'สุขลักษณะส่วนบุคคล' },
        { id: 6, typeId: 1, itemNo: 6, name: 'การบันทึกและการจัดเก็บข้อมูล' }
    ];

    const itemsType2 = [
        { id: 7, typeId: 2, itemNo: 1, name: 'น้ำ' },
        { id: 8, typeId: 2, itemNo: 2, name: 'พื้นที่ปลูก' },
        { id: 9, typeId: 2, itemNo: 3, name: 'วัตถุอันตรายทางการเกษตร' },
        { id: 10, typeId: 2, itemNo: 4, name: 'การจัดการคุณภาพในกระบวนการผลิตหลังการเปิดกรีด' },
        { id: 11, typeId: 2, itemNo: 5, name: 'การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตน้ำยางสด' },
        { id: 12, typeId: 2, itemNo: 6, name: 'การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตน้ำยางสด' },
        { id: 13, typeId: 2, itemNo: 7, name: 'สุขลักษณะส่วนบุคคล' },
        { id: 14, typeId: 2, itemNo: 8, name: 'การบันทึกและการจัดเก็บข้อมูล' }
    ];

    const itemsType3 = [
        { id: 15, typeId: 3, itemNo: 1, name: 'น้ำ' },
        { id: 16, typeId: 3, itemNo: 2, name: 'พื้นที่ปลูก' },
        { id: 17, typeId: 3, itemNo: 3, name: 'วัตถุอันตรายทางการเกษตร' },
        { id: 18, typeId: 3, itemNo: 4, name: 'การจัดการคุณภาพในกระบวนการผลิตหลังการเปิดกรีด' },
        { id: 19, typeId: 3, itemNo: 5, name: 'การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตยางก้อนถ้วย' },
        { id: 20, typeId: 3, itemNo: 6, name: 'การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตยางก้อนถ้วย' },
        { id: 21, typeId: 3, itemNo: 7, name: 'สุขลักษณะส่วนบุคคล' },
        { id: 22, typeId: 3, itemNo: 8, name: 'การบันทึกและการจัดเก็บข้อมูล' }
    ];

    // รวมรายการทั้งหมด
    const allItems = [...itemsType1, ...itemsType2, ...itemsType3];

    console.log(`Seeding inspection items...`);

    for (const item of allItems) {
        await prisma.inspectionItemMaster.upsert({
            where: { inspectionItemId: item.id },
            update: {},
            create: {
                inspectionItemId: item.id,
                inspectionTypeId: item.typeId,
                itemNo: item.itemNo,
                itemName: item.name
            }
        });
    }

    console.log(`Seeded ${allItems.length} inspection items`);
}