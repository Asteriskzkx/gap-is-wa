import { test, expect } from "@playwright/test";

// ใช้ user นี้
const AUDITOR_USER = {
  email: process.env.E2E_TEST_AUDITOR_WITH_INSP_EMAIL,
  password: process.env.E2E_TEST_AUDITOR_WITH_INSP_PASSWORD,
};

const HAS_AUDITOR_CREDS = Boolean(AUDITOR_USER.email && AUDITOR_USER.password);

// ไม่ mock API (GET) ข้อมูลสำหรับการทดสอบการบันทึกข้อมูล ให้ใช้ข้อมูลในแถวแรกของตารางในการทดสอบ
// เช่น ข้อมูลแถวแรก สำหรับ tab อยู่ระหว่างการตรวจประเมิน และข้อมูลแถวแรก สำหรับ tab ตรวจประเมินเสร็จแล้ว
// แต่ให้ mock api (PUT) ในการบันทึกข้อมูลแทน เพื่อที่จะได้ไม่กระทบกับข้อมูลจริง

//ใช้ user ใน loginAsAuditor
async function loginAsAuditor(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const auditorRoleButton = page
    .getByRole("button", { name: /ผู้ตรวจ\s*ประเมิน/ })
    .first();
  if (await auditorRoleButton.isVisible().catch(() => false)) {
    await auditorRoleButton.click();
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
  await expect(emailInput).toHaveValue(email);
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);

  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/auditor\/dashboard/, {
    timeout: 40000,
    waitUntil: "domcontentloaded",
  });
}
