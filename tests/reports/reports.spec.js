import { test, expect } from "@playwright/test";

// Login helpers for reliable auth
async function loginAs(
  page,
  { roleButtonNameRegex, emailEnv, passwordEnv, waitForUrl }
) {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const email = process.env[emailEnv];
  const password = process.env[passwordEnv];
  if (!email || !password)
    throw new Error(`Missing env ${emailEnv} or ${passwordEnv}`);

  await page.goto("/", { waitUntil: "networkidle" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  // allow the page to render role buttons
  await expect(roleButtons.first()).toBeVisible({ timeout: 5000 });

  const roleButton = page
    .getByRole("button", { name: roleButtonNameRegex })
    .first();
  if (await roleButton.isVisible().catch(() => false)) {
    await roleButton.click();
  } else {
    await roleButtons.nth(1).click();
  }

  const emailInput = page
    .getByLabel(/อีเมล/)
    .or(page.locator('input[name="email"]'))
    .first();
  const passwordInput = page
    .getByLabel(/รหัสผ่าน/)
    .or(page.locator('input[name="password"]'))
    .first();

  await emailInput.fill(email);
  await passwordInput.fill(password);

  await page.waitForLoadState("networkidle");
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();

  await Promise.all([
    page.waitForURL(waitForUrl || /\//, { timeout: 30000 }),
    submitButton.click(),
  ]);
}

async function loginAsAdmin(page) {
  return loginAs(page, {
    roleButtonNameRegex: /ผู้ดูแลระบบ|ADMIN/,
    emailEnv: "E2E_TEST_ADMIN_EMAIL",
    passwordEnv: "E2E_TEST_ADMIN_PASSWORD",
    waitForUrl: /\/admin\/dashboard/,
  });
}

async function loginAsAuditor(page) {
  return loginAs(page, {
    roleButtonNameRegex: /ผู้ตรวจ|AUDITOR/,
    emailEnv: "E2E_TEST_AUDITOR_EMAIL",
    passwordEnv: "E2E_TEST_AUDITOR_PASSWORD",
    waitForUrl: /\/auditor\/dashboard/,
  });
}

async function loginAsCommittee(page) {
  return loginAs(page, {
    roleButtonNameRegex: /คณะกรรมการ|COMMITTEE/,
    emailEnv: "E2E_TEST_COMMITTEE_EMAIL",
    passwordEnv: "E2E_TEST_COMMITTEE_PASSWORD",
    waitForUrl: /\/committee\/dashboard/,
  });
}

// Helper to clear date range in calendar
async function clearDateRangeInCalendar(page) {
  const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
  await calendarInput.click();
  await page.waitForSelector(".p-datepicker", { state: "visible" });
  await page.getByRole("button", { name: "ล้างวันที่" }).click();
}

// -------------------- Admin report tests --------------------
test.describe("Reports - Admin", () => {
  test("TC-001 เข้าหน้ารายงานผู้ดูแลระบบได้ (Admin)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: แสดงหน้า "ตรวจสอบรายงาน" และโหลดข้อมูลสำเร็จ (ไม่มี error/crash)
    await expect(page.locator("h1", { hasText: "ตรวจสอบรายงาน" })).toBeVisible({
      timeout: 10000,
    });
    // ตรวจสอบว่ามีปุ่มส่งออก PDF
    await expect(
      page.getByRole("button", { name: /ส่งออก PDF/ })
    ).toBeVisible();
  });

  test("TC-002 ป้องกันการเข้าหน้ารายงานผู้ดูแลระบบจากบทบาทอื่น", async ({
    page,
  }) => {
    await loginAsAuditor(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: ไม่สามารถเข้าถึงหน้าได้ (ถูก redirect/ขึ้นข้อความไม่อนุญาต)
    // ตรวจสอบว่าไม่แสดงหน้า admin report
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("TC-007 Admin: เปลี่ยนช่วงวันที่แล้วเรียก Report API พร้อม query params", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });

    // รอหน้าโหลด
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // ===== เลือกวันที่เริ่มต้น: 1 ม.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^1$/,
        }
      )
      .first()
      .click();

    // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();

    // ดัก response ของ report users
    const [response] = await Promise.all([
      page.waitForResponse((res) => {
        const url = res.url();
        return (
          url.includes("/api/v1/reports/users") &&
          url.includes("startDate=2025-01-01") &&
          url.includes("endDate=2025-12-31") &&
          res.status() === 200
        );
      }),
      page
        .locator(
          ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
          {
            hasText: /^31$/,
          }
        )
        .first()
        .click(),
    ]);

    expect(response.ok()).toBeTruthy();
  });

  test("TC-008 Admin: ล้างวันที่ (Clear dates) แล้วกลับสู่ค่าเริ่มต้น", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    // รอหน้าโหลด
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // ===== เลือกวันที่เริ่มต้น: 1 ม.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^1$/,
        }
      )
      .first()
      .click();

    // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^31$/,
        }
      )
      .first()
      .click(),
      // Verify calendar has a value
      await expect(calendarInput).not.toHaveValue("", { timeout: 3000 });

    // Clear the dates
    await clearDateRangeInCalendar(page);

    // ค่าคาดหวัง: Calendar ถูกล้างค่า
    await expect(calendarInput).toHaveValue("", { timeout: 3000 });
  });

  test("TC-009 Admin: เปิด/ปิดหน้าต่างส่งออก PDF ได้", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    // Click export PDF button
    await page.waitForTimeout(500); // wait for animation
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();

    // ค่าคาดหวัง: Dialog ส่งออก PDF เปิดขึ้น
    const dialog = page.getByRole("dialog", {
      name: /เลือกรายงานที่ต้องการส่งออก/,
    });

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("เลือกรายงานที่ต้องการส่งออก")).toBeVisible();

    // Close dialog
    await dialog.getByRole("button", { name: /ยกเลิก/ }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("TC-010 Admin: ปุ่มส่งออก PDF ถูก disable เมื่อไม่เลือก section ใดๆ", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500); // wait for animation
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();
    const dialog = page.getByRole("dialog", {
      name: /เลือกรายงานที่ต้องการส่งออก/,
    });
    await expect(dialog).toBeVisible();

    await page.waitForTimeout(500); // wait for any animations
    // Uncheck all checkboxes if they are checked
    await page.locator("#export-all").click();

    // ค่าคาดหวัง: ปุ่ม "ส่งออก PDF" เป็น disabled เมื่อไม่มี section ถูกเลือก
    const exportBtn = dialog.getByRole("button", { name: /ส่งออก PDF/ });
    await expect(exportBtn).toBeDisabled();

    await dialog.getByRole("button", { name: /ยกเลิก/ }).click();
  });

  test("TC-011 Admin: เลือกทั้งหมด (Select all) คุม checkbox ทุกอัน", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500); // wait for animation
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // ค่าคาดหวัง: checkbox รายการทั้งหมดถูกเลือก
    const exportBtn = dialog.getByRole("button", { name: /ส่งออก PDF/ });
    await expect(exportBtn).toBeEnabled();

    await page.locator("#export-all").click();
    // Click again to uncheck all
    await expect(exportBtn).toBeDisabled();

    await dialog.getByRole("button", { name: /ยกเลิก/ }).click();
  });

  test("TC-012 Admin: ส่งออก PDF แล้วมีไฟล์ถูกดาวน์โหลด", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByText("ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ")
    ).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500); // wait for any animations
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // ค่าคาดหวัง: มีไฟล์ดาวน์โหลดชื่อขึ้นต้น รายงานระบบ_ และนามสกุล .pdf
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 60000 }),
      dialog.getByRole("button", { name: /ส่งออก PDF/ }).click(),
    ]);
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^รายงานระบบ_.*\.pdf$/);
  });
});

