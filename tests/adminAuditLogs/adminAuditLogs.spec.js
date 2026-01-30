import { expect, test } from "@playwright/test";

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

const DIALOG_TITLE_DELETE = "ล้างข้อมูลเก่า";
const DIALOG_TITLE_DETAIL = "รายละเอียดบันทึกเหตุการณ์";
const DIALOG_BUTTON_CONFIRM_DELETE = "ยืนยันการลบ";
const DIALOG_BUTTON_CANCEL = "ยกเลิก";
const DIALOG_BUTTON_CLOSE = "ปิด";

const TABLE_HEADERS = [
  "รหัส",
  "ตาราง",
  "การดำเนินการ",
  "รหัสข้อมูลในตาราง",
  "ชื่อผู้ดำเนินการ",
  "วันที่ดำเนินการ",
];

const TABLE_NAME_LABELS = {
  User: "ผู้ใช้ (User)",
  Farmer: "เกษตรกร (Farmer)",
  Auditor: "ผู้ตรวจประเมิน (Auditor)",
  Committee: "คณะกรรมการ (Committee)",
  Admin: "ผู้ดูแลระบบ (Admin)",
  RubberFarm: "แปลงสวนยางพารา (RubberFarm)",
  PlantingDetail: "รายละเอียดการปลูก (PlantingDetail)",
  Inspection: "การตรวจประเมิน (Inspection)",
  DataRecord: "ข้อมูลประจำสวนยาง (DataRecord)",
  AdviceAndDefect: "การให้คำปรึกษาและข้อบกพร่อง (AdviceAndDefect)",
  Certificate: "ใบรับรอง (Certificate)",
};

const ACTION_LABELS = {
  CREATE: "เพิ่มข้อมูล (CREATE)",
  UPDATE: "แก้ไขข้อมูล (UPDATE)",
  DELETE: "ลบข้อมูล (DELETE)",
};

const FILTER_PLACEHOLDERS = {
  tableName: "เลือกตาราง",
  recordId: "ระบุรหัสข้อมูลในตาราง",
  userId: "ระบุรหัสผู้ใช้",
  action: "เลือกการดำเนินการ",
  startDate: "เลือกวันที่เริ่มต้น",
  endDate: "เลือกวันที่สิ้นสุด",
};

function resolveTableNameLabel(tableName) {
  return TABLE_NAME_LABELS[tableName] || tableName || "-";
}

function resolveActionLabel(action) {
  return ACTION_LABELS[action] || action || "-";
}

async function expectVisible(locator, options) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible(options);
  return locator;
}

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
        String(el.className).includes("roleButtonActive"),
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
    page.waitForURL(/\/admin\/dashboard/, {
      timeout: 40000,
      waitUntil: "domcontentloaded",
    }),
    page.locator('button[type="submit"]').click(),
  ]);
}

function isAuditLogsPaginatedRequest(req) {
  return (
    req.method() === "GET" && req.url().includes("/api/v1/audit-logs/paginated")
  );
}

function isAuditLogsPaginatedResponse(resp) {
  return (
    resp.request().method() === "GET" &&
    resp.url().includes("/api/v1/audit-logs/paginated")
  );
}

async function waitForAuditLogsResponse(page, predicate) {
  return page.waitForResponse((resp) => {
    if (!isAuditLogsPaginatedResponse(resp)) return false;
    if (!predicate) return true;
    return predicate(resp);
  });
}

async function waitForAuditLogsRequest(page, predicate) {
  return page.waitForRequest((req) => {
    if (!isAuditLogsPaginatedRequest(req)) return false;
    if (!predicate) return true;
    return predicate(new URL(req.url()));
  });
}

async function readAuditLogsResponse(response) {
  try {
    const data = await response.json();
    return {
      results: Array.isArray(data?.results) ? data.results : [],
      paginator: data?.paginator || {},
    };
  } catch (error) {
    return { results: [], paginator: {} };
  }
}

async function gotoAuditLogsPageAndWaitForData(page) {
  const [response] = await Promise.all([
    waitForAuditLogsResponse(page),
    page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" }),
  ]);
  await expectVisible(page.getByRole("heading", { name: PAGE_HEADING }));
  return response;
}

async function waitForAuditLogsTable(page) {
  const table = page.locator(".primary-datatable-wrapper").first();
  await expectVisible(table, { timeout: 20000 });
  await expectVisible(table.locator("table"), { timeout: 20000 });
  return table;
}

