import { test, expect } from "@playwright/test";

const COMMITTEE_USER = {
  email: process.env.E2E_TEST_COMMITTEE_EMAIL,
  password: process.env.E2E_TEST_COMMITTEE_PASSWORD,
};

const HAS_COMMITTEE_CREDS = Boolean(
  COMMITTEE_USER.email && COMMITTEE_USER.password
);

const PAGE_PATH = "/committee/certifications/revoke";
const PAGE_HEADING = "ยกเลิกใบรับรองแหล่งผลิตจีเอพี";
const PAGE_SUBTITLE = "ยกเลิกใบรับรองแหล่งผลิตยางพาราที่มีคำขอยกเลิก";

const BUTTON_SEARCH = "ค้นหา";
const BUTTON_CLEAR = "ล้างค่า";
const BUTTON_NEXT = "ถัดไป";
const BUTTON_BACK = "ย้อนกลับ";
const BUTTON_REVOKE = "ยืนยันยกเลิกใบรับรอง";

const TABLE_HEADERS = [
  "รหัสใบรับรอง",
  "รหัสการตรวจ",
  "วันที่ตรวจ",
  "สถานที่",
  "วันที่มีผล",
  "วันที่หมดอายุ",
];

async function loginAsCommittee(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const committeeRoleButton = page
    .getByRole("button", { name: /คณะกรรมการ/ })
    .first();
  if (await committeeRoleButton.isVisible().catch(() => false)) {
    await committeeRoleButton.click();
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

  const fillAndConfirm = async (locator, value) => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await locator.fill(value);
      if ((await locator.inputValue()) === value) return;
      await page.waitForTimeout(100);
    }
    await expect(locator).toHaveValue(value);
  };

  await fillAndConfirm(emailInput, email);
  await fillAndConfirm(passwordInput, password);

  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/committee\/dashboard/, {
    timeout: 40000,
    waitUntil: "domcontentloaded",
  });
}
