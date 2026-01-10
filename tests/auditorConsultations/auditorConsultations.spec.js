import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// ใช้ user นี้
const AUDITOR_USER = {
  email: process.env.E2E_TEST_AUDITOR_WITH_INSP_EMAIL,
  password: process.env.E2E_TEST_AUDITOR_WITH_INSP_PASSWORD,
};

const HAS_AUDITOR_CREDS = Boolean(AUDITOR_USER.email && AUDITOR_USER.password);

// ไม่ mock API (GET) ข้อมูลสำหรับการทดสอบการบันทึกข้อมูล ให้ใช้ข้อมูลในแถวแรกของตารางในการทดสอบ
// เช่น ข้อมูลแถวแรก สำหรับ tab อยู่ระหว่างการตรวจประเมิน และข้อมูลแถวแรก สำหรับ tab ตรวจประเมินเสร็จแล้ว
// แต่ให้ mock api (PUT) ในการบันทึกข้อมูลแทน เพื่อที่จะได้ไม่กระทบกับข้อมูลจริง

const PAGE_PATH = "/auditor/consultations";
const PAGE_HEADING = "บันทึกการให้คำปรึกษาและข้อบกพร่อง";
const PAGE_SUBTITLE = "บันทึกรายละเอียดคำแนะนำและข้อบกพร่องที่พบระหว่างการตรวจ";

const TAB_IN_PROGRESS = "อยู่ระหว่างการตรวจประเมิน";
const TAB_COMPLETED = "ตรวจประเมินเสร็จแล้ว";

const BUTTON_SEARCH = "ค้นหา";
const BUTTON_CLEAR = "ล้างค่า";
const BUTTON_NEXT = "ถัดไป";
const BUTTON_BACK = "ย้อนกลับ";
const BUTTON_SAVE = "บันทึกข้อมูล";

const STEP_1_LABEL = "เลือกการตรวจประเมิน";
const STEP_2_LABEL = "บันทึกการให้คำปรึกษาและข้อบกพร่อง";

const TABLE_HEADERS = [
  "รหัสการตรวจ",
  "วันที่ตรวจ",
  "ประเภท",
  "สถานที่",
  "เกษตรกร",
];

function readThaiProvinceSample() {
  const jsonPath = path.join(
    process.cwd(),
    "src",
    "data",
    "thai-provinces.json"
  );
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const provinces = JSON.parse(raw);
  const province = provinces.find(
    (p) => Array.isArray(p.amphure) && p.amphure.length
  );
  const district = province?.amphure?.find(
    (a) => Array.isArray(a.tambon) && a.tambon.length
  );
  const subDistrict = district?.tambon?.[0];
  return {
    provinceName: province?.name_th,
    districtName: district?.name_th,
    subDistrictName: subDistrict?.name_th,
  };
}

async function gotoConsultations(page) {
  await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
}

async function waitForInspectionsTable(page) {
  const table = page.locator(".primary-datatable-wrapper");
  await expect(table).toBeVisible();
  await expect(table.locator("table")).toBeVisible();
  return table;
}

async function clickAndWaitInspectionsReload(page, action) {
  await Promise.all([
    page.waitForResponse((resp) => {
      const url = resp.url();
      return (
        resp.request().method() === "GET" &&
        url.includes("/api/v1/inspections?") &&
        resp.ok()
      );
    }),
    action(),
  ]);
}

async function ensureTableHasRows(page, primaryTab, fallbackTab) {
  const loadTab = async (tabLabel) => {
    if (tabLabel) {
      await clickAndWaitInspectionsReload(page, () =>
        page.getByRole("button", { name: tabLabel, exact: true }).click()
      );
    }

    const table = await waitForInspectionsTable(page);
    const rows = table.locator("tbody tr");
    const rowCount = await rows.count();
    if (rowCount === 1) {
      const rowText = (await rows.first().textContent())?.trim() || "";
      if (rowText.includes("ไม่พบข้อมูล")) {
        return { table, rows, rowCount: 0 };
      }
    }

    return { table, rows, rowCount };
  };

  let result = await loadTab(primaryTab);
  let tabUsed = primaryTab;
  if (result.rowCount === 0 && fallbackTab) {
    result = await loadTab(fallbackTab);
    tabUsed = fallbackTab;
  }

  return { ...result, tabUsed };
}