async function getAuditLogsTableState(page) {
  const table = await waitForAuditLogsTable(page);
  const rows = table.locator("tbody tr");
  await expectVisible(rows.first(), { timeout: 20000 });
  const firstRowText = ((await rows.first().textContent()) || "").trim();
  const hasData = Boolean(
    firstRowText && !firstRowText.includes("ไม่พบข้อมูล"),
  );
  return { table, rows, hasData, firstRowText };
}

async function getCellText(row, index) {
  const cellText = await row.locator("td").nth(index).textContent();
  return (cellText || "").trim();
}

function getAutoCompleteInput(page, id) {
  return page
    .locator(`input#${id}`)
    .or(page.locator(`#${id} input`))
    .first();
}

function getAutoCompleteWidget(page, id) {
  const wrapper = page.locator(`#${id}`);
  const inputWrapper = page.locator(`input#${id}`).locator("..");
  return wrapper.or(inputWrapper);
}

async function selectAutoCompleteOption(page, id, optionLabel) {
  const widget = getAutoCompleteWidget(page, id);
  const dropdown = widget.locator("button.p-autocomplete-dropdown").first();
  await dropdown.click();

  const panel = page.locator(".p-autocomplete-panel:visible").first();
  await expectVisible(panel, { timeout: 10000 });
  await panel
    .locator('[role="option"]')
    .getByText(optionLabel, { exact: true })
    .click();

  await expect(getAutoCompleteInput(page, id)).toHaveValue(optionLabel);
}

function getInputNumber(page, id) {
  return page
    .locator(`input#${id}`)
    .or(page.locator(`#${id} input`))
    .first();
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

function getDeleteDialog(page) {
  return page
    .locator(".p-dialog")
    .filter({ hasText: DIALOG_TITLE_DELETE })
    .first();
}

function getDetailDialog(page) {
  return page
    .locator(".p-dialog")
    .filter({ hasText: DIALOG_TITLE_DETAIL })
    .first();
}

function getDetailFieldValue(dialog, label) {
  return dialog
    .getByText(label, { exact: true })
    .first()
    .locator("..")
    .locator("p")
    .first();
}

function waitForOldLogsCountResponse(page, days) {
  return page.waitForResponse((resp) => {
    if (resp.request().method() !== "GET") return false;
    if (!resp.url().includes("/api/v1/audit-logs/old/count")) return false;
    if (!days) return true;
    const url = new URL(resp.url());
    return url.searchParams.get("days") === String(days);
  });
}

async function readOldLogsCount(response) {
  try {
    const data = await response.json();
    return Number(data?.count || 0);
  } catch (error) {
    return 0;
  }
}

async function openDeleteDialogAndReadCount(page) {
  const [response] = await Promise.all([
    waitForOldLogsCountResponse(page, 90),
    page.getByRole("button", { name: BUTTON_DELETE_OLD_LOGS }).click(),
  ]);
  const count = await readOldLogsCount(response);
  const dialog = getDeleteDialog(page);
  await expectVisible(dialog, { timeout: 10000 });
  return { dialog, count, days: 90 };
}

async function setDeleteDaysAndReadCount(page, days) {
  const input = getInputNumber(page, "deleteDays");
  await expectVisible(input);
  const responsePromise = waitForOldLogsCountResponse(page, days);
  await input.fill(String(days));
  await page.keyboard.press("Tab");
  const response = await responsePromise;
  const count = await readOldLogsCount(response);
  return { count, days };
}

test.describe("ตรวจสอบเหตุการณ์ในระบบ - Access", () => {
  test("TC-001: ต้อง login ก่อนเข้าใช้งาน", async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 10000,
    });
    await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
  });
});

