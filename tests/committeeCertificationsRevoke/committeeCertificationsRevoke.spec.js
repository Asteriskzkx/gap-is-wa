import { expect, test } from "@playwright/test";

const COMMITTEE_USER = {
  email: process.env.E2E_TEST_COMMITTEE_EMAIL,
  password: process.env.E2E_TEST_COMMITTEE_PASSWORD,
};

const HAS_COMMITTEE_CREDS = Boolean(
  COMMITTEE_USER.email && COMMITTEE_USER.password,
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

async function expectVisible(locator, options) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible(options);
  return locator;
}

async function loginAsCommittee(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const committeeRoleButton = page
    .getByRole("button", { name: "คณะกรรมการ", exact: true })
    .first();
  if (await committeeRoleButton.isVisible().catch(() => false)) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await committeeRoleButton.click();
      const isActive = await committeeRoleButton.evaluate((el) =>
        String(el.className).includes("roleButtonActive"),
      );
      if (isActive) break;
      await page.waitForTimeout(100);
    }
    await page.waitForLoadState('networkidle');
    await expect(committeeRoleButton).toHaveClass(/roleButtonActive/);
  } else {
    await roleButtons.nth(2).click();
  }

  let emailInput = page.locator('input[name="email"]:visible').first();
  let passwordInput = page.locator('input[name="password"]:visible').first();

  if ((await emailInput.count()) === 0) {
    emailInput = page.getByLabel(/อีเมล/).first();
  }
  if ((await passwordInput.count()) === 0) {
    passwordInput = page.getByLabel(/รหัสผ่าน/).first();
  }

  await expectVisible(emailInput);
  await expectVisible(passwordInput);

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
    page.waitForURL(/\/committee\/dashboard/, {
      timeout: 40000,
      waitUntil: "domcontentloaded",
    }),
    page.locator('button[type="submit"]').click(),
  ]);
}

async function gotoRevokePage(page) {
  await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
  await expectVisible(page.getByRole("heading", { name: PAGE_HEADING }));
}

async function waitForCertificatesTable(page) {
  const table = page.locator(".primary-datatable-wrapper").first();
  await expectVisible(table, { timeout: 20000 });
  await expectVisible(table.locator("table"), { timeout: 20000 });
  return table;
}

async function ensureHasDataRows(page, testInfo) {
  const table = await waitForCertificatesTable(page);
  const rows = table.locator("tbody tr");
  await expectVisible(rows.first(), { timeout: 20000 });

  const firstRowText = ((await rows.first().textContent()) || "").trim();
  if (!firstRowText || firstRowText.includes("ไม่พบข้อมูล")) {
    testInfo.skip("ไม่มีข้อมูลใบรับรองสำหรับการทดสอบ");
  }

  return { table, rows };
}

function getStepNextButton(page) {
  return page
    .locator("div.mt-4.flex.justify-end.gap-2")
    .getByRole("button", { name: BUTTON_NEXT, exact: true });
}

function getCalendarInput(page, id) {
  return page
    .locator(`#${id} input`)
    .or(page.locator(`input#${id}`))
    .first();
}

async function selectFirstAvailableDate(page, input, calendarId) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await input.click();
    const panel = calendarId
      ? page.locator(`#${calendarId}_panel`)
      : page.locator(".p-datepicker:visible").last();
    await expectVisible(panel, { timeout: 10000 });
    const day = panel
      .locator(
        "td:not(.p-disabled):not(.p-datepicker-other-month) span:not(.p-disabled)",
      )
      .first();
    await expectVisible(day, { timeout: 10000 });
    await day.click();
    const value = await input.inputValue();
    if (value) return;
    await page.waitForTimeout(100);
  }
  await expect(input).not.toHaveValue("");
}

function waitForRevokeListRequest(page, predicate) {
  return page.waitForRequest((req) => {
    if (req.method() !== "GET") return false;
    if (!req.url().includes("/api/v1/certificates/revoke-list")) return false;
    if (!predicate) return true;
    return predicate(new URL(req.url()));
  });
}

async function installWindowOpenSpy(page) {
  await page.evaluate(() => {
    window.__openedUrls = [];
    window.open = (url) => {
      window.__openedUrls.push(String(url ?? ""));
      return { focus: () => {} };
    };
  });
}

