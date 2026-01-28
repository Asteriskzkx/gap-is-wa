// tests/farmerApplicationsNew/farmerApplicationsNew.spec.js (Playwright E2E Tests)
import { expect, test } from "@playwright/test";

// ข้อมูลผู้ใช้สำหรับการทดสอบ
const TEST_USER = {
  email: process.env.E2E_TEST_USER_EMAIL,
  password: process.env.E2E_TEST_USER_PASSWORD,
};

// Helper function สำหรับ login
async function loginAsFarmer(page) {
  await page.goto("/");

  // เลือก Role เกษตรกร
  await page.click('button:has-text("เกษตรกร")');

  // กรอกข้อมูลเข้าสู่ระบบ
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);

  // กดปุ่มเข้าสู่ระบบ
  await page.click('button:has-text("เข้าสู่ระบบ")');

  // รอให้เข้าสู่ระบบสำเร็จ
  await page.waitForURL(/\/farmer/, { timeout: 20000 });
}

test.describe("1. Form Validation - Step 1: ข้อมูลสวนยาง", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // Login ก่อนทุก test
    await loginAsFarmer(page);
    // ไปที่หน้ายื่นขอใบรับรอง
    await page.goto("/farmer/applications/new");
    // รอให้หน้าโหลดเสร็จ
    await expect(
      page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-001: ไม่กรอกหมู่บ้าน/ชุมชน", async ({ page }) => {
    // ไม่กรอกหมู่บ้าน/ชุมชน
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-002: ไม่กรอกหมู่ที่", async ({ page }) => {
    // กรอกหมู่บ้าน
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");

    // ไม่กรอกหมู่ที่
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-003: กรอกหมู่ที่ 1", async ({ page }) => {
    // กรอกหมู่ที่ 1 เท่านั้น
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("1");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-004: ไม่กรอกถนน", async ({ page }) => {
    // กรอกข้อมูลอื่น
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");

    // ไม่กรอกถนน
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-005: ไม่กรอกซอย", async ({ page }) => {
    // กรอกข้อมูลอื่น
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");

    // ไม่กรอกซอย
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-006: ไม่เลือกรูปแบบการจำหน่ายผลผลิต", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // ไม่เลือกรูปแบบการจำหน่าย
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-007: เลือกรูปแบบการจำหน่าย: ก่อนเปิดกรีด", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย: ก่อนเปิดกรีด
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("ก่อนเปิดกรีด")');

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(page.locator('[id*="productDistributionType"]')).toContainText(
      "ก่อนเปิดกรีด",
    );
  });

  test("TC-008: เลือกรูปแบบการจำหน่าย: น้ำยางสด", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย: น้ำยางสด
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(page.locator('[id*="productDistributionType"]')).toContainText(
      "น้ำยางสด",
    );
  });

  test("TC-009: เลือกรูปแบบการจำหน่าย: ยางก้อนถ้วย", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย: ยางก้อนถ้วย
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("ยางก้อนถ้วย")');

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(page.locator('[id*="productDistributionType"]')).toContainText(
      "ยางก้อนถ้วย",
    );
  });

  test("TC-010: ไม่เลือกจังหวัด", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // ไม่เลือกจังหวัด
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-011: เลือกจังหวัด", async ({ page }) => {
    // เลือกจังหวัด: สงขลา
    await page.click('[id*="provinceId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าถูก set ก่อนตรวจสอบ
    await page.waitForTimeout(500);

    // ตรวจสอบว่าระบบยอมรับข้อมูล และแสดงรายการอำเภอของสงขลา
    await expect(page.locator('[id*="provinceId"] input')).toHaveValue("สงขลา");

    // รอให้ dropdown อำเภอพร้อมใช้งาน
    await page.waitForTimeout(2000);
    await page.waitForSelector('[id*="amphureId"] button:not([disabled])', {
      timeout: 10000,
    });

    // ตรวจสอบว่า dropdown อำเภอไม่ถูก disable
    const amphureDropdown = page.locator('[id*="amphureId"]');
    await expect(amphureDropdown).not.toBeDisabled();
  });

  test("TC-012: ไม่เลือกอำเภอ/เขต", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // เลือกจังหวัด
    await page.click('[id*="provinceId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าจังหวัดถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="provinceId"] input'), {
      timeout: 5000,
    }).toHaveValue("สงขลา");

    // ไม่เลือกอำเภอ/เขต
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-013: เลือกอำเภอ/เขต", async ({ page }) => {
    // เลือกจังหวัด: สงขลา
    await page.click('[id*="provinceId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าจังหวัดถูก set ก่อน (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="provinceId"] input'), {
      timeout: 5000,
    }).toHaveValue("สงขลา");

    // รอให้ dropdown อำเภอพร้อมใช้งาน
    await page.waitForTimeout(2000);
    await page.waitForSelector('[id*="amphureId"] button:not([disabled])', {
      timeout: 10000,
    });

    // เลือกอำเภอ/เขต: หาดใหญ่
    await page.click('[id*="amphureId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าถูก set ก่อนตรวจสอบ
    await page.waitForTimeout(500);

    // ตรวจสอบว่าระบบยอมรับข้อมูล และแสดงรายการตำบลของหาดใหญ่
    await expect(page.locator('[id*="amphureId"] input')).toHaveValue(
      "หาดใหญ่",
    );

    // รอให้ dropdown ตำบลพร้อมใช้งาน
    await page.waitForTimeout(2000);
    await page.waitForSelector('[id*="tambonId"] button:not([disabled])', {
      timeout: 10000,
    });

    // ตรวจสอบว่า dropdown ตำบลไม่ถูก disable
    const tambonDropdown = page.locator('[id*="tambonId"]');
    await expect(tambonDropdown).not.toBeDisabled();
  });

  test("TC-014: ไม่เลือกตำบล/แขวง", async ({ page }) => {
    // กรอกข้อมูลที่อยู่
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // เลือกจังหวัด
    await page.click('[id*="provinceId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าจังหวัดถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="provinceId"] input'), {
      timeout: 5000,
    }).toHaveValue("สงขลา");

    // รอให้ dropdown อำเภอพร้อมใช้งาน
    await page.waitForTimeout(2000);

    // เลือกอำเภอ/เขต
    await page.click('[id*="amphureId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าอำเภอถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="amphureId"] input'), {
      timeout: 5000,
    }).toHaveValue("หาดใหญ่");

    // ไม่เลือกตำบล/แขวง
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณากรอกข้อมูลสวนยางให้ครบถ้วน"),
    ).toBeVisible();
  });

  test("TC-015: เลือกตำบล/แขวง", async ({ page }) => {
    // เลือกจังหวัด: สงขลา
    await page.click('[id*="provinceId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าจังหวัดถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="provinceId"] input'), {
      timeout: 5000,
    }).toHaveValue("สงขลา");

    // รอให้ dropdown อำเภอพร้อมใช้งาน
    await page.waitForTimeout(2000);
    await page.waitForSelector('[id*="amphureId"] button:not([disabled])', {
      timeout: 10000,
    });

    // เลือกอำเภอ/เขต: หาดใหญ่
    await page.click('[id*="amphureId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าอำเภอถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="amphureId"] input'), {
      timeout: 5000,
    }).toHaveValue("หาดใหญ่");

    // รอให้ dropdown ตำบลพร้อมใช้งาน
    await page.waitForTimeout(2000);
    await page.waitForSelector('[id*="tambonId"] button:not([disabled])', {
      timeout: 10000,
    });

    // เลือกตำบล/แขวง: หาดใหญ่
    await page.click('[id*="tambonId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าถูก set ก่อนตรวจสอบ
    await page.waitForTimeout(500);

    // ตรวจสอบว่าระบบยอมรับข้อมูล และอัปเดตตำบล/อำเภอ/จังหวัดอัตโนมัติ
    await expect(page.locator('[id*="tambonId"] input')).toHaveValue("หาดใหญ่");
  });

  test("TC-016: ไม่ระบุตำแหน่งที่ตั้งสวนยาง", async ({ page }) => {
    // กรอกข้อมูลที่อยู่ครบ
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // เลือกจังหวัด
    await page.click('[id*="provinceId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("สงขลา")');
    await page.waitForTimeout(1000);

    // เลือกอำเภอ/เขต
    await page.click('[id*="amphureId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');
    await page.waitForTimeout(1000);

    // เลือกตำบล/แขวง
    await page.click('[id*="tambonId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // ไม่เลือกตำแหน่งบนแผนที่ (ใช้ค่าเริ่มต้น: กรุงเทพฯ [100.523186, 13.736717])
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=กรุณาคลิกบนแผนที่เพื่อระบุตำแหน่งสวนยางของคุณ"),
    ).toBeVisible();
  });

  test("TC-017: กรอกข้อมูล Step 1 ครบถ้วนถูกต้อง", async ({ page }) => {
    // กรอกหมู่บ้าน/ชุมชน
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");

    // กรอกหมู่ที่
    const mooInput = page.locator('input[name="moo"]');
    await mooInput.fill("5");

    // กรอกถนน
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");

    // กรอกซอย
    await page.fill('input[name="alley"]', "ซอย 10");

    // เลือกรูปแบบการจำหน่าย: น้ำยางสด
    await page.click('[id*="productDistributionType"]');
    await page.click('li:has-text("น้ำยางสด")');

    // เลือกจังหวัด
    await page.click('[id*="provinceId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("สงขลา")');

    // รอให้ค่าจังหวัดถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="provinceId"] input'), {
      timeout: 5000,
    }).toHaveValue("สงขลา");

    await page.waitForTimeout(2000);

    // เลือกอำเภอ/เขต
    await page.click('[id*="amphureId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าอำเภอถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="amphureId"] input'), {
      timeout: 5000,
    }).toHaveValue("หาดใหญ่");

    await page.waitForTimeout(2000);

    // เลือกตำบล/แขวง
    await page.click('[id*="tambonId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("หาดใหญ่")');

    // รอให้ค่าตำบลถูก set (แก้ race condition)
    await page.waitForTimeout(500);
    await expect(page.locator('[id*="tambonId"] input'), {
      timeout: 5000,
    }).toHaveValue("หาดใหญ่");

    // เลือกตำแหน่งบนแผนที่ (คลิกกลางแผนที่)
    const mapContainer = page.locator(".leaflet-container");
    await mapContainer.click({ position: { x: 200, y: 200 } });

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าไปยังหน้า Step 2 รายละเอียดการปลูก
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" }),
    ).toBeVisible({ timeout: 10000 });
  });
});

