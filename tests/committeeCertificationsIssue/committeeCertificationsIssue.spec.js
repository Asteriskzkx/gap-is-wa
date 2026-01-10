import { test, expect } from "@playwright/test";

// ใช้ user นี้
const COMMITEE_USER = {
  email: process.env.E2E_TEST_COMMITTEE_EMAIL,
  password: process.env.E2E_TEST_COMMITTEE_PASSWORD,
};

//ไม่ mock API (GET) ข้อมูลสำหรับการทดสอบการบันทึกข้อมูล ให้ใช้ข้อมูลในแถวแรกของตารางในการทดสอบ
//เช่นใช้ข้อมูลแถวแรก
//แต่ให้ mock api (POST) ในการบันทึกข้อมูลแทน เพื่อที่จะได้ไม่กระทบกับข้อมูลจริง

//ใช้ user ใน loginAsCommittee
async function loginAsCommittee(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const auditorRoleButton = page
    .getByRole("button", { name: /คณะกรรมการ/ })
    .first();
  if (await auditorRoleButton.isVisible().catch(() => false)) {
    await auditorRoleButton.click();
  } else {
    await roleButtons.nth(2).click();
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
  await page.waitForURL(/\/committee\/dashboard/, {
    timeout: 40000,
    waitUntil: "domcontentloaded",
  });
}
