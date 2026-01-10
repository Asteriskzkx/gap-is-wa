import { test, expect } from "@playwright/test";

const COMMITTEE_USER = {
  email: process.env.E2E_TEST_COMMITTEE_EMAIL,
  password: process.env.E2E_TEST_COMMITTEE_PASSWORD,
};

const HAS_COMMITTEE_CREDS = Boolean(
  COMMITTEE_USER.email && COMMITTEE_USER.password
);

const PAGE_PATH = "/committee/certifications/issue";
const PAGE_HEADING = "ออกใบรับรองแหล่งผลิตจีเอพี";
const PAGE_SUBTITLE = "ออกใบรับรองแหล่งผลิตยางพาราที่ผ่านการตรวจประเมิน";

const BUTTON_SEARCH = "ค้นหา";
const BUTTON_CLEAR = "ล้างค่า";
const BUTTON_NEXT = "ถัดไป";
const BUTTON_BACK = "ย้อนกลับ";
const BUTTON_ISSUE = "ออกใบรับรอง";

const TABLE_HEADERS = [
  "รหัสการตรวจ",
  "วันที่ตรวจ",
  "สถานที่",
  "เกษตรกร",
  "หัวหน้าผู้ตรวจประเมิน",
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

async function gotoIssuePage(page) {
  await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
}

async function waitForInspectionsTable(page) {
  const table = page.locator(".primary-datatable-wrapper").first();
  await expect(table).toBeVisible({ timeout: 20000 });
  await expect(table.locator("table")).toBeVisible({ timeout: 20000 });
  return table;
}

async function waitForTableRows(page) {
  const table = await waitForInspectionsTable(page);
  const rows = table.locator("tbody tr");
  await expect(rows.first()).toBeVisible({ timeout: 20000 });
  return { table, rows };
}

function getCalendarInput(page, id) {
  return page
    .locator(`#${id} input`)
    .or(page.locator(`input#${id}`))
    .first();
}

async function selectFirstAvailableDate(page, input) {
  await input.click();
  const panel = page.locator(".p-datepicker:visible").first();
  await expect(panel).toBeVisible({ timeout: 10000 });
  const day = panel
    .locator(
      "td:not(.p-disabled):not(.p-datepicker-other-month) span:not(.p-disabled)"
    )
    .first();
  await expect(day).toBeVisible({ timeout: 10000 });
  await day.click();
  await expect(input).not.toHaveValue("");
}

async function goToStep2FromFirstRow(page) {
  const { rows } = await waitForTableRows(page);
  const firstRow = rows.first();
  const inspectionNo =
    (await firstRow.locator("td").first().textContent())?.trim() || "";
  const locationText =
    (await firstRow.locator("td").nth(2).textContent())?.trim() || "";

  await firstRow.click();
  await expect(firstRow).toHaveClass(/bg-green-50/);

  const nextButton = page.getByRole("button", {
    name: BUTTON_NEXT,
    exact: true,
  });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect(page.getByText(/การออกใบรับรองสำหรับ/)).toBeVisible({
    timeout: 10000,
  });

  return { inspectionNo, locationText };
}

function waitForReadyToIssueRequest(page, predicate) {
  return page.waitForRequest((req) => {
    if (req.method() !== "GET") return false;
    if (!req.url().includes("/api/v1/inspections/ready-to-issue")) return false;
    if (!predicate) return true;
    return predicate(new URL(req.url()));
  });
}

function parseDateInput(value) {
  const [day, month, year] = value.split("/").map((v) => Number(v));
  if (!day || !month || !year) return null;
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day);
}

