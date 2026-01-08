// tests/login/login.spec.js (Playwright E2E Tests)
import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("1. การเลือก Role และ Validation พื้นฐาน", () => {
  test("TC-001: เลือก Role เกษตรกร", async ({ page }) => {
    await page.goto(BASE_URL);

    // คลิกเลือก Role เกษตรกร
    await page.click('button:has-text("เกษตรกร")');

    // ตรวจสอบว่าปุ่มถูกเลือก (มี class roleButtonActive)
    const farmerButton = page.locator('button:has-text("เกษตรกร")');
    await expect(farmerButton).toHaveClass(/roleButtonActive/);

    // ตรวจสอบว่าแสดงลิงก์สมัครสมาชิก
    await expect(page.locator('a:has-text("สมัครสมาชิกใหม่")')).toBeVisible();
  });

  test("TC-002: เลือก Role ผู้ตรวจประเมิน", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.click('button:has-text("ผู้ตรวจประเมิน")');

    const auditorButton = page.locator('button:has-text("ผู้ตรวจประเมิน")');
    await expect(auditorButton).toHaveClass(/roleButtonActive/);

    // ตรวจสอบว่าซ่อนลิงก์สมัครสมาชิก
    await expect(
      page.locator('a:has-text("สมัครสมาชิกใหม่")')
    ).not.toBeVisible();
  });

  test("TC-003: เลือก Role คณะกรรมการ", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.click('button:has-text("คณะกรรมการ")');

    const committeeButton = page.locator('button:has-text("คณะกรรมการ")');
    await expect(committeeButton).toHaveClass(/roleButtonActive/);

    // ตรวจสอบว่าซ่อนลิงก์สมัครสมาชิก
    await expect(
      page.locator('a:has-text("สมัครสมาชิกใหม่")')
    ).not.toBeVisible();
  });

  test("TC-004: เลือก Role ผู้ดูแลระบบ", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.click('button:has-text("ผู้ดูแลระบบ")');

    const adminButton = page.locator('button:has-text("ผู้ดูแลระบบ")');
    await expect(adminButton).toHaveClass(/roleButtonActive/);

    // ตรวจสอบว่าซ่อนลิงก์สมัครสมาชิก
    await expect(
      page.locator('a:has-text("สมัครสมาชิกใหม่")')
    ).not.toBeVisible();
  });
});

test.describe("2. Form Validation", () => {
  test("TC-005: ไม่กรอกอีเมล", async ({ page }) => {
    await page.goto(BASE_URL);

    // กรอกเฉพาะรหัสผ่าน
    await page.fill('input[name="password"]', "password123");

    // กดปุ่มเข้าสู่ระบบ
    await page.click('button[type="submit"]');

    // ตรวจสอบว่ามี error message
    await expect(page.locator('text="กรุณากรอกอีเมล"')).toBeVisible();
  });

  test("TC-006: กรอกอีเมลผิดรูปแบบ", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "test@invalid");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator('text="รูปแบบอีเมลไม่ถูกต้อง"')).toBeVisible();
  });

  test("TC-007: กรอกอีเมลไม่มี @", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "testexample.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page.locator('text="รูปแบบอีเมลไม่ถูกต้อง"')).toBeVisible();
  });

  test("TC-008: ไม่กรอกรหัสผ่าน", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "test@example.com");
    // ไม่กรอกรหัสผ่าน
    await page.click('button[type="submit"]');

    await expect(page.locator('text="กรุณากรอกรหัสผ่าน"')).toBeVisible();
  });

  test("TC-009: กรอกรหัสผ่านน้อยกว่า 6 ตัวอักษร", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "12345");
    await page.click('button[type="submit"]');

    await expect(
      page.locator('text="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"')
    ).toBeVisible();
  });
});