test.describe("ตรวจสอบเหตุการณ์ในระบบ - Filters & Table", () => {
  test.skip(!HAS_ADMIN_CREDS, "ยังไม่ได้ตั้งค่า E2E admin credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, ADMIN_USER);
    const response = await gotoAuditLogsPageAndWaitForData(page);
    page.__auditLogsData = await readAuditLogsResponse(response);
  });

  test("TC-002: แสดงหัวข้อและคำอธิบายหน้า", async ({ page }) => {
    await expectVisible(page.getByRole("heading", { name: PAGE_HEADING }));
    await expectVisible(page.getByText(PAGE_SUBTITLE));
  });

  test("TC-003: แสดงตัวกรองทั้งหมด", async ({ page }) => {
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.tableName));
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.recordId));
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.userId));
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.action));
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.startDate));
    await expectVisible(page.getByPlaceholder(FILTER_PLACEHOLDERS.endDate));
  });

  test("TC-004: แสดงปุ่มหลักบนแถบตัวกรอง", async ({ page }) => {
    await expectVisible(
      page.getByRole("button", { name: BUTTON_DELETE_OLD_LOGS }),
    );
    await expectVisible(page.getByRole("button", { name: BUTTON_SEARCH }));
    await expectVisible(page.getByRole("button", { name: BUTTON_CLEAR }));
  });

  test("TC-005: แสดงตารางพร้อมคอลัมน์หลัก", async ({ page }) => {
    const table = await waitForAuditLogsTable(page);
    const thead = table.locator("thead");
    for (const header of TABLE_HEADERS) {
      await expect(thead).toContainText(header);
    }
  });

  test("TC-006: แสดง mapping ของ “ตาราง/การดำเนินการ” เป็นข้อความไทย", async ({
    page,
  }) => {
    const { table, rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }

    const auditData = page.__auditLogsData || { results: [] };
    const firstItem = auditData.results?.[0];
    const firstRow = rows.first();

    const tableCellText = await getCellText(firstRow, 1);
    const actionCellText = await getCellText(firstRow, 2);

    if (firstItem) {
      expect(tableCellText).toContain(
        resolveTableNameLabel(firstItem.tableName),
      );
      expect(actionCellText).toContain(resolveActionLabel(firstItem.action));
    } else {
      expect(tableCellText.length).toBeGreaterThan(0);
      expect(actionCellText.length).toBeGreaterThan(0);
    }
  });

  test("TC-007: กด “ค้นหา” แล้วผลลัพธ์เปลี่ยนตามตัวกรอง", async ({ page }) => {
    await selectAutoCompleteOption(page, "tableName", "ผู้ใช้ (User)");

    const requestPromise = waitForAuditLogsRequest(page, (url) => {
      return url.searchParams.get("tableName") === "User";
    });

    await page.getByRole("button", { name: BUTTON_SEARCH }).click();
    await requestPromise;
    await waitForAuditLogsTable(page);
  });

  test("TC-008: กด “ล้างตัวกรอง” แล้วกลับค่าเริ่มต้น", async ({ page }) => {
    await selectAutoCompleteOption(page, "tableName", "ผู้ใช้ (User)");
    await selectAutoCompleteOption(page, "action", "เพิ่มข้อมูล (CREATE)");

    const recordInput = getInputNumber(page, "recordId");
    const userInput = getInputNumber(page, "userId");
    await recordInput.fill("1");
    await userInput.fill("1");

    const startDateInput = getCalendarInput(page, "fromDate");
    await selectFirstAvailableDate(page, startDateInput, "fromDate");

    const clearRequest = waitForAuditLogsRequest(page, (url) => {
      return (
        !url.searchParams.has("tableName") &&
        !url.searchParams.has("recordId") &&
        !url.searchParams.has("userId") &&
        !url.searchParams.has("action") &&
        !url.searchParams.has("startDate") &&
        !url.searchParams.has("endDate")
      );
    });

    await page.getByRole("button", { name: BUTTON_CLEAR }).click();
    await clearRequest;

    await expect(getAutoCompleteInput(page, "tableName")).toHaveValue("");
    await expect(getAutoCompleteInput(page, "action")).toHaveValue("");
    await expect(recordInput).toHaveValue("");
    await expect(userInput).toHaveValue("");
    await expect(startDateInput).toHaveValue("");
    await expect(getCalendarInput(page, "toDate")).toHaveValue("");
  });

  test("TC-009: Pagination เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
    const { table } = await getAuditLogsTableState(page);
    const paginator = table.locator(".p-paginator").first();
    await expectVisible(paginator);

    const requestPromise = waitForAuditLogsRequest(page, (url) => {
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

    const { rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(25);
  });

  test("TC-010: Pagination เปลี่ยนหน้า", async ({ page }) => {
    const { table } = await getAuditLogsTableState(page);
    const paginator = table.locator(".p-paginator").first();
    await expectVisible(paginator);

    const currentPage = paginator
      .locator(".p-paginator-page.p-highlight")
      .first();
    const currentText = ((await currentPage.textContent()) || "").trim();

    const nextButton = paginator.locator("button.p-paginator-next").first();
    if (await nextButton.isDisabled()) {
      await expect(nextButton).toBeDisabled();
      return;
    }

    const requestPromise = waitForAuditLogsRequest(page, (url) => {
      return url.searchParams.get("offset") !== "0";
    });

    await nextButton.click();
    await requestPromise;

    const newCurrentPage = paginator
      .locator(".p-paginator-page.p-highlight")
      .first();
    await expect(newCurrentPage).not.toHaveText(currentText || "1");
  });

  test("TC-011: Sorting คลิกหัวคอลัมน์ให้ลำดับเปลี่ยน", async ({ page }) => {
    const table = await waitForAuditLogsTable(page);
    const header = table.locator("thead th", { hasText: "รหัส" }).first();
    await expectVisible(header);
    await header.click();
    await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
  });
});