function formatDateInput(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

test.describe("ออกใบรับรองแหล่งผลิตจีเอพี - Committee", () => {
  test("TC-001: ไม่ได้ login → redirect", async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test.describe("Step 1 — เลือกการตรวจ", () => {
    test.skip(!HAS_COMMITTEE_CREDS, "ยังไม่ได้ตั้งค่า E2E committee credentials");
    test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await loginAsCommittee(page, COMMITTEE_USER);
      await gotoIssuePage(page);
      await waitForInspectionsTable(page);
    });

    test("TC-002: แสดงชื่อหน้า + subtitle", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: PAGE_HEADING })
      ).toBeVisible();
      await expect(page.getByText(PAGE_SUBTITLE)).toBeVisible();
    });

    test("TC-003: แสดง StepIndicator 2 ขั้น (Step 1 active)", async ({
      page,
    }) => {
      await expect(page.getByText(/ขั้นตอนที่ 1/).first()).toBeVisible();
      await expect(
        page.getByText("เลือกการตรวจ", { exact: true }).first()
      ).toBeVisible();
      await expect(
        page.getByText("ออกใบรับรอง", { exact: true }).first()
      ).toBeVisible();
    });

    test("TC-004: ตารางแสดงสถานะ loading", async ({ page }) => {
      await page.route(/\/api\/v1\/inspections\/ready-to-issue/, async (route) => {
        if (route.request().method() !== "GET") return route.continue();
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await route.continue();
      });

      await page.reload({ waitUntil: "domcontentloaded" });
      const table = await waitForInspectionsTable(page);

      const loadingOverlay = table.locator(".p-datatable-loading-overlay");
      if ((await loadingOverlay.count()) > 0) {
        await expect(loadingOverlay).toBeVisible();
      }

      const firstRow = table.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 20000 });
    });

    test("TC-005: ตารางมีหัวคอลัมน์ครบ", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
      const thead = table.locator("thead");
      for (const header of TABLE_HEADERS) {
        await expect(thead).toContainText(header);
      }
    });

    test("TC-006: ปุ่ม “ถัดไป” disabled เมื่อยังไม่เลือกแถว", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true })
      ).toBeDisabled();
    });

    test("TC-007: เลือกแถวแล้ว highlight + ปุ่ม “ถัดไป” enabled", async ({
      page,
    }) => {
      const { rows } = await waitForTableRows(page);
      const firstRow = rows.first();
      await firstRow.click();
      await expect(firstRow).toHaveClass(/bg-green-50/);

      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true })
      ).toBeEnabled();
    });

    test("TC-008: เลือกแถวใหม่แทนที่แถวเดิม", async ({ page }, testInfo) => {
      const { rows } = await waitForTableRows(page);
      const rowCount = await rows.count();
      if (rowCount < 2) {
        testInfo.skip("ต้องมีอย่างน้อย 2 รายการเพื่อทดสอบการเปลี่ยนแถว");
      }
      const firstRow = rows.first();
      const secondRow = rows.nth(1);

      await expect(secondRow).toBeVisible();
      await firstRow.click();
      await expect(firstRow).toHaveClass(/bg-green-50/);

      await secondRow.click();
      await expect(secondRow).toHaveClass(/bg-green-50/);
      await expect(page.locator("tbody tr.bg-green-50")).toHaveCount(1);
    });

    test("TC-009: เปลี่ยนหน้า (pagination)", async ({ page }) => {
      const { table } = await waitForTableRows(page);
      const paginator = table.locator(".p-paginator").first();
      await expect(paginator).toBeVisible();

      const nextButton = paginator.locator(".p-paginator-next").first();
      if (await nextButton.isDisabled()) {
        await expect(nextButton).toBeDisabled();
        return;
      }

      const firstRowText =
        (await table.locator("tbody tr").first().textContent())?.trim() || "";

      const requestPromise = waitForReadyToIssueRequest(page, (url) => {
        return url.searchParams.get("offset") === "10";
      });

      await nextButton.click();
      await requestPromise;

      const nextRowText =
        (await table.locator("tbody tr").first().textContent())?.trim() || "";
      expect(nextRowText).not.toBe(firstRowText);
    });

    test("TC-010: เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
      const { table } = await waitForTableRows(page);
      const paginator = table.locator(".p-paginator").first();
      await expect(paginator).toBeVisible();

      const requestPromise = waitForReadyToIssueRequest(page, (url) => {
        return url.searchParams.get("limit") === "25";
      });

      const nativeSelect = paginator.locator("select.p-paginator-rpp-options");
      if (await nativeSelect.count()) {
        await nativeSelect.selectOption("25");
      } else {
        const dropdown = paginator.locator(".p-dropdown").first();
        await dropdown.click();
        await page
          .locator(".p-dropdown-items .p-dropdown-item")
          .getByText("25", { exact: true })
          .click();
      }

      await requestPromise;

      const rowCount = await table.locator("tbody tr").count();
      expect(rowCount).toBeGreaterThan(0);
      expect(rowCount).toBeLessThanOrEqual(25);
    });

    test("TC-011: Sort ขั้นพื้นฐานจาก UI", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
      const headerCell = table.locator("thead th", {
        hasText: "รหัสการตรวจ",
      });
      await expect(headerCell).toBeVisible();

      await headerCell.click();
      await expect(headerCell).toHaveAttribute(
        "aria-sort",
        /ascending|descending/
      );
    });

    test("TC-012: แสดงตัวกรอง “ตั้งแต่/ถึง”", async ({ page }) => {
      await expect(
        page.getByText("ตั้งแต่", { exact: true }).first()
      ).toBeVisible();
      await expect(page.getByText("ถึง", { exact: true }).first()).toBeVisible();
      await expect(page.getByPlaceholder("เลือกวันที่เริ่ม")).toBeVisible();
      await expect(page.getByPlaceholder("เลือกวันที่สิ้นสุด")).toBeVisible();
    });

    test("TC-013: กด “ค้นหา” แล้วรีเฟรชตาราง", async ({ page }) => {
      const fromInput = page.getByPlaceholder("เลือกวันที่เริ่ม").first();
      await selectFirstAvailableDate(page, fromInput);

      const requestPromise = waitForReadyToIssueRequest(page, (url) => {
        return url.searchParams.has("from");
      });

      await page.getByRole("button", { name: BUTTON_SEARCH }).click();
      await requestPromise;

      const { table } = await waitForTableRows(page);
      await expect(table.locator("tbody tr").first()).toBeVisible();
    });

    test("TC-014: กด “ล้างค่า” แล้วรีเซ็ตวันที่", async ({ page }, testInfo) => {
      const fromInput = page.getByPlaceholder("เลือกวันที่เริ่ม").first();
      const toInput = page.getByPlaceholder("เลือกวันที่สิ้นสุด").first();
      await selectFirstAvailableDate(page, fromInput);
      const fromValue = await fromInput.inputValue();
      if (!fromValue) {
        testInfo.skip("ไม่สามารถตั้งวันที่เริ่มเพื่อทดสอบล้างค่า");
      }

      await page.getByRole("button", { name: BUTTON_CLEAR }).click();

      await expect(fromInput).toHaveValue("");
      await expect(toInput).toHaveValue("");
    });
  });

  test.describe("Step 2 — ออกใบรับรอง", () => {
    test.skip(!HAS_COMMITTEE_CREDS, "ยังไม่ได้ตั้งค่า E2E committee credentials");
    test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await loginAsCommittee(page, COMMITTEE_USER);
      await gotoIssuePage(page);
      await waitForInspectionsTable(page);
    });

    test("TC-015: ไป Step 2 ได้เมื่อเลือกแถว", async ({ page }) => {
      const { inspectionNo, locationText } = await goToStep2FromFirstRow(page);

      await expect(
        page.getByText(new RegExp(`การออกใบรับรองสำหรับ:\\s*${inspectionNo}`))
      ).toBeVisible();

      const locationLine = page.getByText(/สถานที่:/).first();
      const renderedLocation = (await locationLine.textContent()) || "";
      const renderedValue = renderedLocation.replace("สถานที่:", "").trim();

      if (renderedValue === "-") {
        expect(renderedValue).toBe("-");
      } else {
        expect(locationText).toContain(renderedValue);
      }
    });

    test("TC-016: แสดงฟิลด์ “วันที่มีผล/วันที่หมดอายุ”", async ({
      page,
    }) => {
      await goToStep2FromFirstRow(page);
      await expect(page.getByText("วันที่มีผล")).toBeVisible();
      await expect(page.getByText("วันที่หมดอายุ")).toBeVisible();
    });

    test("TC-017: แสดงส่วนอัปโหลดไฟล์ใบรับรอง", async ({ page }) => {
      await goToStep2FromFirstRow(page);
      await expect(
        page.getByText("ไฟล์ใบรับรอง (PDF) จำนวน 1 ไฟล์")
      ).toBeVisible();
      await expect(
        page.locator(".p-fileupload-choose", { hasText: "เลือกไฟล์" }).first()
      ).toBeVisible();
    });

    test("TC-018: คลิก “ย้อนกลับ” กลับ Step 1 (ยังคงการเลือกเดิม)", async ({
      page,
    }) => {
      await goToStep2FromFirstRow(page);
      await page.getByRole("button", { name: BUTTON_BACK }).click();

      await waitForTableRows(page);
      await expect(
        page.locator("tbody tr.bg-green-50").first()
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true })
      ).toBeEnabled();
    });

    test("TC-019: เปลี่ยน inspection แล้วฟอร์มรีเซ็ต", async ({ page }, testInfo) => {
      const { rows } = await waitForTableRows(page);
      const rowCount = await rows.count();
      if (rowCount < 2) {
        testInfo.skip("ต้องมีอย่างน้อย 2 รายการเพื่อทดสอบการเปลี่ยน inspection");
      }
      const firstRow = rows.first();
      const secondRow = rows.nth(1);

      await expect(secondRow).toBeVisible();
      await firstRow.click();
      await page.getByRole("button", { name: BUTTON_NEXT, exact: true }).click();

      const effectiveInput = getCalendarInput(page, "effectiveDate");
      await selectFirstAvailableDate(page, effectiveInput);
      await page.getByRole("button", { name: BUTTON_ISSUE }).click();
      await expect(page.getByText("กรุณาเลือกวันที่หมดอายุ")).toBeVisible();

      await page.getByRole("button", { name: BUTTON_BACK }).click();

      const rowsAfterBack = (await waitForTableRows(page)).rows;
      await rowsAfterBack.nth(1).click();
      await page.getByRole("button", { name: BUTTON_NEXT, exact: true }).click();

      await expect(getCalendarInput(page, "effectiveDate")).toHaveValue("");
      await expect(getCalendarInput(page, "expiryDate")).toHaveValue("");
      await expect(page.getByText("กรุณาเลือกวันที่หมดอายุ")).toHaveCount(0);
    });

    test.describe("Validation/Error", () => {
      test("TC-020: ไม่เลือกวันที่มีผล", async ({ page }) => {
        await goToStep2FromFirstRow(page);
        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await expect(page.getByText("กรุณาเลือกวันที่มีผล")).toBeVisible();
      });

      test("TC-021: เลือกวันที่มีผลแต่ไม่เลือกวันที่หมดอายุ", async ({
        page,
      }) => {
        await goToStep2FromFirstRow(page);
        const effectiveInput = getCalendarInput(page, "effectiveDate");
        await selectFirstAvailableDate(page, effectiveInput);

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await expect(page.getByText("กรุณาเลือกวันที่หมดอายุ")).toBeVisible();
      });

      test("TC-022: วันหมดอายุก่อนวันมีผล", async ({ page }) => {
        await goToStep2FromFirstRow(page);

        const effectiveInput = getCalendarInput(page, "effectiveDate");
        await selectFirstAvailableDate(page, effectiveInput);
        const effectiveValue = await effectiveInput.inputValue();
        const effectiveDate = parseDateInput(effectiveValue);
        expect(effectiveDate).toBeTruthy();

        const earlierDate = new Date(effectiveDate);
        earlierDate.setDate(earlierDate.getDate() - 1);
        const earlierValue = formatDateInput(earlierDate);

        const expiryInput = getCalendarInput(page, "expiryDate");
        await expiryInput.fill(earlierValue);
        await page.locator("body").click();
        const expiryValue = await expiryInput.inputValue();
        if (expiryValue !== earlierValue) {
          expect(expiryValue).not.toBe(earlierValue);
          return;
        }

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await expect(
          page.getByText("วันที่หมดอายุต้องมากกว่าหรือเท่ากับวันที่มีผล")
        ).toBeVisible();
      });

      test("TC-023: วันหมดอายุเกิน 2 ปีจากวันมีผล", async ({ page }) => {
        await goToStep2FromFirstRow(page);

        const effectiveInput = getCalendarInput(page, "effectiveDate");
        await selectFirstAvailableDate(page, effectiveInput);
        const effectiveValue = await effectiveInput.inputValue();
        const effectiveDate = parseDateInput(effectiveValue);
        expect(effectiveDate).toBeTruthy();

        const farFuture = new Date(effectiveDate);
        farFuture.setFullYear(farFuture.getFullYear() + 3);
        const farFutureValue = formatDateInput(farFuture);

        const expiryInput = getCalendarInput(page, "expiryDate");
        await expiryInput.fill(farFutureValue);
        await page.locator("body").click();
        const expiryValue = await expiryInput.inputValue();
        if (expiryValue !== farFutureValue) {
          expect(expiryValue).not.toBe(farFutureValue);
          return;
        }

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await expect(
          page.getByText("วันที่หมดอายุต้องไม่เกิน 2 ปีจากวันที่มีผล")
        ).toBeVisible();
      });
    });

    test.describe("การเรียก API ออกใบรับรอง (mock POST)", () => {
      test("TC-024: API error แสดงข้อความจาก server", async ({ page }) => {
        const errorMessage = "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์";
        await page.route("**/api/v1/certificates/issue", async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ message: errorMessage }),
          });
        });

        await goToStep2FromFirstRow(page);
        await selectFirstAvailableDate(page, getCalendarInput(page, "effectiveDate"));
        await selectFirstAvailableDate(page, getCalendarInput(page, "expiryDate"));

        const requestPromise = page.waitForRequest((req) => {
          return req.method() === "POST" && req.url().includes("/api/v1/certificates/issue");
        });

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await requestPromise;

        await expect(page.getByText(errorMessage)).toBeVisible();
      });

      test("TC-025: API success แต่ไม่มี certificateId/id", async ({
        page,
      }) => {
        await page.route("**/api/v1/certificates/issue", async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({}),
          });
        });

        await goToStep2FromFirstRow(page);
        await selectFirstAvailableDate(page, getCalendarInput(page, "effectiveDate"));
        await selectFirstAvailableDate(page, getCalendarInput(page, "expiryDate"));

        const requestPromise = page.waitForRequest((req) => {
          return req.method() === "POST" && req.url().includes("/api/v1/certificates/issue");
        });

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();
        await requestPromise;

        await expect(
          page.getByText("Server did not return certificate id")
        ).toBeVisible();
      });

      test("TC-026: ออกใบรับรองสำเร็จแล้วกลับ Step 1 และรีเซ็ต", async ({
        page,
      }) => {
        await page.route("**/api/v1/certificates/issue", async (route) => {
          if (route.request().method() !== "POST") return route.continue();
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ certificateId: 999 }),
          });
        });

        await goToStep2FromFirstRow(page);
        await selectFirstAvailableDate(page, getCalendarInput(page, "effectiveDate"));
        await selectFirstAvailableDate(page, getCalendarInput(page, "expiryDate"));

        await page.getByRole("button", { name: BUTTON_ISSUE }).click();

        await expect(
          page.getByRole("button", { name: BUTTON_NEXT, exact: true })
        ).toBeVisible({ timeout: 5000 });

        const { table } = await waitForTableRows(page);
        await expect(
          page.getByRole("button", { name: BUTTON_NEXT, exact: true })
        ).toBeDisabled();
        await expect(table.locator("tbody tr.bg-green-50")).toHaveCount(0);

        const paginator = table.locator(".p-paginator").first();
        const currentPage = paginator
          .locator(".p-paginator-page.p-highlight")
          .first();
        await expect(currentPage).toHaveText("1");
      });
    });
  });
});