// -------------------- Auditor report tests --------------------
test.describe("Reports - Auditor", () => {
  test("TC-003 เข้าหน้ารายงานผู้ตรวจ (Auditor) ได้", async ({ page }) => {
    await loginAsAuditor(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: แสดงหัวข้อ "รายงานสถิติการตรวจ" และมีปุ่ม "ส่งออก PDF"
    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /ส่งออก PDF/ })
    ).toBeVisible();
  });

  test("TC-004 ป้องกันการเข้าหน้ารายงานผู้ตรวจจากบทบาทอื่น", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: ไม่สามารถเข้าถึงหน้าได้ (redirect/ไม่อนุญาต)
    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("TC-013 Auditor: เปลี่ยนช่วงวันที่แล้วข้อมูลรายงานถูกรีเฟรช", async ({
    page,
  }) => {
    await loginAsAuditor(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).toBeVisible({ timeout: 10000 });

    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // ===== เลือกวันที่เริ่มต้น: 1 ม.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^1$/,
        }
      )
      .first()
      .click();

    // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();

    // ค่าคาดหวัง: มีการเรียก /api/v1/reports/auditor/my-report?startDate=...&endDate=...
    const [resp] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/reports/auditor/my-report") &&
          res.url().includes("startDate=") &&
          res.url().includes("endDate=")
      ),
      page
        .locator(
          ".p-datepicker-calendar td:not(.p-datepicker-other-month) span"
        )
        .filter({ hasText: /^31$/ })
        .first()
        .click(),
    ]);
    expect(resp.ok()).toBeTruthy();
  });

  test("TC-014 Auditor: ล้างวันที่แล้วข้อมูลกลับสู่ค่าเริ่มต้น", async ({
    page,
  }) => {
    await loginAsAuditor(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).toBeVisible({ timeout: 10000 });

    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // ===== เลือกวันที่เริ่มต้น: 1 ม.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^1$/,
        }
      )
      .first()
      .click();

    // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();

    // Verify calendar has a value
    await expect(calendarInput).not.toHaveValue("", { timeout: 3000 });

    // Clear the dates
    await clearDateRangeInCalendar(page);

    // ค่าคาดหวัง: Calendar ถูกล้างค่า
    await expect(calendarInput).toHaveValue("", { timeout: 3000 });
  });

  test('TC-015 Auditor: ตาราง "แปลงยางที่ตรวจแล้ว" ดูเพิ่มเติม/แสดงน้อยลง', async ({
    page,
  }) => {
    // mock API
    const mockResponse = {
      stats: {
        totalInspections: 7,
        passedInspections: 1,
        failedInspections: 1,
        pendingInspections: 5,
        passRate: 50,
      },
      byType: [],
      byStatus: [],
      recentInspections: [],
      inspectedFarms: Array.from({ length: 50 }, (_, i) => ({
        rubberFarmId: i + 1,
        farmLocation: `แปลง ${i + 1}`,
        province: "กรุงเทพมหานคร",
        farmerName: `เจ้าของ ${i + 1}`,
        lastInspectionDate: new Date().toISOString(),
        lastResult: "ผ่าน",
        totalInspections: 1,
      })),
    };

    await page.route("**/api/v1/reports/auditor/my-report", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockResponse),
      });
    });

    await loginAsAuditor(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).toBeVisible();

    const section = page.locator("div", {
      has: page.getByRole("heading", { name: "รายงานแปลงที่ตรวจแล้ว" }),
    });

    const rows = page.getByTestId("inspected-farms-table").locator("tbody tr");

    await expect(rows).toHaveCount(5);
    const showMoreButton = section.getByRole("button", {
      name: /ดูเพิ่มเติม\s*\(\d+\s*แปลง\)/,
    });

    // เริ่มต้นต้องแสดง 5 แถว

    await expect(showMoreButton).toBeVisible();
    await page.pause();
    expect(await rows.count()).toBe(5);
    await page.pause();

    // ดูเพิ่มเติม
    await showMoreButton.click();
    await expect(
      section.getByRole("button", { name: "แสดงน้อยลง" })
    ).toBeVisible();
    expect(await rows.count()).toBe(10);

    // แสดงน้อยลง
    await section.getByRole("button", { name: "แสดงน้อยลง" }).click();
    await expect(showMoreButton).toBeVisible();
    expect(await rows.count()).toBe(5);
  });

  test("TC-016 Auditor: ส่งออก PDF แล้วมีไฟล์ถูกดาวน์โหลด", async ({
    page,
  }) => {
    await loginAsAuditor(page);
    await page.goto("/auditor/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสถิติการตรวจ" })
    ).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500); // wait for any animations
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // ค่าคาดหวัง: มีไฟล์ดาวน์โหลดชื่อขึ้นต้น รายงานการตรวจ_ และนามสกุล .pdf
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 60000 }),
      dialog.getByRole("button", { name: /ส่งออก PDF/ }).click(),
    ]);
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^รายงานการตรวจ_.*\.pdf$/);
  });
});