// Helper function สำหรับกรอก Step 1 ให้สำเร็จ
async function completeStep1(page) {
  await page.goto("/farmer/applications/new");
  await expect(
    page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
  ).toBeVisible({ timeout: 10000 });

  // กรอกข้อมูลสวนยาง
  await page.fill('input[name="villageName"]', "หมู่บ้านสวนยางทดสอบ");
  const mooInput = page.locator('input[name="moo"]');
  await mooInput.click();
  await mooInput.clear();
  await mooInput.pressSequentially("5");
  await page.fill('input[name="road"]', "ถนนทดสอบ");
  await page.fill('input[name="alley"]', "ซอยทดสอบ");

  // เลือกรูปแบบการจำหน่าย
  await page.click('[id*="productDistributionType"]');
  await page.click('li:has-text("น้ำยางสด")');

  // เลือกที่อยู่
  const provinceInput = page.locator('[id*="provinceId"] input');
  await page.click('[id*="provinceId"] button', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.click('[role="option"]:has-text("สงขลา")');
  await page.keyboard.press("Escape");
  await expect(provinceInput).toHaveValue("สงขลา", { timeout: 30000 });

  const amphureInput = page.locator('[id*="amphureId"] input');
  await page.click('[id*="amphureId"] button', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.click('[role="option"]:has-text("หาดใหญ่")');
  await page.keyboard.press("Escape");
  await expect(amphureInput).toHaveValue("หาดใหญ่", { timeout: 30000 });

  const tambonInput = page.locator('[id*="tambonId"] input');
  await page.click('[id*="tambonId"] button', { timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.click('[role="option"]:has-text("หาดใหญ่")');
  await page.keyboard.press("Escape");
  await expect(tambonInput).toHaveValue("หาดใหญ่", { timeout: 30000 });

  // คลิกบนแผนที่
  const mapContainer = page.locator(".leaflet-container");
  await mapContainer.waitFor({ state: "visible", timeout: 10000 });
  await mapContainer.click({ position: { x: 100, y: 100 } });
  await page.waitForTimeout(500);

  // กดปุ่มถัดไป
  await page.click('button:has-text("ถัดไป")');

  // รอให้ไปยัง Step 2
  await expect(
    page.getByRole("heading", { name: "รายละเอียดการปลูก" }),
  ).toBeVisible({ timeout: 10000 });
}

test.describe("2. Form Validation - Step 2: รายละเอียดการปลูก", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // Login ก่อนทุก test
    await loginAsFarmer(page);
  });

  test("TC-018: ไม่เลือกพันธุ์ยางพารา", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // ไม่เลือกพันธุ์ยางพารา
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณาเลือกพันธุ์ยางพารา"),
    ).toBeVisible();
  });

  test("TC-019: เลือกพันธุ์ยางพารา: RRIT 251", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์ยางพารา: RRIT 251
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // รอให้ค่าถูก set ก่อนตรวจสอบ
    await page.waitForTimeout(500);

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(page.locator('[id*="specie"] input')).toHaveValue("RRIT 251");
  });

  test("TC-020: ไม่กรอกพื้นที่แปลง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์ยางพารา
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // ไม่กรอกพื้นที่แปลง
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกพื้นที่แปลง"),
    ).toBeVisible();
  });

  test("TC-021: กรอกพื้นที่แปลง 0", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์ยางพารา
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // กรอกพื้นที่แปลง 0 (ใช้ id selector เพราะ PrimaryInputNumber ใช้ inputId)
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.fill("0");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกพื้นที่แปลงให้ถูกต้อง"),
    ).toBeVisible();
  });

  test("TC-022: กรอกพื้นที่แปลงถูกต้อง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์ยางพารา
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // กรอกพื้นที่แปลง
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(areaInput).toHaveValue("10.5");
  });

  test("TC-023: ไม่กรอกจำนวนต้นยางทั้งหมด", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์และกรอกพื้นที่
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");

    // ไม่กรอกจำนวนต้นยางทั้งหมด
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกจำนวนต้นยางทั้งหมด"),
    ).toBeVisible();
  });

  test("TC-024: กรอกจำนวนต้นยางทั้งหมด 0", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์และกรอกพื้นที่
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");

    // กรอกจำนวนต้นยางทั้งหมด 0
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("0");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกจำนวนต้นยางทั้งหมดให้ถูกต้อง"),
    ).toBeVisible();
  });

  test("TC-025: กรอกจำนวนต้นยางทั้งหมดถูกต้อง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // เลือกพันธุ์และกรอกพื้นที่
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");

    // กรอกจำนวนต้นยางทั้งหมด
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(numberOfRubberInput).toHaveValue("500");
  });

  test("TC-026: ไม่กรอกจำนวนต้นยางที่กรีดได้", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกพันธุ์, พื้นที่, จำนวนต้นยาง
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");

    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");

    // ไม่กรอกจำนวนต้นยางที่กรีดได้
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกจำนวนต้นกรีดที่กรีดได้"),
    ).toBeVisible();
  });

  test("TC-027: กรอกจำนวนต้นยางที่กรีดได้ 0", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลอื่น
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");

    // กรอกจำนวนต้นยางที่กรีดได้ 0
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("0");

    // ตรวจสอบว่าระบบยอมรับข้อมูล (0 คือต้นยางยังเล็ก)
    await expect(numberOfTappingInput).toHaveValue("0");
  });

  test("TC-028: กรอกจำนวนต้นยางที่กรีดได้ถูกต้อง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลอื่น
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");

    // กรอกจำนวนต้นยางที่กรีดได้
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(numberOfTappingInput).toHaveValue("400");
  });

  test("TC-029: ไม่กรอกอายุต้นยาง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลอื่น
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");

    // ไม่กรอกอายุต้นยาง
    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(
      page.locator("text=รายการที่ 1: กรุณากรอกอายุต้นยาง"),
    ).toBeVisible();
  });

  test("TC-030: กรอกอายุต้นยาง 0", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลอื่น
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");

    // กรอกอายุต้นยาง 0
    const ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("0");

    // ตรวจสอบว่าระบบยอมรับข้อมูล (0 คือต้นยางที่เพิ่งปลูกใหม่)
    await expect(ageOfRubberInput).toHaveValue("0");
  });

  test("TC-031: กรอกอายุต้นยางถูกต้อง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลอื่น
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");

    // กรอกอายุต้นยาง
    const ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("8");

    // ตรวจสอบว่าระบบยอมรับข้อมูล
    await expect(ageOfRubberInput).toHaveValue("8");
  });

  test("TC-032: กรอกข้อมูลรายการที่ 1 ครบถ้วนถูกต้อง", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกข้อมูลรายละเอียดการปลูก
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");
    const ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("8");

    // รอให้ UI อัปเดตและ scroll ให้เห็น yearOfTapping input
    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .first()
      .scrollIntoViewIfNeeded();

    // เลือกปีที่เริ่มกรีด - รอให้ Calendar component พร้อม
    await page.waitForTimeout(300);
    const yearInputWrapper = page.locator('[id*="yearOfTapping"]').first();
    await yearInputWrapper.waitFor({ state: "visible", timeout: 5000 });

    // คลิกที่ปุ่ม calendar icon เพื่อเปิด year picker
    const calendarButton = yearInputWrapper.locator("button").first();
    await calendarButton.click();

    // รอให้ year picker panel เปิดขึ้นมา
    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });

    // เลือกปี 2020
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2020")');

    // รอให้ panel ปิด
    await page.waitForTimeout(300);

    // เลือกเดือนที่เริ่มกรีด
    await page.click('[id*="monthOfTapping"]');
    await page.click('li:has-text("มกราคม")');

    // กรอกผลผลิตรวม
    const totalProductionInput = page
      .locator('input[id*="totalProduction"]')
      .first();
    await totalProductionInput.click();
    await totalProductionInput.clear();
    await totalProductionInput.pressSequentially("1500.50");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าไปยังหน้า Step 3 ยืนยันข้อมูล
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-033: กดปุ่มเพิ่มรายการปลูก", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกรายการที่ 1 ครบถ้วน
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    const areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    const numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    const numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");
    const ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("8");

    // กดปุ่มเพิ่มรายการปลูก
    await page.click('button:has-text("เพิ่มรายการปลูก")');

    // ตรวจสอบว่ามีรายการที่ 2 ปรากฏ
    await expect(page.locator("text=รายการที่ 2")).toBeVisible();
  });

  test("TC-034: กรอก 2 รายการปลูก", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกรายการที่ 1
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    let areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    let numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    let numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");
    let ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("8");

    // รอให้ UI อัปเดตและ scroll ให้เห็น yearOfTapping input
    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .first()
      .scrollIntoViewIfNeeded();

    // เลือกปีที่เริ่มกรีด - รอให้ Calendar component พร้อม
    await page.waitForTimeout(300);
    let yearInputWrapper = page.locator('[id*="yearOfTapping"]').first();
    await yearInputWrapper.waitFor({ state: "visible", timeout: 5000 });

    // คลิกที่ปุ่ม calendar icon เพื่อเปิด year picker
    let calendarButton = yearInputWrapper.locator("button").first();
    await calendarButton.click();

    // รอให้ year picker panel เปิดขึ้นมา
    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });

    // เลือกปี 2020
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2020")');

    // รอให้ panel ปิด
    await page.waitForTimeout(300);
    await page.click('[id*="monthOfTapping"]');
    await page.click('li:has-text("มกราคม")');
    let totalProductionInput = page
      .locator('input[id*="totalProduction"]')
      .first();
    await totalProductionInput.click();
    await totalProductionInput.clear();
    await totalProductionInput.pressSequentially("1500.50");

    // กดปุ่มเพิ่มรายการปลูก
    await page.click('button:has-text("เพิ่มรายการปลูก")');

    // รอให้รายการที่ 2 ปรากฏ
    await page.waitForSelector("text=รายการที่ 2", { timeout: 5000 });
    await page.waitForTimeout(500);

    // กรอกรายการที่ 2
    const allSpecieDropdowns = page.locator('[id*="specie"]');
    await allSpecieDropdowns
      .nth(1)
      .waitFor({ state: "visible", timeout: 5000 });
    const secondSpecieButton = allSpecieDropdowns.nth(1).locator("button");
    await secondSpecieButton.click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIM 600")');
    areaInput = page.locator('input[id*="areaOfPlot"]').nth(1);
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("8.5");
    numberOfRubberInput = page.locator('input[id*="numberOfRubber"]').nth(1);
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("300");
    numberOfTappingInput = page.locator('input[id*="numberOfTapping"]').nth(1);
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("250");
    ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').nth(1);
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("6");

    // รอให้ UI อัปเดตและ scroll ให้เห็น yearOfTapping input ของรายการที่ 2
    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .nth(1)
      .scrollIntoViewIfNeeded();

    // เลือกปีที่เริ่มกรีดของรายการที่ 2
    await page.waitForTimeout(300);
    yearInputWrapper = page.locator('[id*="yearOfTapping"]').nth(1);
    await yearInputWrapper.waitFor({ state: "visible", timeout: 5000 });

    calendarButton = yearInputWrapper.locator("button").first();
    await calendarButton.click();

    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2022")');
    await page.waitForTimeout(300);

    const allMonthDropdowns = page.locator('[id*="monthOfTapping"]');
    await allMonthDropdowns.nth(1).click();
    await page.click('li:has-text("มิถุนายน")');
    totalProductionInput = page.locator('input[id*="totalProduction"]').nth(1);
    await totalProductionInput.click();
    await totalProductionInput.clear();
    await totalProductionInput.pressSequentially("900.25");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าไปยังหน้า Step 3 และแสดงรายการทั้ง 2
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=รายการที่ 1")).toBeVisible();
    await expect(page.locator("text=รายการที่ 2")).toBeVisible();
  });

  test("TC-035: กรอกรายการที่ 1 ครบ แต่รายการที่ 2 ไม่ครบ", async ({
    page,
  }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกรายการที่ 1 ครบถ้วน
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');
    let areaInput = page.locator('input[id*="areaOfPlot"]').first();
    await areaInput.click();
    await areaInput.clear();
    await areaInput.pressSequentially("10.5");
    let numberOfRubberInput = page
      .locator('input[id*="numberOfRubber"]')
      .first();
    await numberOfRubberInput.click();
    await numberOfRubberInput.clear();
    await numberOfRubberInput.pressSequentially("500");
    let numberOfTappingInput = page
      .locator('input[id*="numberOfTapping"]')
      .first();
    await numberOfTappingInput.click();
    await numberOfTappingInput.clear();
    await numberOfTappingInput.pressSequentially("400");
    let ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
    await ageOfRubberInput.click();
    await ageOfRubberInput.clear();
    await ageOfRubberInput.pressSequentially("8");

    // รอให้ UI อัปเดตและ scroll ให้เห็น yearOfTapping input
    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .first()
      .scrollIntoViewIfNeeded();

    // เลือกปีที่เริ่มกรีด - รอให้ Calendar component พร้อม
    await page.waitForTimeout(300);
    let yearInputWrapper = page.locator('[id*="yearOfTapping"]').first();
    await yearInputWrapper.waitFor({ state: "visible", timeout: 5000 });

    // คลิกที่ปุ่ม calendar icon เพื่อเปิด year picker
    let calendarButton = yearInputWrapper.locator("button").first();
    await calendarButton.click();

    // รอให้ year picker panel เปิดขึ้นมา
    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });

    // เลือกปี 2020
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2020")');

    // รอให้ panel ปิด
    await page.waitForTimeout(300);
    await page.click('[id*="monthOfTapping"]');
    await page.click('li:has-text("มกราคม")');
    let totalProductionInput = page
      .locator('input[id*="totalProduction"]')
      .first();
    await totalProductionInput.click();
    await totalProductionInput.clear();
    await totalProductionInput.pressSequentially("1500.50");

    // กดปุ่มเพิ่มรายการปลูก
    await page.click('button:has-text("เพิ่มรายการปลูก")');

    // กรอกรายการที่ 2 ไม่ครบ (เฉพาะพันธุ์)
    const allSpecieDropdowns = page.locator('[id*="specie"]');
    await allSpecieDropdowns.nth(1).locator("button").click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIM 600")');

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าแสดงข้อความเตือน
    await expect(page.locator("text=รายการที่ 2: กรุณา")).toBeVisible();
  });

  test("TC-036: กดปุ่มลบรายการ (มีเพียง 1 รายการ)", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกรายการที่ 1
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // ตรวจสอบว่าไม่แสดงปุ่มลบรายการ (เพราะมีเพียง 1 รายการ)
    const deleteButtons = page.locator('button:has-text("ลบรายการ")');
    await expect(deleteButtons).toHaveCount(0);
  });

  test("TC-037: กดปุ่มลบรายการ (มี 2 รายการ)", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กรอกรายการที่ 1
    await page.click('[id*="specie"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIT 251")');

    // กดปุ่มเพิ่มรายการปลูก
    await page.click('button:has-text("เพิ่มรายการปลูก")');

    // ตรวจสอบว่ามี 2 รายการ
    await expect(page.locator("text=รายการที่ 2")).toBeVisible();

    // กดปุ่มลบรายการที่ 2
    await page.click('button:has-text("ลบรายการ")');

    // ตรวจสอบว่าลบรายการที่ 2 สำเร็จ
    await expect(page.locator("text=รายการที่ 2")).not.toBeVisible();
  });

  test("TC-038: กดปุ่มย้อนกลับจาก Step 2", async ({ page }) => {
    // ดำเนินการ Step 1 ให้สำเร็จ
    await completeStep1(page);

    // กดปุ่มย้อนกลับ
    await page.click('button:has-text("ย้อนกลับ")');

    // ตรวจสอบว่ากลับไป Step 1
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง" }),
    ).toBeVisible({ timeout: 10000 });

    // ตรวจสอบว่าข้อมูลที่กรอกไว้ยังคงอยู่
    await expect(page.locator('input[name="villageName"]')).toHaveValue(
      "หมู่บ้านสวนยางทดสอบ",
    );
  });
});

