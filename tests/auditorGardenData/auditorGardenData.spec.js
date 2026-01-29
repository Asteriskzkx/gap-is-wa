import { expect, test } from "@playwright/test";
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

const PAGE_PATH = "/auditor/garden-data";
const PAGE_HEADING = "บันทึกข้อมูลประจำสวนยาง";
const PAGE_SUBTITLE = "จัดเก็บข้อมูลสำคัญของสวนยางพาราที่ได้รับการตรวจประเมิน";

const TAB_IN_PROGRESS = "อยู่ระหว่างการตรวจประเมิน";
const TAB_COMPLETED = "ตรวจประเมินเสร็จแล้ว";

const BUTTON_SEARCH = "ค้นหา";
const BUTTON_CLEAR = "ล้างค่า";
const BUTTON_NEXT = "ถัดไป";
const BUTTON_BACK = "ย้อนกลับ";
const BUTTON_SAVE = "บันทึกข้อมูล";

const STEP_1_LABEL = "เลือกการตรวจประเมิน";
const STEP_2_LABEL = "บันทึกข้อมูลประจำสวนยาง";

const TABLE_HEADERS = [
  "รหัสการตรวจ",
  "วันที่ตรวจ",
  "ประเภท",
  "สถานที่",
  "เกษตรกร",
];

function readThaiProvinceSample() {
  // ใช้ข้อมูลจากไฟล์จริงเพื่อให้เลือกจังหวัด/อำเภอ/ตำบลได้แบบ deterministic
  const jsonPath = path.join(
    process.cwd(),
    "src",
    "data",
    "thai-provinces.json",
  );
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const provinces = JSON.parse(raw);
  const province = provinces.find(
    (p) => Array.isArray(p.amphure) && p.amphure.length,
  );
  const district = province?.amphure?.find(
    (a) => Array.isArray(a.tambon) && a.tambon.length,
  );
  const subDistrict = district?.tambon?.[0];
  return {
    provinceName: province?.name_th,
    districtName: district?.name_th,
    subDistrictName: subDistrict?.name_th,
  };
}

async function gotoGardenData(page) {
  await page.goto(PAGE_PATH, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: PAGE_HEADING })).toBeVisible();
}

async function waitForInspectionsTable(page) {
  const table = page.locator(".primary-datatable-wrapper");
  await expect(table).toBeVisible();
  await expect(table.locator("table")).toBeVisible();
  return table;
}

async function waitForFirstRow(page) {
  const table = await waitForInspectionsTable(page);
  const firstRow = table.locator("tbody tr").first();
  await expect(firstRow).toBeVisible({ timeout: 20000 });
  return { table, firstRow };
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

async function chooseAutoCompleteByTypingExact(page, placeholder, exactText) {
  const input = page.getByPlaceholder(placeholder).first();
  await expect(input).toBeVisible();
  await input.fill(exactText);
  // blur เพื่อให้ PrimaryAutoComplete ทำ exact match และ set value
  await page.locator("body").click();
  return input;
}

function getCheckboxInputByLabel(container, labelText) {
  const label = container.locator("label", { hasText: labelText }).first();
  return label.locator("..").locator('input[type="checkbox"]').first();
}

async function goToStep2FromFirstRow(page) {
  const { table, firstRow } = await waitForFirstRow(page);
  await firstRow.click();
  const nextButton = page.getByRole("button", {
    name: BUTTON_NEXT,
    exact: true,
  });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();
  await expect(page.getByText("แผนที่ตั้งสวน")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /1\.\s*พันธุ์ยางพาราที่ปลูก/ }),
  ).toBeVisible();
  return { table, firstRow };
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

