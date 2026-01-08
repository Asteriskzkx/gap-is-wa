// tests/farmerRegister/farmerRegister.spec.js (Playwright E2E Tests)
import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const REGISTER_URL = `${BASE_URL}/register`;

// Helper function สำหรับผ่าน Step 1
async function completeStep1(page) {
  await page.goto(REGISTER_URL);
  await page.fill('input[name="email"]', "test@email.com");

  // คลิกปุ่มตรวจสอบอีเมล
  await page.click('button:has-text("ตรวจสอบ")');
  await expect(page.locator('button:has-text("ตรวจสอบแล้ว")')).toBeVisible({
    timeout: 10000,
  });

  await page.fill('input[name="password"]', "Password123");
  await page.fill('input[name="confirmPassword"]', "Password123");
  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลส่วนตัว" })
  ).toBeVisible();
}

// Helper function สำหรับผ่าน Step 1-2
async function completeStep1And2(page) {
  await page.goto(REGISTER_URL);

  // Step 1
  await page.fill('input[name="email"]', "test@email.com");

  // คลิกปุ่มตรวจสอบอีเมล
  await page.click('button:has-text("ตรวจสอบ")');
  await expect(page.locator('button:has-text("ตรวจสอบแล้ว")')).toBeVisible({
    timeout: 10000,
  });

  await page.fill('input[name="password"]', "Password123");
  await page.fill('input[name="password"]', "Password123");
  await page.fill('input[name="confirmPassword"]', "Password123");
  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลส่วนตัว" })
  ).toBeVisible();

  // Step 2
  await page.click('[id*="namePrefix"]');
  await page.click('li:has-text("นาย")');
  await page.fill('input[name="firstName"]', "สมชาย");
  await page.fill('input[name="lastName"]', "ใจดี");
  await page.fill('input[name="identificationNumber"]', "1234567890123");

  // เลือกวันเกิด
  await page.click("#birthDate input");
  await page.fill("#birthDate input", "01/01/2000");
  await page.keyboard.press("Escape"); // ปิด calendar picker

  // เลือกเพศ
  await page.click('[id*="gender"]');
  await page.click('li:has-text("ชาย")');

  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลที่อยู่" })
  ).toBeVisible();
}

// Helper function สำหรับผ่าน Step 1-3
async function completeStep1To3(page) {
  await page.goto(REGISTER_URL);

  // Step 1
  await page.fill('input[name="email"]', "test@email.com");

  // คลิกปุ่มตรวจสอบอีเมล
  await page.click('button:has-text("ตรวจสอบ")');
  await expect(page.locator('button:has-text("ตรวจสอบแล้ว")')).toBeVisible({
    timeout: 10000,
  });

  await page.fill('input[name="password"]', "Password123");
  await page.fill('input[name="password"]', "Password123");
  await page.fill('input[name="confirmPassword"]', "Password123");
  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลส่วนตัว" })
  ).toBeVisible();

  // Step 2
  await page.click('[id*="namePrefix"]');
  await page.click('li:has-text("นาย")');
  await page.fill('input[name="firstName"]', "สมชาย");
  await page.fill('input[name="lastName"]', "ใจดี");
  await page.fill('input[name="identificationNumber"]', "1234567890123");

  // เลือกวันเกิด
  await page.click("#birthDate input");
  await page.fill("#birthDate input", "01/01/2000");
  await page.keyboard.press("Escape"); // ปิด calendar picker

  // เลือกเพศ
  await page.click('[id*="gender"]');
  await page.click('li:has-text("ชาย")');

  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลที่อยู่" })
  ).toBeVisible();

  // Step 3
  await page.fill('input[name="houseNo"]', "123");
  await page.fill('input[name="villageName"]', "หมู่บ้านสวนยาง");
  await page.fill('input[name="moo"]', "5");
  await page.fill('input[name="road"]', "ถนนสุขุมวิท");
  await page.fill('input[name="alley"]', "ซอย 10");

  // เลือกที่อยู่ จังหวัด อำเภอ ตำบล (cascade dropdowns)
  try {
    // เลือกจังหวัด
    await page.click('[id*="provinceId"] button', { timeout: 5000 });
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("กรุงเทพมหานคร")');

    // รอให้ dropdown อำเภอโหลดข้อมูล
    await page.waitForTimeout(500);

    // เลือกอำเภอ/เขต
    await page.click('[id*="amphureId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("บางกอกใหญ่")'); // เลือกเขตแรกของกรุงเทพ

    // รอให้ dropdown ตำบลโหลดข้อมูล
    await page.waitForTimeout(500);

    // เลือกตำบล/แขวง
    await page.click('[id*="tambonId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"] >> nth=0'); // เลือก option แรก
  } catch (e) {
    // Skip if dropdown not available
    console.log("Address dropdown not available:", e.message);
  }

  await page.click('button:has-text("ถัดไป")');
  await expect(
    page.getByRole("heading", { name: "ข้อมูลการติดต่อ" })
  ).toBeVisible();
}