// Helper function สำหรับกรอก Step 2 ให้สำเร็จ
async function completeStep2(page) {
  // กรอกรายการปลูก 1 รายการ
  await page.click('[id*="specie"] button');
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.click('[role="option"]:has-text("RRIT 251")');

  const areaInput = page.locator('input[id*="areaOfPlot"]').first();
  await areaInput.click();
  await areaInput.clear();
  await areaInput.pressSequentially("10.5");

  const numberOfRubberInput = page
    .locator('input[id*="numberOfRubber"]')
    .first();
  await numberOfRubberInput.click();
  await numberOfRubberInput.clear();
  await numberOfRubberInput.pressSequentially("500");

  const numberOfTappingInput = page
    .locator('input[id*="numberOfTapping"]')
    .first();
  await numberOfTappingInput.click();
  await numberOfTappingInput.clear();
  await numberOfTappingInput.pressSequentially("400");

  const ageOfRubberInput = page.locator('input[id*="ageOfRubber"]').first();
  await ageOfRubberInput.click();
  await ageOfRubberInput.clear();
  await ageOfRubberInput.pressSequentially("8");

  // รอให้ UI อัปเดตและ scroll ให้เห็น yearOfTapping input
  await page.waitForTimeout(500);
  await page
    .locator('label[for*="yearOfTapping"]')
    .first()
    .scrollIntoViewIfNeeded();

  // เลือกปีที่เริ่มกรีด
  await page.waitForTimeout(300);
  const yearInputWrapper = page.locator('[id*="yearOfTapping"]').first();
  await yearInputWrapper.waitFor({ state: "visible", timeout: 5000 });

  const calendarButton = yearInputWrapper.locator("button").first();
  await calendarButton.click();

  await page.waitForSelector(".p-yearpicker", { timeout: 5000 });
  await page.click('.p-yearpicker .p-yearpicker-year:has-text("2020")');
  await page.waitForTimeout(300);

  // เลือกเดือนที่เริ่มกรีด
  await page.click('[id*="monthOfTapping"]');
  await page.click('li:has-text("มกราคม")');

  // กรอกผลผลิตรวม
  const totalProductionInput = page
    .locator('input[id*="totalProduction"]')
    .first();
  await totalProductionInput.click();
  await totalProductionInput.clear();
  await totalProductionInput.pressSequentially("1500.50");

  // กดปุ่มถัดไป
  await page.click('button:has-text("ถัดไป")');

  // รอให้ไปยัง Step 3
  await expect(page.getByRole("heading", { name: "ยืนยันข้อมูล" })).toBeVisible(
    { timeout: 10000 },
  );
}