test.describe("บันทึกข้อมูลประจำสวนยาง", () => {
  // test.describe.configure({ mode: "serial" });

  test.describe("บันทึกข้อมูลประจำสวนยาง - ผู้ตรวจประเมิน", () => {
    test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
    // test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await loginAsAuditor(page, AUDITOR_USER);
      await gotoGardenData(page);
      await waitForInspectionsTable(page);
    });

    test("TC-001: แสดงชื่อหน้า + คำอธิบาย", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: PAGE_HEADING }),
      ).toBeVisible();
      await expect(page.getByText(PAGE_SUBTITLE)).toBeVisible();
    });

    test("TC-002: StepIndicator แสดง 2 ขั้น", async ({ page }) => {
      const stepIndicator = page
        .locator("div.mb-8", { hasText: "ขั้นตอนที่ 1" })
        .first();
      await expect(
        stepIndicator.locator("div.text-xs.text-gray-500.mt-1", {
          hasText: STEP_1_LABEL,
        }),
      ).toBeVisible();
      await expect(
        stepIndicator.locator("div.text-xs.text-gray-500.mt-1", {
          hasText: STEP_2_LABEL,
        }),
      ).toBeVisible();
    });

    test("TC-003: ตารางแสดงสถานะกำลังโหลด", async ({ page }) => {
      await page.route(/\/api\/v1\/inspections\?/, async (route) => {
        if (route.request().method() !== "GET") return route.continue();
        await new Promise((r) => setTimeout(r, 1200));
        await route.continue();
      });

      await page.reload({ waitUntil: "domcontentloaded" });
      const table = await waitForInspectionsTable(page);

      // PrimeReact DataTable loading overlay (ถ้า request ช้า)
      const loadingOverlay = table.locator(".p-datatable-loading-overlay");
      await expect(loadingOverlay).toBeVisible();

      // และสุดท้ายต้องแสดงข้อมูลได้
      const firstRow = table.locator("tbody tr").first();
      await expect(firstRow).toBeVisible({ timeout: 20000 });
    });

    test("TC-004: ตารางมีหัวคอลัมน์ครบ", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
      const thead = table.locator("thead");
      for (const header of TABLE_HEADERS) {
        await expect(thead).toContainText(header);
      }
    });

    test("TC-005: เปลี่ยนหน้า (pagination)", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
      const paginator = table.locator(".p-paginator").first();
      await expect(paginator).toBeVisible();

      const currentPage = paginator
        .locator(".p-paginator-page.p-highlight")
        .first();
      const currentText = (await currentPage.textContent())?.trim() || "";

      const nextPageButton = paginator.locator(".p-paginator-next").first();
      if (await nextPageButton.isDisabled()) {
        // ถ้ามีหน้าเดียวควรถูก disabled (ถือว่า behavior ถูกต้อง)
        await expect(nextPageButton).toBeDisabled();
        await expect(
          paginator.locator(".p-paginator-page.p-highlight").first(),
        ).toHaveText(currentText || "1");
        return;
      }

      await clickAndWaitInspectionsReload(page, () => nextPageButton.click());

      const newCurrentPage = paginator
        .locator(".p-paginator-page.p-highlight")
        .first();
      await expect(newCurrentPage).not.toHaveText(currentText);
    });

    test("TC-006: เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
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

    test("TC-007: Sort ขั้นพื้นฐาน", async ({ page }) => {
      const table = await waitForInspectionsTable(page);
      const headerCell = table
        .locator("thead th", { hasText: "รหัสการตรวจ" })
        .first();
      await expect(headerCell).toBeVisible();

      await clickAndWaitInspectionsReload(page, () => headerCell.click());
      await expect(headerCell).toHaveAttribute(
        "aria-sort",
        /ascending|descending/,
      );
    });

    test("TC-008: เลือกจังหวัด → อำเภอ enable", async ({ page }) => {
      const { provinceName } = readThaiProvinceSample();
      expect(provinceName).toBeTruthy();

      const districtInput = page.getByPlaceholder("เลือกอำเภอ/เขต").first();
      const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();

      await expect(districtInput).toBeDisabled();
      await expect(subDistrictInput).toBeDisabled();

      await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
      await expect(districtInput).toBeEnabled();
      await expect(subDistrictInput).toBeDisabled();
    });

    test("TC-009: เลือกอำเภอ → ตำบล enable", async ({ page }) => {
      const { provinceName, districtName } = readThaiProvinceSample();
      expect(provinceName).toBeTruthy();
      expect(districtName).toBeTruthy();

      const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
      await expect(subDistrictInput).toBeDisabled();

      await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกอำเภอ/เขต",
        districtName,
      );
      await expect(subDistrictInput).toBeEnabled();
    });

    test("TC-010: เปลี่ยนจังหวัดแล้วรีเซ็ตอำเภอ/ตำบล", async ({ page }) => {
      const { provinceName, districtName, subDistrictName } =
        readThaiProvinceSample();
      expect(provinceName).toBeTruthy();
      expect(districtName).toBeTruthy();
      expect(subDistrictName).toBeTruthy();

      await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกอำเภอ/เขต",
        districtName,
      );
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกตำบล/แขวง",
        subDistrictName,
      );

      const districtInput = page.getByPlaceholder("เลือกอำเภอ/เขต").first();
      const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
      await expect(districtInput).toHaveValue(districtName);
      await expect(subDistrictInput).toHaveValue(subDistrictName);

      // เปลี่ยนจังหวัดไปเป็นอีกค่า (เลือกจาก JSON ตัวที่ 2 ถ้ามี)
      const jsonPath = path.join(
        process.cwd(),
        "src",
        "data",
        "thai-provinces.json",
      );
      const provinces = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      const nextProvince = provinces.find(
        (p) => p.name_th && p.name_th !== provinceName,
      );
      expect(nextProvince?.name_th).toBeTruthy();

      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกจังหวัด",
        nextProvince.name_th,
      );
      await expect(districtInput).toHaveValue("");
      await expect(subDistrictInput).toHaveValue("");
      await expect(subDistrictInput).toBeDisabled();
    });

    test("TC-011: เปลี่ยนอำเภอแล้วรีเซ็ตตำบล", async ({ page }) => {
      const jsonPath = path.join(
        process.cwd(),
        "src",
        "data",
        "thai-provinces.json",
      );
      const provinces = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      const province = provinces.find(
        (p) => Array.isArray(p.amphure) && p.amphure.length >= 2,
      );
      const districtA = province?.amphure?.[0];
      const districtB = province?.amphure?.[1];
      const subDistrictA = districtA?.tambon?.[0];

      expect(province?.name_th).toBeTruthy();
      expect(districtA?.name_th).toBeTruthy();
      expect(districtB?.name_th).toBeTruthy();
      expect(subDistrictA?.name_th).toBeTruthy();

      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกจังหวัด",
        province.name_th,
      );
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกอำเภอ/เขต",
        districtA.name_th,
      );
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกตำบล/แขวง",
        subDistrictA.name_th,
      );

      const subDistrictInput = page.getByPlaceholder("เลือกตำบล/แขวง").first();
      await expect(subDistrictInput).toHaveValue(subDistrictA.name_th);

      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกอำเภอ/เขต",
        districtB.name_th,
      );
      await expect(subDistrictInput).toHaveValue("");
      await expect(subDistrictInput).toBeEnabled();
    });

    test("TC-012: ปุ่ม “ล้างค่า” รีเซ็ตตัวกรอง", async ({ page }) => {
      const { provinceName, districtName } = readThaiProvinceSample();
      expect(provinceName).toBeTruthy();
      expect(districtName).toBeTruthy();

      await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกอำเภอ/เขต",
        districtName,
      );

      await page.getByRole("button", { name: BUTTON_CLEAR }).click();

      await expect(page.getByPlaceholder("เลือกจังหวัด").first()).toHaveValue(
        "",
      );
      await expect(page.getByPlaceholder("เลือกอำเภอ/เขต").first()).toHaveValue(
        "",
      );
      await expect(page.getByPlaceholder("เลือกตำบล/แขวง").first()).toHaveValue(
        "",
      );
      await expect(
        page.getByPlaceholder("เลือกอำเภอ/เขต").first(),
      ).toBeDisabled();
      await expect(
        page.getByPlaceholder("เลือกตำบล/แขวง").first(),
      ).toBeDisabled();
    });

    test("TC-013: ปุ่ม “ค้นหา” รีเฟรชรายการ", async ({ page }) => {
      const { provinceName } = readThaiProvinceSample();
      expect(provinceName).toBeTruthy();

      await chooseAutoCompleteByTypingExact(page, "เลือกจังหวัด", provinceName);
      await clickAndWaitInspectionsReload(page, () =>
        page.getByRole("button", { name: BUTTON_SEARCH }).click(),
      );

      const table = await waitForInspectionsTable(page);
      await expect(table.locator("tbody tr").first()).toBeVisible();
    });

    test("TC-014: สลับแท็บ “อยู่ระหว่างการตรวจประเมิน”", async ({ page }) => {
      await clickAndWaitInspectionsReload(page, () =>
        page
          .getByRole("button", { name: TAB_IN_PROGRESS, exact: true })
          .click(),
      );

      // หลังสลับแท็บ ต้องยังใช้งานหน้าได้และปุ่มถัดไปยัง disabled จนกว่าจะเลือกแถว
      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true }),
      ).toBeDisabled();
    });

    test("TC-015: สลับแท็บ “ตรวจประเมินเสร็จแล้ว”", async ({ page }) => {
      await clickAndWaitInspectionsReload(page, () =>
        page.getByRole("button", { name: TAB_COMPLETED, exact: true }).click(),
      );

      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true }),
      ).toBeDisabled();
    });

    test("TC-016: เลือกแถวแล้วปุ่ม “ถัดไป” ใช้งานได้", async ({ page }) => {
      const { firstRow } = await waitForFirstRow(page);
      await firstRow.click();
      const nextButton = page.getByRole("button", {
        name: BUTTON_NEXT,
        exact: true,
      });
      await nextButton.scrollIntoViewIfNeeded();
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();
    });

    test("TC-017: ไป Step 2 ได้เมื่อเลือกแถว", async ({ page }) => {
      await goToStep2FromFirstRow(page);
    });
  });

  test.describe("บันทึกข้อมูลประจำสวนยาง - Step 2", () => {
    test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
    // test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await loginAsAuditor(page, AUDITOR_USER);
      await gotoGardenData(page);
      await waitForInspectionsTable(page);
      await goToStep2FromFirstRow(page);
    });

    test("TC-018: ปุ่ม “ย้อนกลับ” กลับไป Step 1", async ({ page }) => {
      await page.getByRole("button", { name: BUTTON_BACK }).click();
      await expect(
        page.getByRole("button", { name: BUTTON_NEXT, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: PAGE_HEADING }),
      ).toBeVisible();
    });

    test("TC-019: เพิ่ม/ลบรายการปลูก", async ({ page }) => {
      const specieInputs = page.getByPlaceholder("เลือกพันธุ์ยางพารา");
      await expect(specieInputs).toHaveCount(1);

      await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
      await expect(specieInputs).toHaveCount(2);

      // เมื่อมี >1 แถว จะมีปุ่ม “ลบรายการ”
      const removeButtons = page.getByRole("button", { name: "ลบรายการ" });
      await expect(removeButtons.first()).toBeVisible();
      await removeButtons.first().click();

      await expect(specieInputs).toHaveCount(1);
    });

    test("TC-020: กรอกข้อมูลรายการปลูก 1 แถว", async ({ page }) => {
      await chooseAutoCompleteByTypingExact(
        page,
        "เลือกพันธุ์ยางพารา",
        "RRIT 251",
      );

      await page.getByPlaceholder("ระยะปลูก (เมตร)").first().fill("3");
      await page.getByPlaceholder("จำนวนต้น").first().fill("100");
      await page.getByPlaceholder("เลือกวันที่ปลูก").first().fill("01/01/25");

      await expect(
        page.getByPlaceholder("เลือกพันธุ์ยางพารา").first(),
      ).toHaveValue("RRIT 251");
      await expect(
        page.getByPlaceholder("ระยะปลูก (เมตร)").first(),
      ).toHaveValue("3");
      await expect(page.getByPlaceholder("จำนวนต้น").first()).toHaveValue(
        "100",
      );
      await expect(
        page.getByPlaceholder("เลือกวันที่ปลูก").first(),
      ).not.toHaveValue("");
    });

    test("TC-021: ระบบการให้น้ำ: เลือก “ไม่มี” → ช่อง “ระบุ” disabled", async ({
      page,
    }) => {
      const waterSection = page
        .getByRole("heading", { name: /2\.\s*ระบบการให้น้ำ/ })
        .locator("..");
      await waterSection.scrollIntoViewIfNeeded();
      await expect(waterSection).toBeVisible();
      const checkboxes = waterSection.locator('input[type="checkbox"]');
      await expect(checkboxes).toHaveCount(2);
      await checkboxes.first().check();

      const textarea = page
        .getByPlaceholder("ระบุรายละเอียดระบบการให้น้ำ")
        .first();
      await textarea.scrollIntoViewIfNeeded();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeDisabled();
    });

    test("TC-022: ระบบการให้น้ำ: เลือก “มี” → ช่อง “ระบุ” enable", async ({
      page,
    }) => {
      const waterSection = page
        .getByRole("heading", { name: /2\.\s*ระบบการให้น้ำ/ })
        .locator("..");
      await waterSection.scrollIntoViewIfNeeded();
      await expect(waterSection).toBeVisible();
      const checkboxes = waterSection.locator('input[type="checkbox"]');
      await expect(checkboxes).toHaveCount(2);
      await checkboxes.nth(1).check();

      const textarea = page
        .getByPlaceholder("ระบุรายละเอียดระบบการให้น้ำ")
        .first();
      await textarea.scrollIntoViewIfNeeded();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEnabled();
      await textarea.fill("มีระบบน้ำหยด");
      await expect(textarea).toHaveValue("มีระบบน้ำหยด");
    });

    test("TC-023: ปุ๋ยเคมี: เพิ่ม/ลบรายการ", async ({ page }) => {
      const chemicalSection = page
        .locator("h5", { hasText: "ปุ๋ยเคมี" })
        .locator("..");
      const formulaInputs = chemicalSection.getByPlaceholder("สูตร/ชื่อปุ๋ย");
      await expect(formulaInputs).toHaveCount(1);

      await page.getByRole("button", { name: "เพิ่มปุ๋ยเคมี" }).click();
      await expect(formulaInputs).toHaveCount(2);

      const removeButton = chemicalSection
        .getByRole("button", { name: "ลบ" })
        .first();
      await expect(removeButton).toBeVisible();
      await removeButton.click();

      await expect(formulaInputs).toHaveCount(1);
    });

    test("TC-024: ปุ๋ยเคมี: กรอกข้อมูลรายการ", async ({ page }) => {
      const chemicalSection = page
        .locator("h5", { hasText: "ปุ๋ยเคมี" })
        .locator("..");
      await chemicalSection.scrollIntoViewIfNeeded();
      await expect(chemicalSection).toBeVisible();

      const formulaInput = chemicalSection
        .getByPlaceholder("สูตร/ชื่อปุ๋ย")
        .first();
      await formulaInput.scrollIntoViewIfNeeded();
      await expect(formulaInput).toBeVisible();
      await formulaInput.fill("ยูเรีย");

      const rateInput = chemicalSection
        .getByPlaceholder("เช่น 2 กก./ไร่ หรือ 200 ก./ต้น")
        .first();
      await rateInput.scrollIntoViewIfNeeded();
      await expect(rateInput).toBeVisible();
      await rateInput.fill("2 กก./ไร่");

      const timesInput = chemicalSection.getByPlaceholder("ครั้ง/ปี").first();
      await timesInput.scrollIntoViewIfNeeded();
      await expect(timesInput).toBeVisible();
      await timesInput.fill("1");

      await expect(
        chemicalSection.getByPlaceholder("สูตร/ชื่อปุ๋ย").first(),
      ).toHaveValue("ยูเรีย");
      await expect(
        chemicalSection
          .getByPlaceholder("เช่น 2 กก./ไร่ หรือ 200 ก./ต้น")
          .first(),
      ).toHaveValue("2 กก./ไร่");
      await expect(
        chemicalSection.getByPlaceholder("ครั้ง/ปี").first(),
      ).toHaveValue("1");
    });

    test("TC-025: ปุ๋ยอินทรีย์: เพิ่ม/ลบรายการ", async ({ page }) => {
      const organicSection = page
        .locator("h5", { hasText: "ปุ๋ยอินทรีย์ / น้ำหมัก" })
        .locator("..");
      const formulaInputs = organicSection.getByPlaceholder(
        "เช่น ปุ๋ยคอก, น้ำหมัก",
      );
      await expect(formulaInputs).toHaveCount(1);

      await page.getByRole("button", { name: "เพิ่มปุ๋ยอินทรีย์" }).click();
      await expect(formulaInputs).toHaveCount(2);

      const removeButton = organicSection
        .getByRole("button", { name: "ลบ" })
        .first();
      await removeButton.click();
      await expect(formulaInputs).toHaveCount(1);
    });

    test("TC-026: ปุ๋ยอื่นๆ: เพิ่ม/ลบรายการ", async ({ page }) => {
      const otherSection = page
        .locator("h5", { hasText: "อื่นๆ" })
        .locator("..");
      const formulaInputs = otherSection.getByPlaceholder("ระบุรายการอื่นๆ");
      await expect(formulaInputs).toHaveCount(1);

      await page.getByRole("button", { name: "เพิ่มรายการอื่นๆ" }).click();
      await expect(formulaInputs).toHaveCount(2);

      const removeButton = otherSection
        .getByRole("button", { name: "ลบ" })
        .first();
      await removeButton.click();
      await expect(formulaInputs).toHaveCount(1);
    });

    test("TC-027: ประวัติการใช้พื้นที่: เลือก “ใช้ประโยชน์” → ช่องปี enable", async ({
      page,
    }) => {
      const section = page
        .locator("div", { hasText: "4. ประวัติการใช้พื้นที่การผลิต" })
        .first();
      const usedCheckbox = getCheckboxInputByLabel(
        section,
        "พื้นที่ใช้ประโยชน์ทางการเกษตร ชนิดของพืชที่เคยปลูกมาก่อน (นับถอยหลังจากปัจจุบัน)",
      );
      await usedCheckbox.check();

      const year1 = page.getByPlaceholder("ระบุพืชที่ปลูกในปีที่ 1").first();
      const year2 = page.getByPlaceholder("ระบุพืชที่ปลูกในปีที่ 2").first();
      await expect(year1).toBeEnabled();
      await expect(year2).toBeEnabled();
    });

    test("TC-028: ประวัติการใช้พื้นที่: เลือก “ไม่เคยใช้ประโยชน์” → ปิด used + ล้างปี", async ({
      page,
    }) => {
      const section = page
        .locator("div", { hasText: "4. ประวัติการใช้พื้นที่การผลิต" })
        .first();
      const usedCheckbox = getCheckboxInputByLabel(
        section,
        "พื้นที่ใช้ประโยชน์ทางการเกษตร ชนิดของพืชที่เคยปลูกมาก่อน (นับถอยหลังจากปัจจุบัน)",
      );
      await usedCheckbox.check();

      const year1 = page.getByPlaceholder("ระบุพืชที่ปลูกในปีที่ 1").first();
      const year2 = page.getByPlaceholder("ระบุพืชที่ปลูกในปีที่ 2").first();
      await year1.fill("ข้าว");
      await year2.fill("มันสำปะหลัง");
      await expect(year1).toHaveValue("ข้าว");
      await expect(year2).toHaveValue("มันสำปะหลัง");

      const neverUsedCheckbox = getCheckboxInputByLabel(
        section,
        "พื้นที่ไม่เคยใช้ประโยชน์ทางการเกษตร",
      );
      await neverUsedCheckbox.check();

      await expect(year1).toBeDisabled();
      await expect(year2).toBeDisabled();
      await expect(year1).toHaveValue("");
      await expect(year2).toHaveValue("");
      await expect(usedCheckbox).not.toBeChecked();
    });

    test("TC-029: ศัตรูพืช/โรค: เพิ่ม/ลบรายการ", async ({ page }) => {
      const section = page
        .getByRole("heading", {
          name: /5\.\s*การแพร่ระบาดของศัตรูพืช\/โรค\/อาการผิดปกติ และการจัดการ/,
        })
        .locator("..");

      const nameInputs = page.getByPlaceholder("ชื่อศัตรูพืช/โรค/อาการ");
      await expect(nameInputs).toHaveCount(1);

      await section
        .getByRole("button", { name: "เพิ่มรายการ", exact: true })
        .click();
      await expect(nameInputs).toHaveCount(2);

      const removeButtons = section.getByRole("button", { name: "ลบรายการ" });
      await removeButtons.first().click();
      await expect(nameInputs).toHaveCount(1);
    });

    test("TC-030: ศัตรูพืช/โรค: กรอกข้อมูลรายการ", async ({ page }) => {
      const nameInput = page.getByPlaceholder("ชื่อศัตรูพืช/โรค/อาการ").first();
      await nameInput.scrollIntoViewIfNeeded();
      await expect(nameInput).toBeVisible();
      await nameInput.fill("เพลี้ย");

      const seasonInput = page.getByPlaceholder("เช่น ฤดูฝน, ฤดูแล้ง").first();
      await seasonInput.scrollIntoViewIfNeeded();
      await expect(seasonInput).toBeVisible();
      await seasonInput.fill("ฤดูฝน");

      const methodInput = page
        .getByPlaceholder("ระบุวิธีการป้องกันและการจัดการ")
        .first();
      await methodInput.scrollIntoViewIfNeeded();
      await expect(methodInput).toBeVisible();
      await methodInput.fill("ตัดแต่งกิ่ง");

      await expect(
        page.getByPlaceholder("ชื่อศัตรูพืช/โรค/อาการ").first(),
      ).toHaveValue("เพลี้ย");
      await expect(
        page.getByPlaceholder("เช่น ฤดูฝน, ฤดูแล้ง").first(),
      ).toHaveValue("ฤดูฝน");
      await expect(
        page.getByPlaceholder("ระบุวิธีการป้องกันและการจัดการ").first(),
      ).toHaveValue("ตัดแต่งกิ่ง");
    });

    test("TC-031: พืชข้างเคียง: เลือก “ไม่มี” → ปิดการกรอกและปุ่มเพิ่ม", async ({
      page,
    }) => {
      const section = page
        .getByRole("heading", {
          name: /6\.\s*ชนิดของพืชที่ปลูกข้างเคียงสวนยาง/,
        })
        .locator("..");

      const checkboxes = section.locator('input[type="checkbox"]');
      await expect(checkboxes).toHaveCount(2);
      await checkboxes.first().check();

      const plantInput = page
        .getByPlaceholder("ระบุชนิดพืชที่ปลูกข้างเคียง")
        .first();
      await expect(plantInput).toBeDisabled();

      const addButton = section.getByRole("button", {
        name: "เพิ่มรายการ",
        exact: true,
      });
      await expect(addButton).toBeDisabled();
    });

    test("TC-032: พืชข้างเคียง: เลือก “มี” → กรอก/เพิ่ม/ลบ ได้", async ({
      page,
    }) => {
      const section = page
        .getByRole("heading", {
          name: /6\.\s*ชนิดของพืชที่ปลูกข้างเคียงสวนยาง/,
        })
        .locator("..");

      const checkboxes = section.locator('input[type="checkbox"]');
      await expect(checkboxes).toHaveCount(2);
      await checkboxes.nth(1).check();

      const plantInputs = page.getByPlaceholder("ระบุชนิดพืชที่ปลูกข้างเคียง");
      await expect(plantInputs.first()).toBeEnabled();
      await plantInputs.first().fill("กล้วย");
      await expect(plantInputs.first()).toHaveValue("กล้วย");

      const addButton = section.getByRole("button", {
        name: "เพิ่มรายการ",
        exact: true,
      });
      await expect(addButton).toBeEnabled();
      await addButton.click();
      await expect(plantInputs).toHaveCount(2);

      const removeButtons = section.getByRole("button", { name: "ลบรายการ" });
      await removeButtons.first().click();
      await expect(plantInputs).toHaveCount(1);
    });

    test("TC-033: ข้อมูลเพิ่มเติม: กรอกได้", async ({ page }) => {
      const textarea = page
        .getByPlaceholder(
          "ระบุข้อมูลอื่น ๆ เช่น ชนิดพืชร่วม พืชแซม หรือข้อมูลเพิ่มเติมอื่น ๆ",
        )
        .first();

      await textarea.scrollIntoViewIfNeeded();
      await expect(textarea).toBeVisible();
      await textarea.fill("มีพืชแซมในบางแปลง");
      await expect(textarea).toHaveValue("มีพืชแซมในบางแปลง");
    });
  });

  test.describe("บันทึกข้อมูลประจำสวนยาง - การบันทึก (PUT mock)", () => {
    test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
    // test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await loginAsAuditor(page, AUDITOR_USER);
      await gotoGardenData(page);
      await waitForInspectionsTable(page);

      // ใช้ข้อมูลแถวแรกของแท็บ “ตรวจประเมินเสร็จแล้ว” ตามเงื่อนไข
      await clickAndWaitInspectionsReload(page, () =>
        page.getByRole("button", { name: TAB_COMPLETED, exact: true }).click(),
      );

      await goToStep2FromFirstRow(page);
    });

    test("TC-034: Update สำเร็จแสดง toast", async ({ page }) => {
      await page.route(/\/api\/v1\/data-records\/\d+$/, async (route) => {
        if (route.request().method() !== "PUT") return route.continue();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ dataRecordId: 1, version: 2 }),
        });
      });

      const moreInfo = page
        .getByPlaceholder(
          "ระบุข้อมูลอื่น ๆ เช่น ชนิดพืชร่วม พืชแซม หรือข้อมูลเพิ่มเติมอื่น ๆ",
        )
        .first();
      await moreInfo.scrollIntoViewIfNeeded();
      await expect(moreInfo).toBeVisible();
      await moreInfo.fill("แก้ไขข้อมูลเพื่อทดสอบการบันทึก");

      const [putRequest] = await Promise.all([
        page.waitForRequest((req) => {
          return (
            req.method() === "PUT" &&
            /\/api\/v1\/data-records\/\d+$/.test(req.url())
          );
        }),
        page.getByRole("button", { name: BUTTON_SAVE }).click(),
      ]);
      expect(putRequest).toBeTruthy();

    const successToast = page.getByText("บันทึกข้อมูลเรียบร้อย");
    await successToast.scrollIntoViewIfNeeded();
    await expect(successToast).toBeVisible();
    });

    test("TC-035: บันทึกไม่สำเร็จแสดง toast error", async ({ page }) => {
      const errorMessage = "บันทึกข้อมูลไม่สำเร็จ";
      await page.route(/\/api\/v1\/data-records\/\d+$/, async (route) => {
        if (route.request().method() !== "PUT") return route.continue();
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: errorMessage }),
        });
      });

      const saveButton = page.getByRole("button", { name: BUTTON_SAVE });
      await saveButton.scrollIntoViewIfNeeded();
      await expect(saveButton).toBeVisible();
      const [putRequest] = await Promise.all([
        page.waitForRequest((req) => {
          return (
            req.method() === "PUT" &&
            /\/api\/v1\/data-records\/\d+$/.test(req.url())
          );
        }),
        saveButton.click(),
      ]);
      expect(putRequest).toBeTruthy();

    const errorToast = page.getByText(errorMessage);
    await errorToast.scrollIntoViewIfNeeded();
    await expect(errorToast).toBeVisible();
  });
  });
});