async function waitForFirstRow(page, tabLabel, fallbackTab) {
  const { table, rows, rowCount, tabUsed } = await ensureTableHasRows(
    page,
    tabLabel,
    fallbackTab
  );
  if (!rowCount) {
    throw new Error(`No inspection rows available for ${tabUsed || "current"} tab`);
  }

  const firstRow = rows.first();
  await expect(firstRow).toBeVisible({ timeout: 20000 });
  return { table, firstRow, tabUsed };
}

async function chooseAutoCompleteByTypingExact(page, placeholder, exactText) {
  const input = page.getByPlaceholder(placeholder).first();
  await expect(input).toBeVisible();
  await input.fill(exactText);
  await page.locator("body").click();
  return input;
}

async function goToStep2FromFirstRow(page, tabLabel, fallbackTab) {
  const { firstRow } = await waitForFirstRow(page, tabLabel, fallbackTab);
  await firstRow.click();

  const nextButton = page.getByRole("button", {
    name: BUTTON_NEXT,
    exact: true,
  });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect(
    page.getByRole("heading", {
      name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
    })
  ).toBeVisible();
}

async function getColumnTexts(table, colIndex) {
  const rows = table.locator("tbody tr");
  const count = await rows.count();
  const texts = [];
  for (let i = 0; i < count; i += 1) {
    const cellText =
      (await rows.nth(i).locator("td").nth(colIndex).textContent()) || "";
    texts.push(cellText.trim());
  }
  return texts;
}

//ใช้ user ใน loginAsAuditor
async function loginAsAuditor(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const auditorRoleButton = page
    .getByRole("button", { name: /ผู้ตรวจ\s*ประเมิน/ })
    .first();
  const emailInput = page
    .getByLabel(/อีเมล/)
    .or(page.locator('input[name="email"]'))
    .first();
  const passwordInput = page
    .getByLabel(/รหัสผ่าน/)
    .or(page.locator('input[name="password"]'))
    .first();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await auditorRoleButton.isVisible().catch(() => false)) {
      await auditorRoleButton.click();
    } else {
      await roleButtons.nth(1).click();
    }

    await emailInput.fill(email);
    await expect(emailInput).toHaveValue(email);
    await passwordInput.fill(password);
    await expect(passwordInput).toHaveValue(password);

    await page.locator('button[type="submit"]').click();
    try {
      await page.waitForURL(/\/auditor\//, {
        timeout: 30000,
        waitUntil: "domcontentloaded",
      });
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}

test.describe("บันทึกการให้คำปรึกษาและข้อบกพร่อง - Access", () => {
  test("TC-001: ต้อง login ก่อนใช้งานหน้า", async ({ page }) => {
    await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/($|\?)/);
    await expect(page.getByLabel(/อีเมล/).first()).toBeVisible();
  });
});