test.describe("3. Form Validation - Step 3: ยืนยันข้อมูล", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    // Login และเข้าสู่ระบบ
    await loginAsFarmer(page);

    // ผ่าน Step 1 และ Step 2
    await completeStep1(page);
    await completeStep2(page);
  });

  test("TC-039: แสดงสรุปข้อมูลสวนยาง", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // ตรวจสอบ section ข้อมูลสวนยาง
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง" }),
    ).toBeVisible();

    // ตรวจสอบข้อมูลที่แสดง
    await expect(page.locator("text=หมู่บ้าน/ชุมชน")).toBeVisible();
    await expect(page.locator("text=หมู่บ้านสวนยางทดสอบ")).toBeVisible();
    await expect(page.locator("text=หมู่ที่")).toBeVisible();
    await expect(page.getByText("5", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("ถนน", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=ถนนทดสอบ")).toBeVisible();
    await expect(page.getByText("ซอย", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=ซอยทดสอบ")).toBeVisible();
    await expect(page.locator("text=ตำบล/แขวง")).toBeVisible();
    await expect(page.locator("text=อำเภอ/เขต")).toBeVisible();
    await expect(page.locator("text=จังหวัด")).toBeVisible();
    await expect(page.locator("text=สงขลา")).toBeVisible();
  });

  test("TC-040: แสดงสรุปรายละเอียดการปลูก", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // ตรวจสอบ section รายละเอียดการปลูก
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" }),
    ).toBeVisible();
    await expect(page.locator("text=รายการที่ 1")).toBeVisible();

    // ตรวจสอบข้อมูลรายละเอียดการปลูก
    await expect(page.locator("text=พันธุ์ยางพารา")).toBeVisible();
    await expect(page.locator("text=RRIT 251")).toBeVisible();
    await expect(page.locator("text=พื้นที่แปลง")).toBeVisible();
    await expect(page.locator("text=10.50")).toBeVisible();
    await expect(page.locator("text=จำนวนต้นยางทั้งหมด")).toBeVisible();
    await expect(page.getByText("500", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=จำนวนต้นยางที่กรีดได้")).toBeVisible();
    await expect(page.getByText("400", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=อายุต้นยาง")).toBeVisible();
    await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
    await expect(page.locator("text=ผลผลิตรวม")).toBeVisible();
    await expect(page.locator("text=1500.50")).toBeVisible();
  });

  test("TC-041: แสดงสรุปหลายรายการปลูก", async ({ page }) => {
    // ย้อนกลับไป Step 2 เพื่อเพิ่มรายการที่ 2 และ 3
    await page.click('button:has-text("ย้อนกลับ")');
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" }),
    ).toBeVisible();

    // เพิ่มรายการที่ 2
    await page.click('button:has-text("เพิ่มรายการปลูก")');
    await page.waitForSelector("text=รายการที่ 2", { timeout: 5000 });
    await page.waitForTimeout(500);

    const allSpecieDropdowns = page.locator('[id*="specie"]');
    await allSpecieDropdowns
      .nth(1)
      .waitFor({ state: "visible", timeout: 5000 });
    const secondSpecieButton = allSpecieDropdowns.nth(1).locator("button");
    await secondSpecieButton.click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("RRIM 600")');

    const areaInput2 = page.locator('input[id*="areaOfPlot"]').nth(1);
    await areaInput2.click();
    await areaInput2.clear();
    await areaInput2.pressSequentially("8.5");

    const numberOfRubberInput2 = page
      .locator('input[id*="numberOfRubber"]')
      .nth(1);
    await numberOfRubberInput2.click();
    await numberOfRubberInput2.clear();
    await numberOfRubberInput2.pressSequentially("300");

    const numberOfTappingInput2 = page
      .locator('input[id*="numberOfTapping"]')
      .nth(1);
    await numberOfTappingInput2.click();
    await numberOfTappingInput2.clear();
    await numberOfTappingInput2.pressSequentially("250");

    const ageOfRubberInput2 = page.locator('input[id*="ageOfRubber"]').nth(1);
    await ageOfRubberInput2.click();
    await ageOfRubberInput2.clear();
    await ageOfRubberInput2.pressSequentially("6");

    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .nth(1)
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const yearInputWrapper2 = page.locator('[id*="yearOfTapping"]').nth(1);
    await yearInputWrapper2.waitFor({ state: "visible", timeout: 5000 });
    const calendarButton2 = yearInputWrapper2.locator("button").first();
    await calendarButton2.click();
    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2022")');
    await page.waitForTimeout(300);

    const allMonthDropdowns = page.locator('[id*="monthOfTapping"]');
    await allMonthDropdowns.nth(1).click();
    await page.click('li:has-text("มิถุนายน")');

    const totalProductionInput2 = page
      .locator('input[id*="totalProduction"]')
      .nth(1);
    await totalProductionInput2.click();
    await totalProductionInput2.clear();
    await totalProductionInput2.pressSequentially("900.25");

    // เพิ่มรายการที่ 3
    await page.click('button:has-text("เพิ่มรายการปลูก")');
    await page.waitForSelector("text=รายการที่ 3", { timeout: 5000 });
    await page.waitForTimeout(500);

    await allSpecieDropdowns
      .nth(2)
      .waitFor({ state: "visible", timeout: 5000 });
    const thirdSpecieButton = allSpecieDropdowns.nth(2).locator("button");
    await thirdSpecieButton.click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("PB 235")');

    const areaInput3 = page.locator('input[id*="areaOfPlot"]').nth(2);
    await areaInput3.click();
    await areaInput3.clear();
    await areaInput3.pressSequentially("15");

    const numberOfRubberInput3 = page
      .locator('input[id*="numberOfRubber"]')
      .nth(2);
    await numberOfRubberInput3.click();
    await numberOfRubberInput3.clear();
    await numberOfRubberInput3.pressSequentially("700");

    const numberOfTappingInput3 = page
      .locator('input[id*="numberOfTapping"]')
      .nth(2);
    await numberOfTappingInput3.click();
    await numberOfTappingInput3.clear();
    await numberOfTappingInput3.pressSequentially("600");

    const ageOfRubberInput3 = page.locator('input[id*="ageOfRubber"]').nth(2);
    await ageOfRubberInput3.click();
    await ageOfRubberInput3.clear();
    await ageOfRubberInput3.pressSequentially("10");

    await page.waitForTimeout(500);
    await page
      .locator('label[for*="yearOfTapping"]')
      .nth(2)
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const yearInputWrapper3 = page.locator('[id*="yearOfTapping"]').nth(2);
    await yearInputWrapper3.waitFor({ state: "visible", timeout: 5000 });
    const calendarButton3 = yearInputWrapper3.locator("button").first();
    await calendarButton3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await calendarButton3.click();
    await page.waitForSelector(".p-yearpicker", { timeout: 5000 });
    await page.locator(".p-yearpicker").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.click('.p-yearpicker .p-yearpicker-year:has-text("2021")');
    await page.waitForTimeout(300);

    await allMonthDropdowns.nth(2).click();
    await page.click('li:has-text("มีนาคม")');

    const totalProductionInput3 = page
      .locator('input[id*="totalProduction"]')
      .nth(2);
    await totalProductionInput3.click();
    await totalProductionInput3.clear();
    await totalProductionInput3.pressSequentially("2000");

    // กดถัดไปไป Step 3
    await page.click('button:has-text("ถัดไป")');
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible({ timeout: 10000 });

    // ตรวจสอบว่าแสดงรายการทั้ง 3
    await expect(page.locator("text=รายการที่ 1")).toBeVisible();
    await expect(page.locator("text=RRIT 251")).toBeVisible();
    await expect(page.locator("text=รายการที่ 2")).toBeVisible();
    await expect(page.locator("text=RRIM 600")).toBeVisible();
    await expect(page.locator("text=รายการที่ 3")).toBeVisible();
    await expect(page.locator("text=PB 235")).toBeVisible();
  });

  test("TC-042: ไม่ tick checkbox ยืนยันข้อมูล", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // scroll ลงไปหาปุ่มส่งคำขอ
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // ไม่ tick checkbox และกดปุ่มส่ง
    await submitButton.click();

    // ตรวจสอบข้อความแจ้งเตือน
    await expect(
      page.locator("text=กรุณายืนยันความถูกต้องของข้อมูลก่อนส่ง"),
    ).toBeVisible({ timeout: 5000 });

    // ตรวจสอบว่ายังคงอยู่ที่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();
  });

  test("TC-043: tick checkbox ยืนยันข้อมูล", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // scroll ลงไปหา checkbox
    await page.locator('input[id="confirm"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // tick checkbox ยืนยันข้อมูล
    await page.check('input[id="confirm"]');

    // รอให้ checkbox ถูกเลือก
    await expect(page.locator('input[id="confirm"]')).toBeChecked();

    // กดปุ่มส่งคำขอ
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await submitButton.click();

    // รอข้อความสำเร็จ - ควรมี API ส่งข้อมูลสำเร็จ
    await expect(
      page.locator("text=บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ..."),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-044: กดปุ่มย้อนกลับจาก Step 3", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // tick checkbox ก่อน
    await page.check('input[id="confirm"]');
    await expect(page.locator('input[id="confirm"]')).toBeChecked();

    // กดปุ่มย้อนกลับ
    await page.click('button:has-text("ย้อนกลับ")');

    // ตรวจสอบว่ากลับไป Step 2
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" }),
    ).toBeVisible({ timeout: 10000 });

    // ตรวจสอบว่าข้อมูลที่กรอกไว้ยังคงอยู่
    await expect(page.locator("text=รายการที่ 1")).toBeVisible();
    const firstSpecieInput = page
      .locator('[id*="specie"]')
      .first()
      .locator("input");
    await expect(firstSpecieInput).toHaveValue("RRIT 251");

    // กดถัดไปกลับมา Step 3
    await page.click('button:has-text("ถัดไป")');
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // ตรวจสอบว่า checkbox ถูก reset (ไม่ถูกเลือก)
    await expect(page.locator('input[id="confirm"]')).not.toBeChecked();
  });

  test("TC-045: ส่งข้อมูลสำเร็จ", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // scroll ลงไปหา checkbox
    await page.locator('input[id="confirm"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // tick checkbox ยืนยันข้อมูล
    await page.check('input[id="confirm"]');
    await expect(page.locator('input[id="confirm"]')).toBeChecked();

    // กดปุ่มส่งคำขอ
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await submitButton.click();

    // รอข้อความสำเร็จและการ redirect
    await expect(
      page.locator("text=บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ..."),
    ).toBeVisible({ timeout: 10000 });

    // รอให้ redirect ไปหน้าติดตามสถานะ
    await page.waitForURL(/\/farmer\/applications/, { timeout: 15000 });

    // ตรวจสอบว่าเข้าหน้าติดตามสถานะ
    await expect(page).toHaveURL(/\/farmer\/applications/);
  });

  test("TC-046: ตรวจสอบ loading state", async ({ page }) => {
    // ตรวจสอบว่าอยู่ Step 3
    await expect(
      page.getByRole("heading", { name: "ยืนยันข้อมูล" }),
    ).toBeVisible();

    // scroll ลงไปหา checkbox
    await page.locator('input[id="confirm"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // tick checkbox ยืนยันข้อมูล
    await page.check('input[id="confirm"]');
    await expect(page.locator('input[id="confirm"]')).toBeChecked();

    // กดปุ่มส่งคำขอ
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await submitButton.click();

    // ตรวจสอบ loading state - ปุ่มควร disable
    // (อาจต้องใช้ waitForTimeout สั้นๆ เพื่อให้จับ loading state ได้)
    await page.waitForTimeout(100);

    // รอให้ข้อความสำเร็จปรากฏ
    await expect(
      page.locator("text=บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ..."),
    ).toBeVisible({ timeout: 10000 });

    // ตรวจสอบว่า redirect
    await page.waitForURL(/\/farmer\/applications/, { timeout: 15000 });
  });
});

test.describe("4. UI/UX และ Navigation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAsFarmer(page);
    await page.goto("/farmer/applications/new");
    await expect(
      page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-047: แสดง Step Indicator", async ({ page }) => {
    const formContainer = page.locator("div.bg-white.shadow-md.rounded-lg.p-6");
    const stepIndicator = formContainer.locator("div.mb-8").first();

    await expect(
      stepIndicator.getByText("ข้อมูลสวนยาง", { exact: true }),
    ).toBeVisible();
    await expect(
      stepIndicator.getByText("รายละเอียดการปลูก", { exact: true }),
    ).toBeVisible();
    await expect(
      stepIndicator.getByText("ยืนยันข้อมูล", { exact: true }),
    ).toBeVisible();

    await expect(
      stepIndicator.getByText("ขั้นตอนที่ 1", { exact: true }),
    ).toBeVisible();
    await expect(
      stepIndicator.getByText("ขั้นตอนที่ 2", { exact: true }),
    ).toBeVisible();
    await expect(
      stepIndicator.getByText("ขั้นตอนที่ 3", { exact: true }),
    ).toBeVisible();
  });

  test("TC-048: ตรวจสอบ responsive design", async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง" }),
    ).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง" }),
    ).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "ยื่นขอใบรับรองแหล่งผลิต" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("ขั้นตอนที่ 1: ข้อมูลสวนยาง", { exact: true }),
    ).toBeVisible();
  });

  test("TC-049: กดปุ่มกลับไปหน้าหลักจาก Step 1", async ({ page }) => {
    await page.getByRole("button", { name: "กลับไปหน้าหลัก" }).click();
    await page.waitForURL(/\/farmer\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/farmer\/dashboard/);
  });

  test("TC-050: ตรวจสอบการแสดง error message", async ({ page }) => {
    // ไม่กรอกข้อมูล แล้วกดถัดไป
    await page.getByRole("button", { name: "ถัดไป" }).click();

    const errorAlert = page
      .locator("div.bg-red-50")
      .filter({ hasText: "กรุณากรอกข้อมูลสวนยางให้ครบถ้วน" });
    await expect(errorAlert).toHaveCount(1);
    await expect(errorAlert.first()).toBeVisible();
  });

  test("TC-051: ตรวจสอบการแสดง success message", async ({ page }) => {
    // ทำ Step 1-3 ให้สำเร็จ แล้วตรวจสอบ success alert สีเขียว
    await completeStep1(page);
    await completeStep2(page);

    await page.locator('input[id="confirm"]').scrollIntoViewIfNeeded();
    await page.check('input[id="confirm"]');
    await expect(page.locator('input[id="confirm"]')).toBeChecked();

    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await submitButton.click();

    const successAlert = page
      .locator("div.bg-green-50")
      .filter({ hasText: /บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ/ });
    await expect(successAlert).toHaveCount(1, { timeout: 10000 });
    await expect(successAlert.first()).toBeVisible();
  });

  test("TC-052: ตรวจสอบ autocomplete (จังหวัด/อำเภอ/ตำบล)", async ({
    page,
  }) => {
    const provinceInput = page.locator('[id*="provinceId"] input');
    await provinceInput.click();
    await provinceInput.clear();
    await provinceInput.pressSequentially("สง");

    // ควรมีรายการที่ขึ้นต้นด้วย "สง" เช่น "สงขลา"
    await expect(page.locator('[role="option"]:has-text("สงขลา")')).toBeVisible(
      { timeout: 10000 },
    );
  });

  test("TC-053: ตรวจสอบการ disable dropdown อำเภอ", async ({ page }) => {
    const amphureButton = page.locator('[id*="amphureId"] button');
    await expect(amphureButton).toBeDisabled();
  });

  test("TC-054: ตรวจสอบการ disable dropdown ตำบล", async ({ page }) => {
    // เลือกจังหวัด แต่ยังไม่เลือกอำเภอ
    const provinceInput = page.locator('[id*="provinceId"] input');
    await page.click('[id*="provinceId"] button', { timeout: 10000 });
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.click('[role="option"]:has-text("สงขลา")');
    await page.keyboard.press("Escape");
    await expect(provinceInput).toHaveValue("สงขลา", { timeout: 30000 });

    const tambonButton = page.locator('[id*="tambonId"] button');
    await expect(tambonButton).toBeDisabled();
  });

  test("TC-055: ตรวจสอบแผนที่โต้ตอบได้", async ({ page }) => {
    // เลื่อนลงไปหาแผนที่ แล้วคลิกเพื่อเปลี่ยนพิกัด
    const coordsText = page.locator("text=/^พิกัด:/");
    await coordsText.scrollIntoViewIfNeeded();
    await expect(coordsText).toBeVisible({ timeout: 10000 });
    const before = await coordsText.textContent();

    const mapContainer = page.locator(".leaflet-container");
    await mapContainer.scrollIntoViewIfNeeded();
    await mapContainer.waitFor({ state: "visible", timeout: 10000 });
    await mapContainer.click({ position: { x: 120, y: 120 } });

    // ควรมีหมุดอยู่บนแผนที่ และพิกัดต้องเปลี่ยน
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1, {
      timeout: 10000,
    });
    await expect(coordsText).not.toHaveText(before || "", { timeout: 10000 });
  });
});