test.describe("1. Form Validation - Step 1: ข้อมูลบัญชีผู้ใช้", () => {
  test("TC-001: ไม่กรอกอีเมล", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // ไม่กรอกอีเมล แต่กรอกรหัสผ่าน
    await page.fill('input[name="password"]', "Password123");
    await page.fill('input[name="confirmPassword"]', "Password123");

    // กดปุ่มถัดไป
    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบ error message
    await expect(page.locator('text="กรุณากรอกอีเมล"')).toBeVisible();
  });

  test("TC-002: กรอกอีเมลผิดรูปแบบ", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "user#gma.com");
    await page.fill('input[name="password"]', "Password123");
    await page.fill('input[name="confirmPassword"]', "Password123");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="รูปแบบอีเมลไม่ถูกต้อง"')).toBeVisible();
  });

  test("TC-003: ไม่กรอกรหัสผ่าน", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");
    // ไม่กรอกรหัสผ่าน

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกรหัสผ่าน"')).toBeVisible();
  });

  test("TC-004: รหัสผ่านสั้นเกินไป", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");
    await page.fill('input[name="password"]', "12345");
    await page.fill('input[name="confirmPassword"]', "12345");

    await page.click('button:has-text("ถัดไป")');

    await expect(
      page.locator("text=/รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร/")
    ).toBeVisible();
  });

  test("TC-005: ไม่มีรหัสผ่านตัวพิมพ์ใหญ่", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");
    await page.fill('input[name="password"]', "password1");
    await page.fill('input[name="confirmPassword"]', "password1");

    await page.click('button:has-text("ถัดไป")');

    await expect(
      page.locator('text="รหัสผ่านต้องมีตัวพิมพ์ใหญ่"')
    ).toBeVisible();
  });

  test("TC-006: ไม่มีรหัสเลข", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");
    await page.fill('input[name="password"]', "Password");
    await page.fill('input[name="confirmPassword"]', "Password");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="รหัสผ่านต้องมีตัวเลข"')).toBeVisible();
  });

  test("TC-007: ยืนยันรหัสผ่านไม่ตรงกัน", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");
    await page.fill('input[name="password"]', "Password123");
    await page.fill('input[name="confirmPassword"]', "Password456");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="รหัสผ่านไม่ตรงกัน"')).toBeVisible();
  });

  test("TC-008: กรอกข้อมูล Step 1 ครบถ้วนถูกต้อง", async ({ page }) => {
    await page.goto(REGISTER_URL);

    await page.fill('input[name="email"]', "test@email.com");

    // คลิกปุ่มตรวจสอบอีเมล
    await page.click('button:has-text("ตรวจสอบ")');

    // รอให้การตรวจสอบเสร็จ (ปุ่มเปลี่ยนเป็น "ตรวจสอบแล้ว")
    await expect(page.locator('button:has-text("ตรวจสอบแล้ว")')).toBeVisible({
      timeout: 10000,
    });

    await page.fill('input[name="password"]', "Password123");
    await page.fill('input[name="confirmPassword"]', "Password123");

    await page.click('button:has-text("ถัดไป")');

    // ตรวจสอบว่าไปหน้า Step 2
    await expect(
      page.getByRole("heading", { name: "ข้อมูลส่วนตัว" })
    ).toBeVisible();
  });

  test("TC-009: กดปุ่มกลับไปหน้าเข้าสู่ระบบ", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // คลิก logo หรือลิงก์กลับ
    const backLink = page.locator('a[href="/"]').first();
    await backLink.click();

    // ตรวจสอบว่ากลับไป login page
    await expect(page).toHaveURL(BASE_URL);
  });
});