test.describe("ตรวจสอบเหตุการณ์ในระบบ - รายละเอียดบันทึกเหตุการณ์", () => {
  test.skip(!HAS_ADMIN_CREDS, "ยังไม่ได้ตั้งค่า E2E admin credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, ADMIN_USER);
    const response = await gotoAuditLogsPageAndWaitForData(page);
    page.__auditLogsData = await readAuditLogsResponse(response);
  });

  test("TC-012: เปิด dialog รายละเอียดได้", async ({ page }) => {
    const { table, rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }

    const eyeButton = rows.first().locator("button:has(.pi-eye)").first();
    await expectVisible(eyeButton);
    await eyeButton.click();

    const dialog = getDetailDialog(page);
    await expectVisible(dialog);
    await expectVisible(dialog.getByText(DIALOG_TITLE_DETAIL));
    const closeButton = dialog
      .locator(".p-dialog-footer")
      .getByRole("button", { name: DIALOG_BUTTON_CLOSE });
    await expectVisible(closeButton);
  });

  test("TC-013: แสดงข้อมูลพื้นฐานใน dialog", async ({ page }) => {
    const { table, rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }

    const auditData = page.__auditLogsData || { results: [] };
    const firstItem = auditData.results?.[0];

    const eyeButton = rows.first().locator("button:has(.pi-eye)").first();
    await eyeButton.click();

    const dialog = getDetailDialog(page);
    await expectVisible(dialog);
    await expectVisible(dialog.getByText("ข้อมูลพื้นฐาน"));

    if (firstItem) {
      await expect(getDetailFieldValue(dialog, "รหัส")).toContainText(
        String(firstItem.auditLogId),
      );
      await expect(getDetailFieldValue(dialog, "ตาราง")).toContainText(
        resolveTableNameLabel(firstItem.tableName),
      );
      await expect(getDetailFieldValue(dialog, "การดำเนินการ")).toContainText(
        resolveActionLabel(firstItem.action),
      );
      await expect(
        getDetailFieldValue(dialog, "รหัสข้อมูลในตาราง"),
      ).toContainText(String(firstItem.recordId));

      const userIdValue = firstItem.userId ?? "-";
      await expect(getDetailFieldValue(dialog, "รหัสผู้ใช้")).toContainText(
        String(userIdValue),
      );

      const createdAtValue = firstItem.createdAt
        ? new Date(firstItem.createdAt).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "-";
      await expect(
        getDetailFieldValue(dialog, "วันที่ดำเนินการ"),
      ).toContainText(createdAtValue);
    } else {
      await expectVisible(dialog.getByText("รหัส"));
      await expectVisible(dialog.getByText("ตาราง"));
      await expectVisible(dialog.getByText("การดำเนินการ"));
    }
  });

  test("TC-014: แสดง “ไม่มีข้อมูลเก่า/ไม่มีข้อมูลใหม่” เมื่อเป็น null", async ({
    page,
  }) => {
    const { table, rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }

    const auditData = page.__auditLogsData || { results: [] };
    const firstItem = auditData.results?.[0];

    const eyeButton = rows.first().locator("button:has(.pi-eye)").first();
    await eyeButton.click();

    const dialog = getDetailDialog(page);
    await expectVisible(dialog);

    const oldSection = dialog
      .getByText("ข้อมูลเก่า", { exact: true })
      .locator("..");
    const newSection = dialog
      .getByText("ข้อมูลใหม่", { exact: true })
      .locator("..");

    if (firstItem && firstItem.oldData === null) {
      await expect(oldSection).toContainText("ไม่มีข้อมูลเก่า");
    } else {
      await expect(oldSection).toContainText("ข้อมูลเก่า");
    }

    if (firstItem && firstItem.newData === null) {
      await expect(newSection).toContainText("ไม่มีข้อมูลใหม่");
    } else {
      await expect(newSection).toContainText("ข้อมูลใหม่");
    }
  });

  test("TC-015: ปิด dialog รายละเอียด", async ({ page }) => {
    const { table, rows, hasData } = await getAuditLogsTableState(page);
    if (!hasData) {
      await expect(table).toContainText("ไม่พบข้อมูล");
      return;
    }

    const eyeButton = rows.first().locator("button:has(.pi-eye)").first();
    await eyeButton.click();

    const dialog = getDetailDialog(page);
    await expectVisible(dialog);
    await dialog
      .locator(".p-dialog-footer")
      .getByRole("button", { name: DIALOG_BUTTON_CLOSE })
      .click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
  });
});