async function clickFirstRowEyeAndWaitForFiles(page, testInfo) {
  const { rows } = await ensureHasDataRows(page, testInfo);
  const firstRow = rows.first();
  const eyeButton = firstRow.locator("button:has(.pi-eye)").first();
  if ((await eyeButton.count()) === 0) {
    testInfo.skip("ไม่พบปุ่มดูไฟล์ในแถวแรก");
  }

  const responsePromise = page.waitForResponse((resp) => {
    return (
      resp.url().includes("/api/v1/files/get-files") &&
      resp.request().method() === "GET"
    );
  });

  await eyeButton.click();
  return responsePromise;
}

async function mockFilesApi(page, handler) {
  await page.route("**/api/v1/files/get-files**", async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const url = new URL(route.request().url());
    const response = await handler({ url, route });
    const status = response?.status ?? 200;
    const body =
      typeof response?.body === "string"
        ? response.body
        : JSON.stringify(response?.body ?? {});
    await route.fulfill({ status, contentType: "application/json", body });
  });
}

async function goToStep2FromFirstRow(page, testInfo) {
  const { rows } = await ensureHasDataRows(page, testInfo);
  const firstRow = rows.first();

  await firstRow.click();
  await expect(firstRow).toHaveClass(/bg-green-50/);

  const nextButton = getStepNextButton(page);
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expectVisible(page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง"), {
    timeout: 10000,
  });
}