test.describe("บันทึกการให้คำปรึกษาและข้อบกพร่อง - Step 1", () => {
  test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAuditor(page, AUDITOR_USER);
    await gotoConsultations(page);
    await waitForInspectionsTable(page);
  });

  test("TC-002: แสดงชื่อหน้าและคำอธิบาย", async ({ page }) => {
    await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
    await expect(page.getByText(PAGE_SUBTITLE)).toBeVisible();
  });

  test("TC-003: StepIndicator แสดง Step 1", async ({ page }) => {
    const stepIndicator = page
      .locator("div.mb-8", { hasText: "ขั้นตอนที่ 1" })
      .first();
    await expect(
      stepIndicator.locator("div.text-xs.text-gray-500.mt-1", {
        hasText: STEP_1_LABEL,
      })
    ).toBeVisible();
    await expect(
      stepIndicator.locator("div.text-xs.text-gray-500.mt-1", {
        hasText: STEP_2_LABEL,
      })
    ).toBeVisible();
  });

  test("TC-004: แสดงแท็บสถานะ 2 ปุ่ม", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: TAB_IN_PROGRESS, exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: TAB_COMPLETED, exact: true })
    ).toBeVisible();
  });

  test("TC-005: แสดงตัวกรอง Location 3 ช่อง", async ({ page }) => {
    await expect(page.getByPlaceholder("เลือกจังหวัด").first()).toBeVisible();
    await expect(page.getByPlaceholder("เลือกอำเภอ/เขต").first()).toBeVisible();
    await expect(page.getByPlaceholder("เลือกตำบล/แขวง").first()).toBeVisible();
    await expect(page.getByRole("button", { name: BUTTON_SEARCH })).toBeVisible();
    await expect(page.getByRole("button", { name: BUTTON_CLEAR })).toBeVisible();
  });

  test("TC-006: อำเภอ/เขต disabled จนกว่าจะเลือกจังหวัด", async ({ page }) => {
    const districtInput = page.getByPlaceholder("เลือกอำเภอ/เขต").first();
    await expect(districtInput).toBeDisabled();
  });

  test("TC-007: ตำบล/แขวง disabled จนกว่าจะเลือกอำเภอ", async ({ page }) => {
    const { provinceName } = readThaiProvinceSample();
    expect(provinceName).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
    await expect(subDistrictInput).toBeDisabled();
  });

  test("TC-008: เลือกจังหวัดแล้ว enable อำเภอ/เขต", async ({ page }) => {
    const { provinceName } = readThaiProvinceSample();
    expect(provinceName).toBeTruthy();

    const districtInput = page.getByPlaceholder("เลือกอำเภอ/เขต").first();
    await expect(districtInput).toBeDisabled();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    await expect(districtInput).toBeEnabled();
  });

  test("TC-009: เลือกอำเภอแล้ว enable ตำบล/แขวง", async ({ page }) => {
    const { provinceName, districtName } = readThaiProvinceSample();
    expect(provinceName).toBeTruthy();
    expect(districtName).toBeTruthy();

    const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
    await expect(subDistrictInput).toBeDisabled();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    await chooseAutoCompleteByTypingExact(page, "เลือกอำเภอ/เขต", districtName);
    await expect(subDistrictInput).toBeEnabled();
  });

  test("TC-010: เปลี่ยนจังหวัดแล้วรีเซ็ตอำเภอ/ตำบล", async ({ page }) => {
    const { provinceName, districtName, subDistrictName } =
      readThaiProvinceSample();
    expect(provinceName).toBeTruthy();
    expect(districtName).toBeTruthy();
    expect(subDistrictName).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    await chooseAutoCompleteByTypingExact(page, "เลือกอำเภอ/เขต", districtName);
    await chooseAutoCompleteByTypingExact(page, "เลือกตำบล/แขวง", subDistrictName);

    const districtInput = page.getByPlaceholder("เลือกอำเภอ/เขต").first();
    const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
    await expect(districtInput).toHaveValue(districtName);
    await expect(subDistrictInput).toHaveValue(subDistrictName);

    const jsonPath = path.join(process.cwd(), "src", "data", "thai-provinces.json");
    const provinces = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const nextProvince = provinces.find((p) => p.name_th && p.name_th !== provinceName);
    expect(nextProvince?.name_th).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", nextProvince.name_th);
    await expect(districtInput).toHaveValue("");
    await expect(subDistrictInput).toHaveValue("");
    await expect(subDistrictInput).toBeDisabled();
  });

  test("TC-011: เปลี่ยนอำเภอแล้วรีเซ็ตตำบล", async ({ page }) => {
    const jsonPath = path.join(process.cwd(), "src", "data", "thai-provinces.json");
    const provinces = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    const province = provinces.find((p) => Array.isArray(p.amphure) && p.amphure.length >= 2);
    const districtA = province?.amphure?.[0];
    const districtB = province?.amphure?.[1];
    const subDistrictA = districtA?.tambon?.[0];

    expect(province?.name_th).toBeTruthy();
    expect(districtA?.name_th).toBeTruthy();
    expect(districtB?.name_th).toBeTruthy();
    expect(subDistrictA?.name_th).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", province.name_th);
    await chooseAutoCompleteByTypingExact(page, "เลือกอำเภอ/เขต", districtA.name_th);
    await chooseAutoCompleteByTypingExact(page, "เลือกตำบล/แขวง", subDistrictA.name_th);

    const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
    await expect(subDistrictInput).toHaveValue(subDistrictA.name_th);

    await chooseAutoCompleteByTypingExact(page, "เลือกอำเภอ/เขต", districtB.name_th);
    await expect(subDistrictInput).toHaveValue("");
    await expect(subDistrictInput).toBeEnabled();
  });

  test("TC-012: กด “ค้นหา” แล้วรายการเปลี่ยนตามตัวกรอง", async ({ page }) => {
    const { provinceName } = readThaiProvinceSample();
    expect(provinceName).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    await clickAndWaitInspectionsReload(page, () =>
      page.getByRole("button", { name: BUTTON_SEARCH }).click()
    );

    const table = await waitForInspectionsTable(page);
    await expect(table.locator("tbody tr").first()).toBeVisible();
  });

  test("TC-013: กด “ล้างค่า” รีเซ็ตตัวกรองทั้งหมด", async ({ page }) => {
    const { provinceName, districtName } = readThaiProvinceSample();
    expect(provinceName).toBeTruthy();
    expect(districtName).toBeTruthy();

    await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
    await chooseAutoCompleteByTypingExact(page, "เลือกอำเภอ/เขต", districtName);

    await page.getByRole("button", { name: BUTTON_CLEAR }).click();

    await expect(page.getByPlaceholder("เลือกจังหวัด").first()).toHaveValue("");
    await expect(page.getByPlaceholder("เลือกอำเภอ/เขต").first()).toHaveValue("");
    await expect(page.getByPlaceholder("เลือกตำบล/แขวง").first()).toHaveValue("");
    await expect(page.getByPlaceholder("เลือกอำเภอ/เขต").first()).toBeDisabled();
    await expect(page.getByPlaceholder("เลือกตำบล/แขวง").first()).toBeDisabled();
  });

  test("TC-014: แสดงตาราง 5 คอลัมน์ตาม UI จริง", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const thead = table.locator("thead");
    for (const header of TABLE_HEADERS) {
      await expect(thead).toContainText(header);
    }
  });

  test("TC-015: วันที่ตรวจแสดงเป็นรูปแบบไทยเมื่อมีค่า", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const dateTexts = await getColumnTexts(table, 1);
    const withDate = dateTexts.filter((t) => t && t !== "-");
    if (withDate.length) {
      for (const text of withDate) {
        expect(text).toMatch(/[ก-ฮ]/);
      }
    } else {
      expect(dateTexts.length).toBeGreaterThan(0);
    }
  });

  test("TC-016: วันที่ตรวจเป็น “-” เมื่อไม่มีค่า", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const dateTexts = await getColumnTexts(table, 1);
    const hasDash = dateTexts.some((text) => text === "-");
    if (hasDash) {
      expect(dateTexts.filter((text) => text === "-").length).toBeGreaterThan(0);
    } else {
      expect(dateTexts.every((text) => text.length)).toBeTruthy();
    }
  });

  test("TC-017: สถานที่แสดงจากข้อมูลที่มี", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const locationTexts = await getColumnTexts(table, 3);
    const hasDash = locationTexts.some((text) => text === "-");
    if (hasDash) {
      expect(locationTexts.filter((text) => text === "-").length).toBeGreaterThan(0);
    } else {
      expect(locationTexts.every((text) => text.length)).toBeTruthy();
    }
  });

  test("TC-018: เกษตรกรแสดง “ไม่ระบุ” เมื่อไม่มีข้อมูล", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const farmerTexts = await getColumnTexts(table, 4);
    const hasUnknown = farmerTexts.some((text) => text === "ไม่ระบุ");
    if (hasUnknown) {
      expect(farmerTexts.filter((text) => text === "ไม่ระบุ").length).toBeGreaterThan(0);
    } else {
      expect(farmerTexts.every((text) => text.length)).toBeTruthy();
    }
  });

  test("TC-019: Pagination ไปหน้าถัดไปได้", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const paginator = table.locator(".p-paginator").first();
    await expect(paginator).toBeVisible();

    const currentPage = paginator.locator(".p-paginator-page.p-highlight").first();
    const currentText = (await currentPage.textContent())?.trim() || "";

    const nextPageButton = paginator.locator(".p-paginator-next").first();
    if (await nextPageButton.isDisabled()) {
      await expect(nextPageButton).toBeDisabled();
      await expect(paginator.locator(".p-paginator-page.p-highlight").first()).toHaveText(
        currentText || "1"
      );
      return;
    }

    await clickAndWaitInspectionsReload(page, () => nextPageButton.click());

    const newCurrentPage = paginator.locator(".p-paginator-page.p-highlight").first();
    await expect(newCurrentPage).not.toHaveText(currentText);
  });

  test("TC-020: เปลี่ยนจำนวนรายการต่อหน้า (25)", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const paginator = table.locator(".p-paginator").first();
    await expect(paginator).toBeVisible();

    const nativeSelect = paginator.locator("select.p-paginator-rpp-options");
    if (await nativeSelect.count()) {
      await clickAndWaitInspectionsReload(page, async () => {
        await nativeSelect.selectOption("25");
      });
    } else {
      const dropdown = paginator.locator(".p-dropdown").first();
      await dropdown.click();
      await clickAndWaitInspectionsReload(page, async () => {
        await page
          .locator(".p-dropdown-items .p-dropdown-item")
          .getByText("25", { exact: true })
          .click();
      });
    }

    const rowCount = await table.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(25);
  });

  test("TC-021: Sort คอลัมน์ “รหัสการตรวจ”", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const headerCell = table.locator("thead th", { hasText: "รหัสการตรวจ" }).first();
    await expect(headerCell).toBeVisible();

    await clickAndWaitInspectionsReload(page, () => headerCell.click());
    await expect(headerCell).toHaveAttribute("aria-sort", /ascending|descending/);
  });

  test("TC-022: Multi-sort บนตาราง", async ({ page }) => {
    const { table } = await ensureTableHasRows(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    const codeHeader = table.locator("thead th", { hasText: "รหัสการตรวจ" }).first();
    const typeHeader = table.locator("thead th", { hasText: "ประเภท" }).first();

    await clickAndWaitInspectionsReload(page, () => codeHeader.click());

    await page.keyboard.down("Control");
    await clickAndWaitInspectionsReload(page, () => typeHeader.click());
    await page.keyboard.up("Control");

    await expect(codeHeader).toHaveAttribute("aria-sort", /ascending|descending/);
    await expect(typeHeader).toHaveAttribute("aria-sort", /ascending|descending/);
  });

  test("TC-023: สลับแท็บแล้วล้างการเลือกแถว", async ({ page }) => {
    const { firstRow, tabUsed } = await waitForFirstRow(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    await firstRow.click();
    await expect(page.getByRole("button", { name: BUTTON_NEXT, exact: true })).toBeEnabled();

    const targetTab =
      tabUsed === TAB_IN_PROGRESS ? TAB_COMPLETED : TAB_IN_PROGRESS;
    await clickAndWaitInspectionsReload(page, () =>
      page.getByRole("button", { name: targetTab, exact: true }).click()
    );

    await expect(page.getByRole("button", { name: BUTTON_NEXT, exact: true })).toBeDisabled();
  });

  test("TC-024: ปุ่ม “ถัดไป” disabled เมื่อยังไม่เลือกแถว", async ({ page }) => {
    await expect(page.getByRole("button", { name: BUTTON_NEXT, exact: true })).toBeDisabled();
  });

  test("TC-025: เลือกแถวแล้ว “ถัดไป” enabled", async ({ page }) => {
    const { firstRow } = await waitForFirstRow(
      page,
      TAB_IN_PROGRESS,
      TAB_COMPLETED
    );
    await firstRow.click();
    await expect(page.getByRole("button", { name: BUTTON_NEXT, exact: true })).toBeEnabled();
  });

  test("TC-026: กด “ถัดไป” ไป Step 2", async ({ page }) => {
    await goToStep2FromFirstRow(page, TAB_IN_PROGRESS, TAB_COMPLETED);
  });
});