// -------------------- Committee report tests --------------------
test.describe("Reports - Committee", () => {
  test("TC-005 เข้าหน้ารายงานคณะกรรมการ (Committee) ได้", async ({ page }) => {
    await loginAsCommittee(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: แสดงหน้า "รายงานคณะกรรมการ" และโหลดข้อมูลสำเร็จ
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /ส่งออก PDF/ })
    ).toBeVisible();
  });

  test("TC-006 ป้องกันการเข้าหน้ารายงานคณะกรรมการจากบทบาทอื่น", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    // ค่าคาดหวัง: ไม่สามารถเข้าถึงหน้าได้ (redirect/ไม่อนุญาต)
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("TC-017 Committee: หน้าโหลด base report ก่อน และแสดงกราฟ/สรุป", async ({
    page,
  }) => {
    await loginAsCommittee(page);

    // Wait for base API call
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/reports/committee") &&
        !res.url().includes("startDate=")
    );

    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });

    // ค่าคาดหวัง: มีการเรียก /api/v1/reports/committee (base) และ render โดยไม่ crash
    const resp = await responsePromise;
    expect(resp.ok()).toBeTruthy();

    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-018 Committee: เลือกช่วงวันที่แล้วเรียก API committee พร้อม query params (chart filter)", async ({
    page,
  }) => {
    await loginAsCommittee(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });

    // Click calendar to open date picker
    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // Select 1st day
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();
    await page
      .locator(".p-datepicker-calendar td:not(.p-datepicker-other-month) span")
      .filter({ hasText: /^1$/ })
      .first()
      .click(),
      // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
      await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();

    // ค่าคาดหวัง: มีการเรียก /api/v1/reports/committee?startDate=...&endDate=...
    const [resp] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/reports/committee") &&
          res.url().includes("startDate=") &&
          res.url().includes("endDate=")
      ),
      page
        .locator(
          ".p-datepicker-calendar td:not(.p-datepicker-other-month) span"
        )
        .filter({ hasText: /^31$/ })
        .first()
        .click(),
    ]);
    expect(resp.ok()).toBeTruthy();

    await expect(calendarInput).not.toHaveValue("", { timeout: 3000 });
    const section = page
      .getByRole("heading", {
        name: "แผนภูมิสรุปข้อมูล",
      })
      .locator(".."); // div parent

    await expect(section.getByText("📅")).toBeVisible();

    const section2 = page
      .getByRole("heading", {
        name: "สรุปการตรวจประเมิน",
      })
      .locator(".."); // div parent

    await expect(section2.getByText("📅")).toBeVisible();
  });

  test("TC-019 Committee: ล้างวันที่แล้วกลับสู่ base state", async ({
    page,
  }) => {
    await loginAsCommittee(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });

    const calendarInput = page.locator('input[placeholder="เลือกช่วงวันที่"]');
    await page.waitForTimeout(500); // wait for any animations
    await calendarInput.click();
    await page.waitForSelector(".p-datepicker", { state: "visible" });

    // ===== เลือกวันที่เริ่มต้น: 1 ม.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ม\.ค\.$/ }).click();

    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^1$/,
        }
      )
      .first()
      .click();

    // ===== เลือกวันที่สิ้นสุด: 31 ธ.ค. 2025 =====
    await page.locator(".p-datepicker-year").click();
    await page.locator(".p-yearpicker-year", { hasText: "2025" }).click();
    await page.locator(".p-monthpicker-month", { hasText: /^ธ\.ค\.$/ }).click();
    await page
      .locator(
        ".p-datepicker-calendar td:not(.p-datepicker-other-month) span",
        {
          hasText: /^15$/,
        }
      )
      .first()
      .click();

    await expect(calendarInput).not.toHaveValue("", { timeout: 3000 });

    // Clear dates
    await clearDateRangeInCalendar(page);

    // ค่าคาดหวัง: Calendar ถูกล้างค่า
    await expect(calendarInput).toHaveValue("", { timeout: 3000 });
  });

  test("TC-020 Committee: ส่งออก PDF แล้วมีไฟล์ถูกดาวน์โหลด", async ({
    page,
  }) => {
    await loginAsCommittee(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500); // wait for any animations
    await page.getByRole("button", { name: /ส่งออก PDF/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // ค่าคาดหวัง: มีไฟล์ดาวน์โหลดชื่อขึ้นต้น รายงานคณะกรรมการ_ และนามสกุล .pdf
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 60000 }),
      dialog.getByRole("button", { name: /ส่งออก PDF/ }).click(),
    ]);
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^รายงานคณะกรรมการ_.*\.pdf$/);
  });

  test('TC-021 Committee: กรณีข้อมูลกราฟว่าง แสดง "ไม่มีข้อมูล"', async ({
    page,
  }) => {
    // Mock empty committee report structure
    const emptyCommitteeReport = {
      certificateStats: {
        totalCertificates: 0,
        activeCertificates: 0,
        expiredCertificates: 0,
        cancelRequested: 0,
      },
      certificateExpiryAlerts: {
        expiring30Days: [],
        expiring60Days: [],
        expiring90Days: [],
      },
      inspectionStats: {
        totalInspections: 0,
        passedInspections: 0,
        failedInspections: 0,
        pendingInspections: 0,
        passRate: 0,
      },
      inspectionsByType: [],
      inspectionsByStatus: [],
      auditorPerformances: [],
      myCommitteeStats: {
        committeeName: "คณะกรรมการทดสอบ",
        totalCertificatesIssued: 0,
        certificatesThisMonth: 0,
        certificatesThisYear: 0,
        recentCertificates: [],
        monthlyIssuance: [
          { month: "ก.พ. 68", count: 0 },
          { month: "มี.ค. 68", count: 0 },
          { month: "เม.ย. 68", count: 0 },
          { month: "พ.ค. 68", count: 0 },
          { month: "มิ.ย. 68", count: 0 },
          { month: "ก.ค. 68", count: 0 },
          { month: "ส.ค. 68", count: 0 },
          { month: "ก.ย. 68", count: 0 },
          { month: "ต.ค. 68", count: 0 },
          { month: "พ.ย. 68", count: 0 },
          { month: "ธ.ค. 68", count: 0 },
          { month: "ม.ค. 69", count: 0 },
        ],
      },
    };

    // Mock empty data for chart
    await page.route("**/api/v1/reports/committee**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyCommitteeReport),
      });
    });

    await loginAsCommittee(page);
    await page.goto("/committee/report", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "รายงานสำหรับคณะกรรมการ" })
    ).toBeVisible({ timeout: 10000 });

    // ค่าคาดหวัง: ในกราฟมี label "ไม่มีข้อมูล" (หรือ state ว่างตามที่ UI แสดง) และหน้าไม่พัง
    // Note: This depends on how the chart component handles empty data
    // Check that page loaded successfully without crash
    await expect(
      page.getByRole("button", { name: /ส่งออก PDF/ })
    ).toBeVisible();
    await expect(page.getByText("ไม่มีข้อมูล")).toBeVisible();
    await page.pause();
    await expect(
      page.getByRole("button", { name: /ส่งออก PDF/ })
    ).toBeVisible();
  });
});
