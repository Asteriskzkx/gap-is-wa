import { test, expect } from "@playwright/test";

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.video) {
    const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9ก-๙-_]/g, "_");
    const videoPath = await testInfo.video.path();

    const fs = require("fs");
    const path = require("path");

    const newPath = testInfo.outputPath(`${safeTitle}.webm`);
    fs.renameSync(videoPath, newPath);
  }
});

// Login helper for Farmer role
async function loginAsFarmer(page) {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const email = process.env.E2E_TEST_FARMER_WITH_CERT_EMAIL;
  const password = process.env.E2E_TEST_FARMER_WITH_CERT_PASSWORD;
  if (!email || !password)
    throw new Error("Missing env E2E_TEST_FARMER_EMAIL or E2E_TEST_FARMER_PASSWORD");

  await page.goto("/", { waitUntil: "networkidle" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons.first()).toBeVisible({ timeout: 5000 });

  const roleButton = page
    .getByRole("button", { name: /เกษตรกร|FARMER/ })
    .first();
  if (await roleButton.isVisible().catch(() => false)) {
    await roleButton.click();
  } else {
    await roleButtons.nth(0).click();
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
    page.waitForURL(/\/farmer\//, { waitUntil: "domcontentloaded",timeout: 5000 }),
    submitButton.click(),
  ]);
}

// Helper to get auth cookies from logged-in page
async function getAuthCookies(page) {
  const cookies = await page.context().cookies();
  return cookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

const EXPORT_EXCEL_ENDPOINT = "/api/v1/reports/export-excel";

test.describe("Report Authorization (Negative)", () => {

  test("TC-043: สร้างรายงานผู้ใช้งาน จากบทบาทที่ไม่ใช่ ADMIN", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create user report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["users"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-044: สร้างรายงานการตรวจประเมิน จากบทบาทที่ไม่ใช่ ADMIN/ COMMITTEE", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create inspection report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["inspections"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-045: สร้างรายงานแปลงสวนยางพารา จากบทบาทที่ไม่ใช่ ADMIN", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create plantation report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["rubberFarms"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-046: สร้างรายงานใบรับรอง จากบทบาทที่ไม่ใช่ ADMIN/ COMMITTEE", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create certificate report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["certificates"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-047: สร้างรายงานประสิทธิภาพผู้ตรวจประเมิน จากบทบาทที่ไม่ใช่ ADMIN", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create auditor performance report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["auditors"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-048: สร้างรายงานประสิทธิภาพของฉัน จากบทบาทที่ไม่ใช่ COMMITTEE", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create my performance report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["committeePerformances"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

  test("TC-049: สร้างรายงานประสิทธิภาพและการตรวจประเมินผู้ตรวจประเมิน จากบทบาทที่ไม่ใช่ Auditors", async ({ page, request }) => {
    // Login as Farmer
    await loginAsFarmer(page);
    const cookies = await getAuthCookies(page);

    // Call API to create auditor evaluation report
    const res = await request.post(EXPORT_EXCEL_ENDPOINT, {
      headers: { Cookie: cookies },
      data: { sections: ["specificAuditorPerformance"] },
    });

    // Expected: Error 401 (Farmer is not authorized for this endpoint)
    expect(res.status()).toBe(401);
  });

});