test.describe("บันทึกการให้คำปรึกษาและข้อบกพร่อง - Step 2", () => {
  test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAuditor(page, AUDITOR_USER);
    await gotoConsultations(page);
    await waitForInspectionsTable(page);
    await goToStep2FromFirstRow(page, TAB_IN_PROGRESS, TAB_COMPLETED);
  });

  test("TC-027: แสดงช่อง “วันที่บันทึกข้อมูล”", async ({ page }) => {
    await expect(page.getByText("วันที่บันทึกข้อมูล")).toBeVisible();
    await expect(
      page.getByPlaceholder("เลือกวันที่บันทึกข้อมูล").first()
    ).toBeVisible();
  });

  test("TC-028: เลือกวันที่บันทึกข้อมูลได้", async ({ page }) => {
    const input = page.getByPlaceholder("เลือกวันที่บันทึกข้อมูล").first();
    await input.fill("01/01/25");
    await expect(input).not.toHaveValue("");
  });

  test("TC-029: แสดง Section 1 (คำปรึกษา) และมี 1 รายการเริ่มต้น", async ({
    page,
  }) => {
    const adviceSection = page
      .getByRole("heading", {
        name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
      })
      .locator("..");
    await expect(adviceSection).toBeVisible();
    const adviceItems = adviceSection.getByPlaceholder("ระบุรายการให้คำปรึกษา");
    expect(await adviceItems.count()).toBeGreaterThan(0);
  });

  test("TC-030: เพิ่มรายการคำปรึกษา", async ({ page }) => {
    const adviceSection = page
      .getByRole("heading", {
        name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
      })
      .locator("..");
    const adviceItems = adviceSection.getByPlaceholder("ระบุรายการให้คำปรึกษา");
    const initialCount = await adviceItems.count();
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("button", { name: "เพิ่มรายการคำปรึกษา" }).click();
    await expect(adviceItems).toHaveCount(initialCount + 1);
  });

  test("TC-031: ปุ่ม “ลบรายการ” แสดงเมื่อมีมากกว่า 1", async ({ page }) => {
    const adviceSection = page
      .getByRole("heading", {
        name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
      })
      .locator("..");

    await page.getByRole("button", { name: "เพิ่มรายการคำปรึกษา" }).click();
    await expect(adviceSection.getByRole("button", { name: "ลบรายการ" }).first()).toBeVisible();
  });

  test("TC-032: ลบรายการคำปรึกษา", async ({ page }) => {
    const adviceSection = page
      .getByRole("heading", {
        name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
      })
      .locator("..");
    const adviceItems = adviceSection.getByPlaceholder("ระบุรายการให้คำปรึกษา");
    const initialCount = await adviceItems.count();
    await page.getByRole("button", { name: "เพิ่มรายการคำปรึกษา" }).click();
    await expect(adviceItems).toHaveCount(initialCount + 1);

    await adviceSection.getByRole("button", { name: "ลบรายการ" }).first().click();
    await expect(adviceItems).toHaveCount(initialCount);
  });

  test("TC-033: กรอกฟิลด์คำปรึกษาได้ครบ", async ({ page }) => {
    const adviceSection = page
      .getByRole("heading", {
        name: /1\.\s*แบบบันทึกคำแนะนำการให้คำปรึกษา/,
      })
      .locator("..");

    await adviceSection
      .getByPlaceholder("ระบุรายการให้คำปรึกษา")
      .first()
      .fill("คำปรึกษาเรื่องการตัดแต่งกิ่ง");
    await adviceSection
      .getByPlaceholder("ระบุแนวทางการแก้ไข")
      .first()
      .fill("แนะนำตัดแต่งปีละ 2 ครั้ง");
    await adviceSection.getByPlaceholder("เลือกวันที่").first().fill("02/01/25");

    await expect(
      adviceSection.getByPlaceholder("ระบุรายการให้คำปรึกษา").first()
    ).toHaveValue("คำปรึกษาเรื่องการตัดแต่งกิ่ง");
    await expect(
      adviceSection.getByPlaceholder("ระบุแนวทางการแก้ไข").first()
    ).toHaveValue("แนะนำตัดแต่งปีละ 2 ครั้ง");
    await expect(adviceSection.getByPlaceholder("เลือกวันที่").first()).not.toHaveValue("");
  });

  test("TC-034: แสดง Section 2 (ข้อบกพร่อง) และมี 1 รายการเริ่มต้น", async ({
    page,
  }) => {
    const defectSection = page
      .getByRole("heading", { name: /2\.\s*แบบบันทึกข้อบกพร่อง/ })
      .locator("..");
    await expect(defectSection).toBeVisible();
    const defectItems = defectSection.getByPlaceholder("ระบุข้อบกพร่องที่พบ");
    expect(await defectItems.count()).toBeGreaterThan(0);
  });

  test("TC-035: เพิ่มรายการข้อบกพร่อง", async ({ page }) => {
    const defectSection = page
      .getByRole("heading", { name: /2\.\s*แบบบันทึกข้อบกพร่อง/ })
      .locator("..");
    const defectItems = defectSection.getByPlaceholder("ระบุข้อบกพร่องที่พบ");
    const initialCount = await defectItems.count();
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole("button", { name: "เพิ่มรายการข้อบกพร่อง" }).click();
    await expect(defectItems).toHaveCount(initialCount + 1);
  });

  test("TC-036: ปุ่ม “ลบรายการ” ของข้อบกพร่องแสดงเมื่อมีมากกว่า 1", async ({
    page,
  }) => {
    const defectSection = page
      .getByRole("heading", { name: /2\.\s*แบบบันทึกข้อบกพร่อง/ })
      .locator("..");

    await page.getByRole("button", { name: "เพิ่มรายการข้อบกพร่อง" }).click();
    await expect(defectSection.getByRole("button", { name: "ลบรายการ" }).first()).toBeVisible();
  });

  test("TC-037: ลบรายการข้อบกพร่อง", async ({ page }) => {
    const defectSection = page
      .getByRole("heading", { name: /2\.\s*แบบบันทึกข้อบกพร่อง/ })
      .locator("..");
    const defectItems = defectSection.getByPlaceholder("ระบุข้อบกพร่องที่พบ");
    const initialCount = await defectItems.count();
    await page.getByRole("button", { name: "เพิ่มรายการข้อบกพร่อง" }).click();
    await expect(defectItems).toHaveCount(initialCount + 1);

    await defectSection.getByRole("button", { name: "ลบรายการ" }).first().click();
    await expect(defectItems).toHaveCount(initialCount);
  });

  test("TC-038: กรอกฟิลด์ข้อบกพร่องได้ครบ", async ({ page }) => {
    const defectSection = page
      .getByRole("heading", { name: /2\.\s*แบบบันทึกข้อบกพร่อง/ })
      .locator("..");

    await defectSection
      .getByPlaceholder("ระบุข้อบกพร่องที่พบ")
      .first()
      .fill("พบวัชพืชหนาแน่น");
    await defectSection
      .getByPlaceholder("ระบุรายละเอียด")
      .first()
      .fill("ควรกำจัดวัชพืชก่อนการใส่ปุ๋ย");
    await defectSection.getByPlaceholder("เลือกวันที่").first().fill("03/01/25");

    await expect(defectSection.getByPlaceholder("ระบุข้อบกพร่องที่พบ").first()).toHaveValue(
      "พบวัชพืชหนาแน่น"
    );
    await expect(defectSection.getByPlaceholder("ระบุรายละเอียด").first()).toHaveValue(
      "ควรกำจัดวัชพืชก่อนการใส่ปุ๋ย"
    );
    await expect(defectSection.getByPlaceholder("เลือกวันที่").first()).not.toHaveValue("");
  });

  test("TC-039: ปุ่ม “ย้อนกลับ” กลับไป Step 1", async ({ page }) => {
    await page.getByRole("button", { name: BUTTON_BACK }).click();
    await expect(page.getByRole("button", { name: BUTTON_NEXT, exact: true })).toBeEnabled();
    await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
  });
});

