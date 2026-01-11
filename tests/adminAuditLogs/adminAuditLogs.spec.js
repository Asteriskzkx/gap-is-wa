import { test, expect } from "@playwright/test";

const ADMIN_USER = {
  email: process.env.E2E_TEST_ADMIN_EMAIL,
  password: process.env.E2E_TEST_ADMIN_PASSWORD,
};

const HAS_ADMIN_CREDS = Boolean(ADMIN_USER.email && ADMIN_USER.password);

const PAGE_PATH = "/admin/audit-logs";
const PAGE_HEADING = "ตรวจสอบเหตุการณ์ในระบบ";
const PAGE_SUBTITLE = "ตรวจสอบความเคลื่อนไหวและกิจกรรมต่างๆ ในระบบ";

const BUTTON_SEARCH = "ค้นหา";
const BUTTON_CLEAR = "ล้างตัวกรอง";
const BUTTON_DELETE_OLD_LOGS = "ล้างข้อมูลเก่า";

const DIALOG_BUTTON_CONFIRM_DELETE = "ยืนยันการลบ";
const DIALOG_BUTTON_CANCEL = "ยกเลิก";

const TABLE_HEADERS = [
  "รหัส",
  "ตาราง",
  "การดำเนินการ",
  "รหัสข้อมูลในตาราง",
  "รหัสผู้ใช้",
  "วันที่ดำเนินการ",
];

async function loginAsAdmin(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const adminRoleButton = page
    .getByRole("button", { name: "ผู้ดูแลระบบ", exact: true })
    .first();
  if (await adminRoleButton.isVisible().catch(() => false)) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await adminRoleButton.click();
      const isActive = await adminRoleButton.evaluate((el) =>
        String(el.className).includes("roleButtonActive")
      );
      if (isActive) break;
      await page.waitForTimeout(100);
    }
    await expect(adminRoleButton).toHaveClass(/roleButtonActive/);
  } else {
    await roleButtons.nth(3).click();
  }

  let emailInput = page.locator('input[name="email"]:visible').first();
  let passwordInput = page.locator('input[name="password"]:visible').first();

  if ((await emailInput.count()) === 0) {
    emailInput = page.getByLabel(/อีเมล/).first();
  }
  if ((await passwordInput.count()) === 0) {
    passwordInput = page.getByLabel(/รหัสผ่าน/).first();
  }

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

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

  await Promise.all([
    page.waitForURL(/\/admin\/dashboard/, {
      timeout: 40000,
      waitUntil: "domcontentloaded",
    }),
    page.locator('button[type="submit"]').click(),
  ]);
}

async function gotoAuditLogsPage(page) {
  await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
}