test.describe("3. UI/UX และ Navigation", () => {
  test("TC-010: คลิกลิงก์สมัครสมาชิกใหม่ (เกษตรกร)", async ({ page }) => {
    await page.goto(BASE_URL);

    // เลือก Role เกษตรกร (default แล้ว)
    await page.click('button:has-text("เกษตรกร")');

    // คลิกลิงก์สมัครสมาชิก
    const registerLink = page.locator('a:has-text("สมัครสมาชิกใหม่")');
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // ตรวจสอบว่าไปหน้า /register
    await expect(page).toHaveURL(/\/register/);
  });

  test("TC-011: แสดง logo", async ({ page }) => {
    await page.goto(BASE_URL);

    // ตรวจสอบว่ามี logo แสดง
    const logo = page.locator('img[alt*="Rubber Authority"]');
    await expect(logo).toBeVisible();
  });

  test("TC-012: แสดงรูปภาพด้านซ้าย (Desktop)", async ({ page }) => {
    // ตั้งค่าขนาดหน้าจอเป็น desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);

    // ตรวจสอบว่ามีรูปภาพด้านซ้าย
    const heroImage = page.locator('img[alt*="การยางแห่งประเทศไทย"]');
    await expect(heroImage).toBeVisible();
  });

  test("TC-013: ซ่อนรูปภาพด้านซ้าย (Mobile)", async ({ page }) => {
    // ตั้งค่าขนาดหน้าจอเป็น mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // ตรวจสอบว่ารูปภาพด้านซ้ายถูกซ่อน (อาจมีแต่ไม่แสดง)
    const imageSection = page.locator('img[alt*="การยางแห่งประเทศไทย"]');

    // ตรวจสอบว่า element ไม่อยู่ใน viewport หรือซ่อนด้วย CSS
    const isVisible = await imageSection.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test("TC-014: ตรวจสอบ responsive design", async ({ page }) => {
    // ทดสอบหลายขนาดหน้าจอ
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
      await page.goto(BASE_URL);

      // ตรวจสอบว่าหน้าโหลดสำเร็จและมี form
      const form = page.locator("form");
      await expect(form).toBeVisible();

      // ตรวจสอบว่ามีปุ่มเข้าสู่ระบบ
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    }
  });

  test("TC-015: ตรวจสอบ autocomplete attributes", async ({ page }) => {
    await page.goto(BASE_URL);

    // ตรวจสอบ autocomplete ของ email
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute("autocomplete", "email");

    // ตรวจสอบ autocomplete ของ password
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
  });

  test("TC-016: แสดงข้อความ copyright", async ({ page }) => {
    await page.goto(BASE_URL);

    // ตรวจสอบว่ามีข้อความ copyright
    const copyrightText = page.locator("text=/© \\d{4} การยางแห่งประเทศไทย/");
    await expect(copyrightText).toBeVisible();
  });
});

test.describe("4. Interaction และ Behavior", () => {
  test("TC-017: กด Enter เพื่อ submit form", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "12345");

    // กด Enter ในช่อง password
    await page.locator('input[name="password"]').press("Enter");

    // ตรวจสอบว่า form ถูก submit (จะมี validation error)
    await expect(
      page.locator('text="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"')
    ).toBeVisible();
  });

  test("TC-018: ตรวจสอบ validation ทันทีเมื่อมี error แล้ว", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    // กรอกอีเมลผิดและ submit
    await page.fill('input[name="email"]', "test@invalid");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // ตรวจสอบว่ามี error
    await expect(page.locator('text="รูปแบบอีเมลไม่ถูกต้อง"')).toBeVisible();

    // แก้ไขอีเมลให้ถูกต้อง
    await page.fill('input[name="email"]', "test@example.com");

    // ตรวจสอบว่า error หายไป (validate on change)
    await expect(
      page.locator('text="รูปแบบอีเมลไม่ถูกต้อง"')
    ).not.toBeVisible();
  });

  test("TC-019: ตรวจสอบ disabled state ของปุ่ม", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    const submitButton = page.locator('button[type="submit"]');

    // เริ่มต้นปุ่มไม่ disabled
    await expect(submitButton).not.toBeDisabled();

    // Mock API เพื่อให้ loading นานพอ (ใช้ fulfill แทน abort)
    await page.route("**/api/auth/**", async (route) => {
      // Delay response โดยไม่ใช้ waitForTimeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });

    // คลิกปุ่ม submit และตรวจสอบ disabled state ทันที
    await submitButton.click();

    // ตรวจสอบว่าปุ่ม disabled ระหว่าง loading
    await expect(submitButton).toBeDisabled();

    // Clean up route
    await page.unroute("**/api/auth/**");
  });
});
