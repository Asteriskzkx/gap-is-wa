import { expect, test } from "@playwright/test";

const USERS = {
  withFarms: {
    email: process.env.E2E_TEST_USER_EMAIL,
    password: process.env.E2E_TEST_USER_PASSWORD,
  },
  noFarms: {
    email: process.env.E2E_TEST_USER_NO_FARMS_EMAIL,
    password: process.env.E2E_TEST_USER_NO_FARMS_PASSWORD,
  },
};

async function loginAsFarmer(page, { email, password }) {
  // Login page is the root route (same as the New flow tests).
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Select role: เกษตรกร
  await page.getByRole("button", { name: "เกษตรกร" }).click();

  const emailInput = page
    .getByLabel("อีเมล")
    .or(page.locator('input[name="email"]'))
    .first();
  const passwordInput = page
    .getByLabel("รหัสผ่าน")
    .or(page.locator('input[name="password"]'))
    .first();

  // Fill credentials
  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);

  // Submit
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  // Wait for successful login
  await page.waitForURL(/\/farmer/, {
    timeout: 20000,
    waitUntil: "domcontentloaded",
  });
}

function getFormNextButton(page) {
  // Avoid collision with paginator "หน้าถัดไป".
  return page.getByRole("button", { name: /^ถัดไป$/ });
}

function getStep1Table(page) {
  // FarmSelectionStep renders PrimaryDataTable under this wrapper.
  return page.locator(".primary-datatable-wrapper");
}

function getPaginatorRoot(step1Table) {
  return step1Table.locator(".p-paginator");
}

test.describe("Farmer Applications Edit — Part 1 (Step 1: เลือกสวนยาง)", () => {
  // This flow logs in repeatedly with the same accounts; keep it serial to avoid
  // cross-test interference and occasional browser target crashes under load.
  test.describe.configure({ mode: "serial" });

  test("TC-001: ผู้ใช้มีสวนยาง — เห็นหน้าฟอร์มแก้ไขและตารางสวนยาง", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "แก้ไขข้อมูลสวนยางพารา" }),
    ).toBeVisible({ timeout: 10000 });

    const table = getStep1Table(page);
    await expect(table).toBeVisible({ timeout: 10000 });

    const firstRow = table.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();
  });

  test("TC-002: แสดงสถานะกำลังโหลด (บังคับ delay ผ่าน route) แล้วจึงเห็นตาราง", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);

    // Delay farms list response so loading spinner is observable.
    await page.route("**/api/v1/rubber-farms**", async (route) => {
      await new Promise((r) => setTimeout(r, 1200));
      await route.continue();
    });

    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const spinner = page.locator(".animate-spin");
    await expect(spinner).toBeVisible();

    const table = getStep1Table(page);
    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr").first()).toBeVisible();
  });

  test("TC-003: ผู้ใช้ไม่มีสวนยาง — เห็นข้อความแจ้งเตือนและปุ่มลงทะเบียนสวนยาง", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.noFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByText("คุณยังไม่มีสวนยางในระบบ กรุณาลงทะเบียนสวนยางก่อน"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ลงทะเบียนสวนยาง" }),
    ).toBeVisible();

    await expect(getStep1Table(page)).toHaveCount(0);
  });

  test("TC-004: ผู้ใช้ไม่มีสวนยาง — คลิก 'ลงทะเบียนสวนยาง' ไปที่ /farmer/applications/new", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.noFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await page.getByRole("button", { name: "ลงทะเบียนสวนยาง" }).click();
    await expect(page).toHaveURL(/\/farmer\/applications\/new/);
  });

  test("TC-005: ตารางมีคอลัมน์ครบ (รหัสสวน/สถานที่/จังหวัด/อำเภอ/ตำบล)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    await expect(table).toBeVisible();

    const headers = ["รหัสสวน", "สถานที่", "จังหวัด", "อำเภอ", "ตำบล"];
    for (const header of headers) {
      await expect(
        table.locator("th", { hasText: header }).first(),
      ).toBeVisible();
    }
  });

  test("TC-006: รหัสสวนมีรูปแบบ RFxxxxx (อย่างน้อย 1 แถว)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    await expect(table).toBeVisible();
    await expect(table.locator("text=/RF\\d{5}/").first()).toBeVisible();
  });

  test("TC-007: เลือกแถวสวนยางได้ (คลิกแถวแล้วมีสถานะถูกเลือก)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    const firstRow = table.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();

    await firstRow.click();

    // PrimeReact marks selected row with p-highlight.
    await expect(firstRow).toHaveClass(/p-highlight/);
  });

  test("TC-008: กด 'ถัดไป' โดยไม่เลือกสวน — แสดง error 'กรุณาเลือกสวนยางที่ต้องการแก้ไข'", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "แก้ไขข้อมูลสวนยางพารา" }),
    ).toBeVisible({ timeout: 10000 });

    const nextButton = getFormNextButton(page);
    await expect(nextButton).toBeVisible({ timeout: 10000 });

    await nextButton.click();
    await expect(
      page.locator(".bg-red-50", {
        hasText: "กรุณาเลือกสวนยางที่ต้องการแก้ไข",
      }),
    ).toBeVisible();
  });

  test("TC-009: มีรายงานจำนวนรายการใน paginator (แสดง X ถึง Y จาก Z รายการ)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    const paginator = getPaginatorRoot(table);
    await expect(paginator).toBeVisible();

    await expect(
      paginator.locator(
        "text=/แสดง\\s+\\d+\\s+ถึง\\s+\\d+\\s+จาก\\s+\\d+\\s+รายการ/",
      ),
    ).toBeVisible();
  });

  test("TC-010: เปลี่ยนจำนวนแถวต่อหน้า (RowsPerPageDropdown)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    const paginator = getPaginatorRoot(table);
    await expect(paginator).toBeVisible();

    // PrimeReact renders the dropdown with class p-dropdown inside paginator.
    const rppDropdown = paginator.locator(".p-dropdown").first();
    await expect(rppDropdown).toBeVisible();

    await rppDropdown.click();
    const option25 = page
      .locator(".p-dropdown-items li", { hasText: "25" })
      .first();
    await expect(option25).toBeVisible();
    await option25.click();

    // Selected label should reflect chosen value.
    await expect(rppDropdown).toContainText("25");
  });

  test("TC-011: กดหัวคอลัมน์เพื่อ sort ได้ (อย่างน้อย 1 คอลัมน์)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    await expect(table).toBeVisible();

    const header = table.locator("th", { hasText: "รหัสสวน" }).first();
    await header.click();

    // PrimeReact uses aria-sort for sorted column.
    await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
  });

  test("TC-012: ดึงรายการสวนยางล้มเหลว — แสดง error 'ไม่สามารถดึงข้อมูลสวนยางได้'", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);

    await page.route("**/api/v1/rubber-farms**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.locator(".bg-red-50", { hasText: "ไม่สามารถดึงข้อมูลสวนยางได้" }),
    ).toBeVisible();
  });

  test("TC-013: เลือกสวนแล้วกด 'ถัดไป' — ไป Step 2 และเห็นปุ่ม 'ย้อนกลับ'", async ({
    page,
  }) => {
    await loginAsFarmer(page, USERS.withFarms);
    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    const table = getStep1Table(page);
    const firstRow = table.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();

    await getFormNextButton(page).click();
    await expect(page.getByRole("button", { name: "ย้อนกลับ" })).toBeVisible();
  });
});