test.describe("ยกเลิกใบรับรองแหล่งผลิตจีเอพี - Committee", () => {
  test("TC-001: ไม่ได้ login → redirect 001", async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 10000,
    });
    await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
  });

  test.describe("Step 1 — เลือกใบรับรอง", () => {
    test.skip(
      !HAS_COMMITTEE_CREDS,
      "ยังไม่ได้ตั้งค่า E2E committee credentials",
    );
    // test.describe.configure({ mode: "serial", timeout: 60000 });

    test.beforeEach(async ({ page }) => {
      await loginAsCommittee(page, COMMITTEE_USER);
      await gotoRevokePage(page);
      await waitForCertificatesTable(page);
    });

    test("TC-002: แสดงหัวข้อ/คำอธิบายหน้าถูกต้อง 002", async ({ page }) => {
      await expectVisible(page.getByRole("heading", { name: PAGE_HEADING }));
      await expectVisible(page.getByText(PAGE_SUBTITLE));
    });

    test("TC-003: แสดง Step indicator และอยู่ที่ Step 1 003", async ({ page }) => {
      await expectVisible(page.getByText(/ขั้นตอนที่ 1/).first());
      await expectVisible(
        page.getByText("เลือกใบรับรอง", { exact: true }).first(),
      );
      await expectVisible(
        page.getByText("ยกเลิกใบรับรอง", { exact: true }).first(),
      );
    });

    test("TC-004: แสดงตัวกรองวันที่และปุ่มค้นหา/ล้างค่า 004", async ({ page }) => {
      await expectVisible(page.getByText("ตั้งแต่", { exact: true }).first());
      await expectVisible(page.getByText("ถึง", { exact: true }).first());
      await expectVisible(page.getByPlaceholder("เลือกวันที่มีผล"));
      await expectVisible(page.getByPlaceholder("เลือกวันที่หมดอายุ"));
      await expectVisible(page.getByRole("button", { name: BUTTON_SEARCH }));
      await expectVisible(page.getByRole("button", { name: BUTTON_CLEAR }));
    });

    test("TC-005: แสดงปุ่มแท็บ 2 แบบ 005", async ({ page }) => {
      await expectVisible(
        page.getByRole("button", { name: "ใบรับรองที่มีคำขอยกเลิก" }),
      );
      await expectVisible(
        page.getByRole("button", { name: "ใบรับรองที่ไม่มีคำขอยกเลิก" }),
      );
    });

    test("TC-006: แสดงตารางรายการพร้อมคอลัมน์หลัก 006", async ({ page }) => {
      const table = await waitForCertificatesTable(page);
      const thead = table.locator("thead");
      for (const header of TABLE_HEADERS) {
        await expect(thead).toContainText(header);
      }
    });

    test("TC-007: ปุ่ม “ถัดไป” ถูกปิดก่อนเลือกแถว 007", async ({ page }) => {
      const nextButton = getStepNextButton(page);
      await expectVisible(nextButton);
      await expect(nextButton).toBeDisabled();
    });

    test("TC-008: เลือกแถวแล้ว “ถัดไป” ใช้งานได้ 008", async ({
      page,
    }, testInfo) => {
      const { rows } = await ensureHasDataRows(page, testInfo);
      const firstRow = rows.first();
      await firstRow.click();
      await expect(firstRow).toHaveClass(/bg-green-50/);
      const nextButton = getStepNextButton(page);
      await expectVisible(nextButton);
      await expect(nextButton).toBeEnabled();
    });

    test("TC-009: กด “ถัดไป” ไป Step 2 009", async ({ page }, testInfo) => {
      await goToStep2FromFirstRow(page, testInfo);
    });

    test("TC-010: เปลี่ยนแท็บแล้วล้างการเลือกแถว 010", async ({
      page,
    }, testInfo) => {
      const { rows } = await ensureHasDataRows(page, testInfo);
      const firstRow = rows.first();
      await firstRow.click();
      await expect(firstRow).toHaveClass(/bg-green-50/);
      await expect(getStepNextButton(page)).toBeEnabled();

      await page
        .getByRole("button", { name: "ใบรับรองที่ไม่มีคำขอยกเลิก" })
        .click();

      await expect(getStepNextButton(page)).toBeDisabled();
      await expect(page.locator("tbody tr.bg-green-50")).toHaveCount(0);
    });

    test("TC-011: ค้นหาด้วยช่วงวันที่ (ส่งค่าไป API) 011", async ({ page }) => {
      const fromInput = getCalendarInput(page, "fromDate");
      const toInput = getCalendarInput(page, "toDate");
      await selectFirstAvailableDate(page, fromInput, "fromDate");
      await selectFirstAvailableDate(page, toInput, "toDate");

      const requestPromise = waitForRevokeListRequest(page, (url) => {
        return (
          url.searchParams.has("fromDate") && url.searchParams.has("toDate")
        );
      });

      await page.getByRole("button", { name: BUTTON_SEARCH }).click();
      await requestPromise;
      await waitForCertificatesTable(page);
    });

    test("TC-012: ล้างค่าตัวกรอง 012", async ({ page }, testInfo) => {
      const fromInput = getCalendarInput(page, "fromDate");
      const toInput = getCalendarInput(page, "toDate");
      await selectFirstAvailableDate(page, fromInput, "fromDate");
      const fromValue = await fromInput.inputValue();
      if (!fromValue) {
        testInfo.skip("ไม่สามารถตั้งวันที่เริ่มเพื่อทดสอบล้างค่า");
      }
      const requestPromise = waitForRevokeListRequest(page, (url) => {
        return (
          !url.searchParams.has("fromDate") && !url.searchParams.has("toDate")
        );
      });

      await page.getByRole("button", { name: BUTTON_CLEAR }).click();
      await requestPromise;

      await expect(fromInput).toHaveValue("");
      await expect(toInput).toHaveValue("");
    });
  });

  test.describe("การดูไฟล์ (ปุ่มไอคอนรูปตา)", () => {
    test.skip(
      !HAS_COMMITTEE_CREDS,
      "ยังไม่ได้ตั้งค่า E2E committee credentials",
    );
    // test.describe.configure({ mode: "serial", timeout: 60000 });

    test.beforeEach(async ({ page }) => {
      await page.unroute("**/api/v1/files/get-files**");
      await loginAsCommittee(page, COMMITTEE_USER);
      await gotoRevokePage(page);
      await waitForCertificatesTable(page);
    });

    test("TC-013: เปิดไฟล์สำเร็จ (มี URL) 013", async ({ page }, testInfo) => {
      const fileUrl = "https://example.com/certificate-mock.pdf";
      const fileName = "certificate-mock.pdf";
      await mockFilesApi(page, async () => ({
        body: { files: [{ url: fileUrl, fileName }] },
      }));
      await clickFirstRowEyeAndWaitForFiles(page, testInfo);

      await expectVisible(page.getByRole("button", { name: BUTTON_BACK }));
      await expectVisible(page.getByText(fileName));
      const iframe = page.locator('iframe[title="PDF Viewer"]').first();
      await expectVisible(iframe);
      await expect(iframe).toHaveAttribute("src", /certificate-mock\.pdf/);
    });

    test("TC-014: ไม่มีไฟล์ 014", async ({ page }, testInfo) => {
      await mockFilesApi(page, async () => ({
        body: { files: [] },
      }));
      await clickFirstRowEyeAndWaitForFiles(page, testInfo);

      await expectVisible(page.getByText("ไม่พบไฟล์สำหรับใบรับรองนี้"));
    });

    test("TC-015: ไฟล์ไม่มี URL 015", async ({ page }, testInfo) => {
      await mockFilesApi(page, async () => ({
        body: { files: [{ url: null }] },
      }));
      await clickFirstRowEyeAndWaitForFiles(page, testInfo);

      await expectVisible(page.getByText("ไม่พบ URL ของไฟล์"));
    });

    test("TC-016: ดึงไฟล์ล้มเหลว 016", async ({ page }, testInfo) => {
      await mockFilesApi(page, async () => ({
        status: 500,
        body: { message: "error" },
      }));
      await clickFirstRowEyeAndWaitForFiles(page, testInfo);

      await expectVisible(page.getByText("เกิดข้อผิดพลาดขณะดึงไฟล์"));
    });
  });

  test.describe("Step 2 — ยกเลิกใบรับรอง", () => {
    test.skip(
      !HAS_COMMITTEE_CREDS,
      "ยังไม่ได้ตั้งค่า E2E committee credentials",
    );
    // test.describe.configure({ mode: "serial", timeout: 60000 });

    test.beforeEach(async ({ page }) => {
      await loginAsCommittee(page, COMMITTEE_USER);
      await gotoRevokePage(page);
      await waitForCertificatesTable(page);
    });

    test("TC-017: แสดงรายละเอียดคำขอยกเลิก (อ่านอย่างเดียว) 017", async ({
      page,
    }, testInfo) => {
      await goToStep2FromFirstRow(page, testInfo);
      const textarea = page.locator("#cancelRequestDetail");
      await expectVisible(page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง"));
      await expect(textarea).toBeDisabled();
    });

    test("TC-018: ปุ่ม “ย้อนกลับ” กลับไป Step 1 018", async ({
      page,
    }, testInfo) => {
      await goToStep2FromFirstRow(page, testInfo);
      await page.getByRole("button", { name: BUTTON_BACK }).click();

      await waitForCertificatesTable(page);
      await expect(page.locator("tbody tr.bg-green-50")).toHaveCount(1);
      await expect(getStepNextButton(page)).toBeEnabled();
    });

    test("TC-019: ยืนยันยกเลิกสำเร็จ (ลบไฟล์สำเร็จ) 019", async ({
      page,
    }, testInfo) => {
      await page.route("**/api/v1/certificates/revoke", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      });
      await page.route("**/api/v1/files/delete**", async (route) => {
        if (route.request().method() !== "DELETE") return route.continue();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      });

      await goToStep2FromFirstRow(page, testInfo);
      await page.getByRole("button", { name: BUTTON_REVOKE }).click();

      await expectVisible(page.getByText("ยกเลิกใบรับรองเรียบร้อยแล้ว"));
      await expect(getStepNextButton(page)).toBeDisabled();
      await expect(page.locator("tbody tr.bg-green-50")).toHaveCount(0);
    });

    test("TC-020: ยืนยันยกเลิกสำเร็จ (แต่ลบไฟล์ไม่สำเร็จ) 020", async ({
      page,
    }, testInfo) => {
      await page.route("**/api/v1/certificates/revoke", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      });
      await page.route("**/api/v1/files/delete**", async (route) => {
        if (route.request().method() !== "DELETE") return route.continue();
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "error" }),
        });
      });

      await goToStep2FromFirstRow(page, testInfo);
      await page.getByRole("button", { name: BUTTON_REVOKE }).click();

      await expectVisible(
        page.getByText("ยกเลิกใบรับรองเรียบร้อยแล้ว (แต่ไม่สามารถลบไฟล์ได้)"),
      );
      await expect(getStepNextButton(page)).toBeDisabled();
    });

    test("TC-021: ยืนยันยกเลิกล้มเหลว 021", async ({ page }, testInfo) => {
      await page.route("**/api/v1/certificates/revoke", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await route.fulfill({
          status: 500,
          contentType: "text/plain",
          body: "error",
        });
      });

      await goToStep2FromFirstRow(page, testInfo);
      await page.getByRole("button", { name: BUTTON_REVOKE }).click();

      await expectVisible(page.getByText("เกิดข้อผิดพลาดขณะยกเลิกใบรับรอง"));
      await expectVisible(page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง"));
    });
  });
});