test.describe("2. Form Validation - Step 2: ข้อมูลส่วนตัว", () => {
  test("TC-010: ไม่เลือกคำนำหน้า", async ({ page }) => {
    await completeStep1(page);

    // ไม่เลือกคำนำหน้า
    await page.fill('input[name="firstName"]', "สมชาย");
    await page.fill('input[name="lastName"]', "ใจดี");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณาเลือกคำนำหน้า"')).toBeVisible();
  });

  test("TC-011: เลือกคำนำหน้า", async ({ page }) => {
    await completeStep1(page);

    // เลือกคำนำหน้า
    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');

    // ตรวจสอบว่าถูกเลือก
    const dropdown = page.locator('[id*="namePrefix"]');
    await expect(dropdown).toContainText("นาย");
  });

  test("TC-012: ไม่กรอกชื่อ", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="lastName"]', "ใจดี");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกชื่อ"')).toBeVisible();
  });

  test("TC-013: กรอกชื่อ", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="firstName"]', "สมชาย");

    const firstNameInput = page.locator('input[name="firstName"]');
    await expect(firstNameInput).toHaveValue("สมชาย");
  });

  test("TC-014: กรอกชื่อเกิน 100 ตัวอักษร", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');

    const longName = "ก".repeat(101);
    await page.fill('input[name="firstName"]', longName);

    // ตรวจสอบว่าไม่สามารถกรอกเกิน 100 ตัวอักษร
    const firstNameInput = page.locator('input[name="firstName"]');
    const value = await firstNameInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(100);
  });

  test("TC-015: ไม่กรอกนามสกุล", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="firstName"]', "สมชาย");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกนามสกุล"')).toBeVisible();
  });

  test("TC-016: ไม่กรอกเลขบัตรประชาชน", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="firstName"]', "สมชาย");
    await page.fill('input[name="lastName"]', "ใจดี");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกเลขบัตรประชาชน"')).toBeVisible();
  });

  test("TC-017: กรอกเลขบัตรประชาชนไม่ครบ 13 หลัก", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="firstName"]', "สมชาย");
    await page.fill('input[name="lastName"]', "ใจดี");
    await page.fill('input[name="identificationNumber"]', "1-2345-67890-12");

    await page.click('button:has-text("ถัดไป")');

    await expect(
      page.locator("text=เลขบัตรประชาชนไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก")
    ).toBeVisible();
  });

  test("TC-018: ไม่เลือกวันเกิด", async ({ page }) => {
    await completeStep1(page);

    await page.click('[id*="namePrefix"]');
    await page.click('li:has-text("นาย")');
    await page.fill('input[name="firstName"]', "สมชาย");
    await page.fill('input[name="lastName"]', "ใจดี");
    await page.fill('input[name="identificationNumber"]', "1-2345-67890-12-3");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณาเลือกวันเกิด"')).toBeVisible();
  });

  test("TC-019: เลือกเพศ", async ({ page }) => {
    await completeStep1(page);

    // เลือกเพศ ชาย
    await page.click('[id*="gender"]');
    await page.click('li:has-text("ชาย")');

    const dropdown = page.locator('[id*="gender"]');
    await expect(dropdown).toContainText("ชาย");
  });

  test("TC-020: กดปุ่มย้อนกลับจาก Step 2", async ({ page }) => {
    await completeStep1(page);

    // กดปุ่มย้อนกลับ
    await page.click('button:has-text("ย้อนกลับ")');

    // ตรวจสอบว่ากลับไป Step 1
    await expect(
      page.getByRole("heading", { name: "ข้อมูลบัญชีผู้ใช้" })
    ).toBeVisible();

    // ตรวจสอบว่าข้อมูลยังอยู่
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue("test@email.com");
  });
});

