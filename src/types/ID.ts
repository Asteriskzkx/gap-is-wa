/**
 * ประเภทข้อมูลสำหรับ ID ต่างๆ ในระบบ
 * เพื่อให้มีความชัดเจนในการอ่านโค้ดและลดข้อผิดพลาดในการใช้งาน
 */

// ประเภทสำหรับ ID ทั่วไป (เลขจำนวนเต็มที่มากกว่า 0)
export type ID = number;

// ประเภทเฉพาะสำหรับ ID ของผู้ใช้
export type UserID = ID;

// ประเภทเฉพาะสำหรับ ID ของเกษตรกร
export type FarmerID = ID;

// ประเภทเฉพาะสำหรับ ID ของผู้ตรวจประเมิน
export type AuditorID = ID;

// ประเภทเฉพาะสำหรับ ID ของคณะกรรมการ
export type CommitteeID = ID;

// ประเภทเฉพาะสำหรับ ID ของผู้ดูแลระบบ
export type AdminID = ID;

/**
 * ช่วยเพิ่มความปลอดภัยในประเภทข้อมูลโดยสร้าง ID ใหม่จากค่าที่ให้มา
 * @param id ค่า ID ที่ต้องการแปลง
 * @returns ค่า ID ที่เป็นเลขจำนวนเต็ม
 */
export function createID(id: number): ID {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ID: ${id}. ID must be a positive integer.`);
  }
  return id;
}

/**
 * แปลงค่า string เป็น ID
 * @param idStr ค่า ID ในรูปแบบ string
 * @returns ค่า ID ที่แปลงแล้ว
 */
export function parseID(idStr: string): ID {
  const id = parseInt(idStr, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(
      `Invalid ID string: ${idStr}. ID must be a positive integer.`
    );
  }
  return id;
}
