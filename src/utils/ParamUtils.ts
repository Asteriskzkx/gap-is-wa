/**
 * ชุดฟังก์ชันสำหรับช่วยจัดการและแปลงค่าพารามิเตอร์ในแอปพลิเคชัน
 */

/**
 * แปลงค่าพารามิเตอร์เป็นตัวเลข
 * @param value ค่าที่ต้องการแปลง (อาจเป็น string หรือ number หรืออื่นๆ)
 * @returns ค่าที่แปลงเป็นตัวเลขแล้ว หรือ null ถ้าแปลงไม่ได้
 */
export function toNumber(value: any): number | null {
    if (value === null || value === undefined) {
        return null;
    }

    // ถ้าเป็นตัวเลขอยู่แล้ว ส่งคืนเลย
    if (typeof value === 'number') {
        return isNaN(value) ? null : value;
    }

    // ถ้าเป็น string ลองแปลงเป็นตัวเลข
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }

    // ประเภทข้อมูลอื่นๆ ส่งคืน null
    return null;
}

/**
 * แปลงค่าพารามิเตอร์เป็นเลขจำนวนเต็ม
 * @param value ค่าที่ต้องการแปลง (อาจเป็น string หรือ number หรืออื่นๆ)
 * @returns ค่าที่แปลงเป็นเลขจำนวนเต็มแล้ว หรือ null ถ้าแปลงไม่ได้
 */
export function toInteger(value: any): number | null {
    const num = toNumber(value);
    return num !== null ? Math.floor(num) : null;
}

/**
 * แปลงค่าพารามิเตอร์เป็น ID (เลขจำนวนเต็มที่มากกว่า 0)
 * @param value ค่าที่ต้องการแปลง
 * @returns ค่า ID ที่แปลงแล้วหรือ null ถ้าแปลงไม่ได้หรือค่าไม่ถูกต้อง
 */
export function toId(value: any): number | null {
    const num = toInteger(value);
    return num !== null && num > 0 ? num : null;
}

/**
 * ตรวจสอบว่าค่าเป็น ID ที่ถูกต้องหรือไม่ (เลขจำนวนเต็มที่มากกว่า 0)
 * @param value ค่าที่ต้องการตรวจสอบ
 * @returns true ถ้าเป็น ID ที่ถูกต้อง, false ถ้าไม่ถูกต้อง
 */
export function isValidId(value: any): boolean {
    return toId(value) !== null;
}

/**
 * แปลงค่าพารามิเตอร์เป็น ID และโยน error ถ้าค่าไม่ถูกต้อง
 * @param value ค่าที่ต้องการแปลง
 * @param paramName ชื่อพารามิเตอร์ (ใช้ในข้อความ error)
 * @returns ค่า ID ที่แปลงแล้ว
 * @throws Error ถ้าค่าไม่สามารถแปลงเป็น ID ที่ถูกต้องได้
 */
export function requireValidId(value: any, paramName: string = 'id'): number {
    const id = toId(value);
    if (id === null) {
        throw new Error(`Invalid ${paramName} format: ${value}`);
    }
    return id;
}