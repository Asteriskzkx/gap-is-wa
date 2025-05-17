import { PrismaClient } from '@prisma/client'

export async function seedRequirements(prisma: PrismaClient) {
    // ข้อกำหนดของรายการตรวจต่างๆ
    const requirements = [
        {
            id: 1,
            itemId: 1, // รายการตรวจ ที่ 1 : น้ำ ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 1,
            name: 'หากไม่ใช่น้ำฝน ต้องมาจากแหล่งที่ไม่มีการปนเปื้อนวัตถุอันตราย',
            level: 'ข้อกำหนดรอง',
            levelNo: '1.1'
        },
        {
            id: 2,
            itemId: 1, // รายการตรวจ ที่ 1 : น้ำ ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 2,
            name: 'มีการอนุรักษ์แหล่งน้ำ และสภาพแวดล้อม',
            level: 'ข้อแนะนำ',
            levelNo: '1.2'
        },
        {
            id: 3,
            itemId: 1, // รายการตรวจ ที่ 1 : น้ำ ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 3,
            name: 'เลือกแหล่งปลูกที่มีน้ำเพียงพอในการผลิตพืชให้มีคุณภาพ',
            level: 'ข้อแนะนำ',
            levelNo: '1.3'
        },
        {
            id: 4,
            itemId: 2, // รายการตรวจ ที่ 2 : พื้นที่ปลูก ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 1,
            name: 'พื้นที่ปลูกไม่มีการตกค้างของวัตถุอันตรายที่ส่งผลกระทบต่อการเจริญเติบโตของต้นยาง',
            level: 'ข้อกำหนดหลัก',
            levelNo: '2.1'
        },
        {
            id: 5,
            itemId: 2, // รายการตรวจ ที่ 2 : พื้นที่ปลูก ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 2,
            name: 'สภาพพื้นที่เป็นพื้นที่ราบหรือมีความลาดชันต่ำกว่า 35 องศา ถ้าความลาดชันเกิน 15 องศา ต้องทำขั้นบันได ความสูงจากระดับน้ำทะเลไม่เกิน 600 เมตร',
            level: 'ข้อกำหนดรอง',
            levelNo: '2.2'
        },
        {
            id: 6,
            itemId: 2, // รายการตรวจ ที่ 2 : พื้นที่ปลูก ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 3,
            name: 'หน้าดินควรมีความลึกไม่น้อยกว่า 1 เมตร ไม่เป็นพื้นที่ที่มีน้ำท่วมขัง หรือชั้นกรวดอัดแน่นในระดับต่ำกว่าผิวดิน 1 เมตร ดินมีการระบายน้ำดี',
            level: 'ข้อแนะนำ',
            levelNo: '2.3'
        },
        {
            id: 7,
            itemId: 2, // รายการตรวจ ที่ 2 : พื้นที่ปลูก ของการตรวจประเมินสวนยางพาราก่อนเปิดกรีด
            requirementNo: 4,
            name: 'ค่าความเป็นกรด - ด่าง (pH) ที่เหมาะสมอยู่ระหว่าง 4.5 - 5.5 ไม่เป็นดินเค็ม หรือดินเกลือ',
            level: 'ข้อกำหนดรอง',
            levelNo: '2.4'
        },





        // ข้อกำหนดอื่นๆ...
    ];

    console.log(`Seeding requirements...`);

    for (const req of requirements) {
        await prisma.requirementMaster.upsert({
            where: { requirementId: req.id },
            update: {},
            create: {
                requirementId: req.id,
                inspectionItemId: req.itemId,
                requirementNo: req.requirementNo,
                requirementName: req.name,
                requirementLevel: req.level,
                requirementLevelNo: req.levelNo
            }
        });
    }

    console.log(`Seeded ${requirements.length} requirements`);
}