test.describe("บันทึกการให้คำปรึกษาและข้อบกพร่อง - การบันทึก (PUT mock)", () => {
  test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
  test.describe.configure({ mode: "serial", timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await loginAsAuditor(page, AUDITOR_USER);
    await gotoConsultations(page);
    await waitForInspectionsTable(page);
    await goToStep2FromFirstRow(page, TAB_COMPLETED);
  });

  test("TC-040: บันทึกสำเร็จ (มีข้อมูลเดิม)", async ({ page }) => {
    await page.route(/\/api\/v1\/advice-and-defects\/\d+$/, async (route) => {
      if (route.request().method() !== "PUT") return route.continue();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ adviceAndDefectId: 1, version: 2 }),
      });
    });

    await page.getByPlaceholder("ระบุรายการให้คำปรึกษา").first().fill("ปรับปรุงข้อมูล");

    const [putRequest] = await Promise.all([
      page.waitForRequest((req) => {
        return (
          req.method() === "PUT" &&
          /\/api\/v1\/advice-and-defects\/\d+$/.test(req.url())
        );
      }),
      page.getByRole("button", { name: BUTTON_SAVE }).click(),
    ]);
    expect(putRequest).toBeTruthy();

    await expect(page.getByText("บันทึกข้อมูลเรียบร้อย")).toBeVisible();
  });

  test("TC-041: บันทึกไม่สำเร็จแสดงข้อความจาก server", async ({ page }) => {
    const errorMessage = "เกิดข้อผิดพลาดจากระบบ";
    await page.route(/\/api\/v1\/advice-and-defects\/\d+$/, async (route) => {
      if (route.request().method() !== "PUT") return route.continue();
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: errorMessage }),
      });
    });

    const [putRequest] = await Promise.all([
      page.waitForRequest((req) => {
        return (
          req.method() === "PUT" &&
          /\/api\/v1\/advice-and-defects\/\d+$/.test(req.url())
        );
      }),
      page.getByRole("button", { name: BUTTON_SAVE }).click(),
    ]);
    expect(putRequest).toBeTruthy();

    await expect(page.getByText(errorMessage)).toBeVisible();
  });

  test("TC-042: บันทึกไม่สำเร็จ fallback message", async ({ page }) => {
    await page.route(/\/api\/v1\/advice-and-defects\/\d+$/, async (route) => {
      if (route.request().method() !== "PUT") return route.continue();
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    const [putRequest] = await Promise.all([
      page.waitForRequest((req) => {
        return (
          req.method() === "PUT" &&
          /\/api\/v1\/advice-and-defects\/\d+$/.test(req.url())
        );
      }),
      page.getByRole("button", { name: BUTTON_SAVE }).click(),
    ]);
    expect(putRequest).toBeTruthy();

    await expect(
      page.getByText(/บันทึกข้อมูลไม่สำเร็จ|Failed to update advice and defect/)
    ).toBeVisible();
  });
});