test.describe("ตรวจสอบเหตุการณ์ในระบบ - ล้างข้อมูลเก่า", () => {
  test.skip(!HAS_ADMIN_CREDS, "ยังไม่ได้ตั้งค่า E2E admin credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, ADMIN_USER);
    await gotoAuditLogsPageAndWaitForData(page);
  });

  test("TC-016: เปิด dialog “ล้างข้อมูลเก่า”", async ({ page }) => {
    const { dialog } = await openDeleteDialogAndReadCount(page);
    await expectVisible(dialog.getByText(DIALOG_TITLE_DELETE));
    await expectVisible(dialog.getByText("คำเตือน:"));
    await expectVisible(getInputNumber(page, "deleteDays"));
    await dialog.getByRole("button", { name: DIALOG_BUTTON_CANCEL }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
  });

  test("TC-017: ไม่พบข้อมูลที่จะลบ (count = 0)", async ({ page }) => {
    const { dialog, count, days } = await openDeleteDialogAndReadCount(page);
    const confirmButton = dialog.getByRole("button", {
      name: DIALOG_BUTTON_CONFIRM_DELETE,
    });

    if (count === 0) {
      await expectVisible(
        dialog.getByText(`ไม่พบข้อมูลที่เก่ากว่า ${days} วัน`),
      );
      await expect(confirmButton).toBeDisabled();
    } else {
      await expectVisible(dialog.getByText("จำนวนที่จะถูกลบ:"));
      await expect(confirmButton).toBeEnabled();
    }
  });

  test("TC-018: ยืนยันลบสำเร็จ (มีข้อมูลให้ลบ)", async ({ page }) => {
    const { dialog } = await openDeleteDialogAndReadCount(page);
    const { count, days } = await setDeleteDaysAndReadCount(page, 1);
    const confirmButton = dialog.getByRole("button", {
      name: DIALOG_BUTTON_CONFIRM_DELETE,
    });

    if (count === 0) {
      await expectVisible(
        dialog.getByText(`ไม่พบข้อมูลที่เก่ากว่า ${days} วัน`),
      );
      await expect(confirmButton).toBeDisabled();
      return;
    }

    const deletedCount = Math.min(count, 3);
    await page.route("**/api/v1/audit-logs/old?days=*", async (route) => {
      if (route.request().method() !== "DELETE") return route.continue();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ deletedCount }),
      });
    });

    const requestPromise = page.waitForRequest((req) => {
      return (
        req.method() === "DELETE" &&
        req.url().includes("/api/v1/audit-logs/old")
      );
    });

    await confirmButton.click();
    await requestPromise;

    await expectVisible(
      page.getByText(
        `ลบข้อมูลเก่าที่เก่ากว่า ${days} วันสำเร็จ (ลบไปทั้งหมด ${deletedCount} รายการ)`,
      ),
    );
    await expect(dialog).toBeHidden({ timeout: 10000 });
  });

  test("TC-019: ยืนยันลบไม่สำเร็จ (API ตอบ error)", async ({ page }) => {
    const { dialog } = await openDeleteDialogAndReadCount(page);
    const { count, days } = await setDeleteDaysAndReadCount(page, 1);
    const confirmButton = dialog.getByRole("button", {
      name: DIALOG_BUTTON_CONFIRM_DELETE,
    });

    if (count === 0) {
      await expectVisible(
        dialog.getByText(`ไม่พบข้อมูลที่เก่ากว่า ${days} วัน`),
      );
      await expect(confirmButton).toBeDisabled();
      return;
    }

    await page.route("**/api/v1/audit-logs/old?days=*", async (route) => {
      if (route.request().method() !== "DELETE") return route.continue();
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "error" }),
      });
    });

    const requestPromise = page.waitForRequest((req) => {
      return (
        req.method() === "DELETE" &&
        req.url().includes("/api/v1/audit-logs/old")
      );
    });

    await confirmButton.click();
    await requestPromise;

    await expectVisible(
      page.getByText(/ไม่สามารถลบข้อมูลได้|เกิดข้อผิดพลาดในการลบข้อมูล/),
    );
  });
});