test.describe("3. Form Validation - Step 3: ข้อมูลที่อยู่", () => {
  test("TC-021: ไม่กรอกบ้านเลขที่", async ({ page }) => {
    await completeStep1And2(page);

    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยาง");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกบ้านเลขที่"')).toBeVisible();
  });

  test("TC-022: กรอกบ้านเลขที่", async ({ page }) => {
    await completeStep1And2(page);

    await page.fill('input[name="houseNo"]', "123");

    const houseNoInput = page.locator('input[name="houseNo"]');
    await expect(houseNoInput).toHaveValue("123");
  });

  test("TC-023: ไม่กรอกชื่อหมู่บ้าน", async ({ page }) => {
    await completeStep1And2(page);

    await page.fill('input[name="houseNo"]', "123");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณากรอกชื่อหมู่บ้าน"')).toBeVisible();
  });

  test("TC-024: ไม่เลือกจังหวัด", async ({ page }) => {
    await completeStep1And2(page);

    await page.fill('input[name="houseNo"]', "123");
    await page.fill('input[name="villageName"]', "หมู่บ้านสวนยาง");
    await page.fill('input[name="moo"]', "5");
    await page.fill('input[name="road"]', "ถนนสุขุมวิท");
    await page.fill('input[name="alley"]', "ซอย 10");

    await page.click('button:has-text("ถัดไป")');

    await expect(page.locator('text="กรุณาเลือกจังหวัด"')).toBeVisible();
  });

  test("TC-025: เลือกจังหวัด", async ({ page }) => {
    await completeStep1And2(page);

    // คลิก dropdown button ของจังหวัด
    await page.click('[id*="provinceId"] button');

    // รอให้ panel แสดง
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // เลือกจังหวัด
    await page.click('[role="option"]:has-text("กรุงเทพมหานคร")');

    // ตรวจสอบว่ามี dropdown อำเภอปรากฏ
    await expect(page.locator('[id*="amphureId"]')).toBeEnabled();
  });

  test("TC-026: เลือกอำเภอ/เขต", async ({ page }) => {
    await completeStep1And2(page);

    // คลิก dropdown button ของจังหวัด
    await page.click('[id*="provinceId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("กรุงเทพมหานคร")');

    // รอให้ dropdown อำเภอโหลด
    await page.waitForTimeout(500);

    // คลิก dropdown button ของอำเภอ
    await page.click('[id*="amphureId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // เลือกอำเภอ
    await page.click('[role="option"]:has-text("บางกอกใหญ่")');

    // ตรวจสอบว่ามี dropdown ตำบลปรากฏและ enable
    await expect(page.locator('[id*="tambonId"]')).toBeEnabled();
  });

  test("TC-027: เลือกตำบล/แขวง", async ({ page }) => {
    await completeStep1And2(page);

    // คลิก dropdown button ของจังหวัด
    await page.click('[id*="provinceId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("กรุงเทพมหานคร")');

    // รอให้ dropdown อำเภอโหลด
    await page.waitForTimeout(500);

    // คลิก dropdown button ของอำเภอ
    await page.click('[id*="amphureId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('[role="option"]:has-text("บางกอกใหญ่")');

    // รอให้ dropdown ตำบลโหลด
    await page.waitForTimeout(500);

    // คลิก dropdown button ของตำบล
    await page.click('[id*="tambonId"] button');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // เลือกตำบล/แขวงแรก
    await page.click('[role="option"] >> nth=0');

    // ตรวจสอบว่ารหัสไปรษณีย์ถูกกรอกอัตโนมัติ
    const zipCode = page.locator('input[name="zipCode"]');
    await expect(zipCode).not.toHaveValue("");
  });

  test("TC-028: กดปุ่มย้อนกลับจาก Step 3", async ({ page }) => {
    await completeStep1And2(page);

    await page.click('button:has-text("ย้อนกลับ")');

    // ตรวจสอบว่ากลับไป Step 2
    await expect(
      page.getByRole("heading", { name: "ข้อมูลส่วนตัว" })
    ).toBeVisible();
  });
});

test.describe("4. Form Validation - Step 4: ข้อมูลการติดต่อ", () => {
  test("TC-029: ไม่กรอกเบอร์โทรศัพท์", async ({ page }) => {
    await completeStep1To3(page);

    await page.fill('input[name="mobilePhoneNumber"]', "0812345678");

    // ติ๊ก checkbox ยอมรับเงื่อนไข
    await page.check('input[name="terms"]');

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(
      page.locator('text="กรุณากรอกเบอร์โทรศัพท์"').first()
    ).toBeVisible();
  });

  test("TC-030: กรอกเบอร์โทรศัพท์ไม่ครบ 9 หลัก", async ({ page }) => {
    await completeStep1To3(page);

    await page.fill('input[name="phoneNumber"]', "02123456");
    await page.fill('input[name="mobilePhoneNumber"]', "0812345678");

    // ติ๊ก checkbox ยอมรับเงื่อนไข
    await page.check('input[name="terms"]');

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(
      page.locator("text=/เบอร์โทรศัพท์ต้องเป็นตัวเลข 9 หลัก/").first()
    ).toBeVisible();
  });

  test("TC-031: ไม่กรอกเบอร์โทรศัพท์มือถือ", async ({ page }) => {
    await completeStep1To3(page);

    await page.fill('input[name="phoneNumber"]', "021234567");

    // ติ๊ก checkbox ยอมรับเงื่อนไข
    await page.check('input[name="terms"]');

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(
      page.locator('text="กรุณากรอกเบอร์โทรศัพท์มือถือ"').first()
    ).toBeVisible();
  });

  test("TC-032: กรอกเบอร์โทรศัพท์มือถือไม่ครบ 10 หลัก", async ({ page }) => {
    await completeStep1To3(page);

    await page.fill('input[name="phoneNumber"]', "021234567");
    await page.fill('input[name="mobilePhoneNumber"]', "081234567");

    // ติ๊ก checkbox ยอมรับเงื่อนไข
    await page.check('input[name="terms"]');

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(
      page.locator("text=/เบอร์โทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก/").first()
    ).toBeVisible();
  });

  test("TC-033: กดปุ่มย้อนกลับจาก Step 4", async ({ page }) => {
    await completeStep1To3(page);

    await page.click('button:has-text("ย้อนกลับ")');

    // ตรวจสอบว่ากลับไป Step 3
    await expect(
      page.getByRole("heading", { name: "ข้อมูลที่อยู่" })
    ).toBeVisible();
  });

  test("TC-034: ตรวจสอบ loading state", async ({ page }) => {
    await completeStep1To3(page);

    await page.fill('input[name="phoneNumber"]', "021234567");
    await page.fill('input[name="mobilePhoneNumber"]', "0812345678");

    // ติ๊ก checkbox ยอมรับเงื่อนไข
    await page.check('input[name="terms"]');

    const submitButton = page.locator('button:has-text("ลงทะเบียน")');

    // Mock API เพื่อให้ loading นานพอ
    await page.route("**/api/v1/farmers/register", (route) => {
      // Delay โดยใช้ setTimeout แทน page.waitForTimeout
      setTimeout(() => {
        route.abort();
      }, 2000);
    });

    await submitButton.click();

    // ตรวจสอบว่าปุ่ม disabled ขณะ loading
    await expect(submitButton).toBeDisabled();

    // Cleanup routes ก่อนจบ test
    await page.unrouteAll({ behavior: "ignoreErrors" });
  });
});

test.describe("5. UI/UX และ Navigation", () => {
  test("TC-035: แสดง step progress bar (Desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(REGISTER_URL);

    // ตรวจสอบว่ามี progress bar แสดง 4 steps (desktop version)
    await expect(
      page.locator('[class*="stepLabel"]').filter({ hasText: "บัญชีผู้ใช้" })
    ).toBeVisible();
    await expect(
      page.locator('[class*="stepLabel"]').filter({ hasText: "ข้อมูลส่วนตัว" })
    ).toBeVisible();
    await expect(
      page.locator('[class*="stepLabel"]').filter({ hasText: "ที่อยู่" })
    ).toBeVisible();
    await expect(
      page.locator('[class*="stepLabel"]').filter({ hasText: "ติดต่อ" })
    ).toBeVisible();
  });

  test("TC-036: แสดง step progress indicator (Mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(REGISTER_URL);

    // ตรวจสอบว่าแสดงตัวเลข step ปัจจุบัน (mobile version)
    await expect(page.locator('[class*="stepInfoTitle"]')).toBeVisible();
    await expect(page.locator('[class*="stepInfoTitle"]')).toContainText(
      "ขั้นตอนที่ 1"
    );
  });

  test("TC-037: ตรวจสอบ responsive design", async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: "Desktop" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 375, height: 667, name: "Mobile" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(REGISTER_URL);

      // ตรวจสอบว่า form แสดงผล
      const form = page.locator("form");
      await expect(form).toBeVisible();

      // ตรวจสอบว่ามีปุ่มถัดไป
      await expect(page.locator('button:has-text("ถัดไป")')).toBeVisible();
    }
  });

  test("TC-038: คลิกลิงก์ 'เข้าสู่ระบบ' ที่ footer", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // คลิกลิงก์เข้าสู่ระบบ
    await page.click('a:has-text("เข้าสู่ระบบ")');

    // ตรวจสอบว่ากลับไปหน้า login
    await expect(page).toHaveURL(BASE_URL);
  });

  test("TC-039: ตรวจสอบ logo", async ({ page }) => {
    await page.goto(REGISTER_URL);

    // ตรวจสอบว่ามี logo แสดง
    const logo = page.locator('img[alt*="การยางแห่งประเทศไทย"]');
    await expect(logo).toBeVisible();
  });
});
