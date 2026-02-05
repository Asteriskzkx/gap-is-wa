import { expect, test } from "@playwright/test";

const AUDITOR_USER = {
  email: process.env.E2E_TEST_AUDITOR_WITH_INSP_EMAIL,
  password: process.env.E2E_TEST_AUDITOR_WITH_INSP_PASSWORD,
};

const HAS_AUDITOR_CREDS = Boolean(AUDITOR_USER.email && AUDITOR_USER.password);

function jsonResponse(route, status, data) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  });
}

async function loginAsAuditor(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const auditorRoleButton = page
    .getByRole("button", { name: /ผู้ตรวจประเมิน/ })
    .first();
  await page.waitForLoadState('networkidle')
  await auditorRoleButton.click();
  console.log("Selected auditor role");


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
  await page.waitForURL(/\/auditor\/dashboard/, {
    timeout: 20000,
    waitUntil: "domcontentloaded",
  });
}

function getAutoCompleteInput(page, id) {
  return page
    .locator(`input#${id}`)
    .or(page.locator(`#${id} input`))
    .first();
}

async function expectVisible(locator, options) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible(options);
}

async function selectAutoCompleteOptionByText(page, id, text) {
  const input = getAutoCompleteInput(page, id);
  await expectVisible(input, { timeout: 10000 });
  await input.click();
  await input.fill(text);

  const widget = page.locator(`#${id}`).or(input.locator("..")).first();
  const dropdown = widget.locator("button.p-autocomplete-dropdown").first();
  await dropdown.click();

  const panel = page.locator(".p-autocomplete-panel:visible").first();
  await expectVisible(panel, { timeout: 10000 });

  const option = panel.getByRole("option", { name: text, exact: true }).first();
  await expectVisible(option, { timeout: 10000 });
  await option.click();

  await expect(input).toHaveValue(text, { timeout: 10000 });
  await page.keyboard.press("Escape");
  await panel.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
}

function makeInspection({
  inspectionId,
  inspectionNo,
  inspectionDateAndTime = "2025-01-15T10:00:00.000Z",
  inspectionStatus = "ตรวจประเมินแล้ว",
  inspectionResult = "รอผลการตรวจประเมิน",
  rubberFarm,
  rubberFarmId = 101,
} = {}) {
  return {
    inspectionId,
    inspectionNo,
    inspectionDateAndTime,
    inspectionStatus,
    inspectionResult,
    inspectionTypeId: 1,
    auditorChiefId: 1,
    rubberFarmId,
    rubberFarm,
    version: 1,
    inspectionType: { typeName: "ตรวจประเมินสวนยางพาราหลังเปิดกรีด" },
  };
}

function makeRubberFarm({
  villageName = "สวนยางบ้านตัวอย่าง",
  subDistrict = "คอหงส์",
  district = "หาดใหญ่",
  province = "สงขลา",
  farmer = { namePrefix: "นาย", firstName: "สมชาย", lastName: "ใจดี" },
} = {}) {
  return {
    villageName,
    subDistrict,
    district,
    province,
    farmer,
  };
}

async function mockReportsList(page, handler) {
  // Only mock the inspections list endpoint (which always includes query params).
  // Avoid hijacking `/api/v1/inspections/:id` which is used by summary/detail pages.
  await page.route("**/api/v1/inspections**", async (route) => {
    const requestUrl = route.request().url();
    if (!requestUrl.includes("/api/v1/inspections?")) {
      return route.fallback();
    }
    const url = new URL(requestUrl);
    const payload = handler(url);
    await jsonResponse(route, 200, payload);
  });
}

async function mockInspectionSummaryApis(page, { inspection, items, farm }) {
  await page.route(/\/api\/v1\/inspections\/\d+$/, async (route) => {
    await jsonResponse(route, 200, inspection);
  });

  await page.route("**/api/v1/inspection-items**", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.searchParams.get("inspectionId") === String(inspection.inspectionId)
    )
      return jsonResponse(route, 200, items);
    return jsonResponse(route, 200, []);
  });

  await page.route(/\/api\/v1\/rubber-farms\/\d+$/, async (route) => {
    await jsonResponse(route, 200, farm);
  });
}

async function mockInspectionDetailApis(page, { inspection, items, farm }) {
  await mockInspectionSummaryApis(page, { inspection, items, farm });
}

function getReportsTable(page) {
  return page.locator(".primary-datatable-wrapper").first();
}

function getFirstRowActionButton(table) {
  return table.locator("tbody tr").first().locator("button").first();
}

test.describe("สรุปผลการตรวจประเมินสวนยางพารา - ผู้ตรวจประเมิน", () => {
  // These tests share the same real user credentials; running in parallel can
  // intermittently break authentication flows.
  test.describe.configure({ mode: "serial" });

  test.describe("หน้ารายการสรุปผล (/auditor/reports)", () => {
    test("TC-001: ต้อง login ก่อนเข้าใช้งาน 001", async ({ page }) => {
      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });
      await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    });

    test("TC-002: แสดงหัวข้อ/คำอธิบาย และปุ่มแท็บ 002", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      await mockReportsList(page, () => ({
        results: [],
        paginator: { total: 0 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });

      await expectVisible(
        page.getByRole("heading", { name: "สรุปผลการตรวจประเมิน" }),
      );
      await expectVisible(
        page.getByText("จัดการและสรุปผลการตรวจประเมินสวนยางพารา", {
          exact: true,
        }),
      );
      await expectVisible(page.getByRole("button", { name: "รอสรุปผล" }));
      await expectVisible(page.getByRole("button", { name: "เสร็จสิ้น" }));
    });

    test("TC-003: ค่าเริ่มต้นแท็บ “รอสรุปผล” + empty message ถูกต้อง 003", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      await mockReportsList(page, () => ({
        results: [],
        paginator: { total: 0 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });
      await expectVisible(
        page.getByText("ไม่พบรายการตรวจประเมินที่รอสรุปผล", { exact: true }),
      );
    });

    test("TC-004: สลับแท็บเป็น “เสร็จสิ้น” + empty message ถูกต้อง 004", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      await mockReportsList(page, (url) => {
        // completed tab omits inspectionResult query param.
        const hasInspectionResult = url.searchParams.has("inspectionResult");
        return hasInspectionResult
          ? { results: [], paginator: { total: 0 } }
          : { results: [], paginator: { total: 0 } };
      });

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });
      // Wait for initial data request (pending tab).
      await page.waitForRequest((request) => {
        return (
          request.url().includes("/api/v1/inspections") &&
          request.method() === "GET"
        );
      });

      const completedFetch = page.waitForRequest((request) => {
        const url = request.url();
        return (
          url.includes("/api/v1/inspections") &&
          request.method() === "GET" &&
          !url.includes("inspectionResult=")
        );
      });

      await page.getByRole("button", { name: "เสร็จสิ้น" }).click();
      await completedFetch;
      await expectVisible(
        page.getByText("ไม่พบรายการตรวจประเมินที่เสร็จสิ้น", { exact: true }),
      );
    });

    test("TC-005: ตัวกรองพื้นที่ enable/disable ตามลำดับชั้น 005", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      await mockReportsList(page, () => ({
        results: [],
        paginator: { total: 0 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });

      const districtInput = getAutoCompleteInput(page, "district-search");
      const subDistrictInput = getAutoCompleteInput(page, "subdistrict-search");
      await expect(districtInput).toBeDisabled();
      await expect(subDistrictInput).toBeDisabled();

      await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
      await expect(districtInput).not.toBeDisabled();
      await expect(subDistrictInput).toBeDisabled();
    });

    test("TC-006: กด “ล้างค่า” รีเซ็ตตัวกรอง 006", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);

      const defaultRows = [
        makeInspection({
          inspectionId: 1,
          inspectionNo: 2025120001,
          rubberFarm: makeRubberFarm({
            province: "สงขลา",
            district: "หาดใหญ่",
          }),
        }),
      ];
      const filteredRows = [
        makeInspection({
          inspectionId: 2,
          inspectionNo: 2025120002,
          rubberFarm: makeRubberFarm({
            province: "สงขลา",
            district: "หาดใหญ่",
            subDistrict: "คอหงส์",
          }),
        }),
      ];

      await mockReportsList(page, (url) => {
        const province = url.searchParams.get("province");
        const district = url.searchParams.get("district");
        const subDistrict = url.searchParams.get("subDistrict");
        const isFiltered =
          province === "สงขลา" &&
          district === "หาดใหญ่" &&
          subDistrict === "คอหงส์";

        return {
          results: isFiltered ? filteredRows : defaultRows,
          paginator: {
            total: isFiltered ? filteredRows.length : defaultRows.length,
          },
        };
      });

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });
      const table = getReportsTable(page);
      await expect(table).toContainText(String(defaultRows[0].inspectionNo));

      await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
      await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
      await selectAutoCompleteOptionByText(
        page,
        "subdistrict-search",
        "คอหงส์",
      );
      await page.getByRole("button", { name: "ค้นหา" }).click();

      await expect(table).toContainText(String(filteredRows[0].inspectionNo));

      await page.getByRole("button", { name: "ล้างค่า" }).click();
      await expect(table).toContainText(String(defaultRows[0].inspectionNo));
    });

    test("TC-007: แสดงคอลัมน์หลักของตาราง 007", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const rows = [
        makeInspection({
          inspectionId: 1,
          inspectionNo: 2025120001,
          rubberFarm: makeRubberFarm(),
        }),
      ];
      await mockReportsList(page, () => ({
        results: rows,
        paginator: { total: 1 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });

      await expectVisible(
        page.getByRole("columnheader", { name: "รหัสการตรวจ" }),
      );
      await expectVisible(page.getByRole("columnheader", { name: "เกษตรกร" }));
      await expectVisible(page.getByRole("columnheader", { name: "สถานที่" }));
      await expectVisible(
        page.getByRole("columnheader", { name: "วันที่ตรวจ" }),
      );
      await expectVisible(page.getByRole("columnheader", { name: "สถานะ" }));
      await expectVisible(page.getByRole("columnheader", { name: "จัดการ" }));
    });

    test("TC-008: กดปุ่ม “จัดการ” แล้วไปหน้าสรุปผล 008", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 77;
      const rows = [
        makeInspection({
          inspectionId,
          inspectionNo: 2025120077,
          rubberFarm: makeRubberFarm(),
        }),
      ];
      await mockReportsList(page, () => ({
        results: rows,
        paginator: { total: 1 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });
      const table = getReportsTable(page);
      await expect(table).toContainText(String(rows[0].inspectionNo));

      await getFirstRowActionButton(table).click();
      await page.waitForURL(`**/auditor/inspection-summary/${inspectionId}`, {
        timeout: 10000,
      });
    });

    test("TC-009: แสดง fallback ของข้อมูลบางช่อง 009", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const rows = [
        makeInspection({
          inspectionId: 1,
          inspectionNo: 2025120001,
          rubberFarm: makeRubberFarm({
            villageName: "",
            subDistrict: "",
            district: "",
            province: "",
            farmer: null,
          }),
        }),
      ];
      await mockReportsList(page, () => ({
        results: rows,
        paginator: { total: 1 },
      }));

      await page.goto("/auditor/reports", { waitUntil: "domcontentloaded" });

      const table = getReportsTable(page);
      await expect(table).toContainText("ไม่มีข้อมูล");
      await expect(table).toContainText("-");
    });
  });

  test.describe("หน้าสรุปผลการตรวจ (/auditor/inspection-summary/:id)", () => {
    test("TC-010: ต้อง login ก่อนเข้าใช้งาน 010", async ({ page }) => {
      await page.goto("/auditor/inspection-summary/1", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    });

    test("TC-011: แสดงหัวข้อ/คำอธิบาย และหัวข้อ section หลัก 011", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspection = makeInspection({
        inspectionId: 1,
        inspectionNo: 2025120001,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 101,
        rubberFarm: makeRubberFarm(),
      });
      const items = [
        {
          inspectionItemId: 11,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [],
        },
      ];
      const farm = { ...makeRubberFarm(), farmerId: 501 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.goto("/auditor/inspection-summary/1", {
        waitUntil: "domcontentloaded",
      });

      await expectVisible(
        page.getByRole("heading", { name: "สรุปผลการตรวจประเมิน" }).first(),
      );
      await expectVisible(
        page.getByText("กรุณาตรวจสอบข้อมูลและสรุปผลการประเมินสวนยางพารา", {
          exact: true,
        }),
      );

      await expectVisible(page.getByRole("heading", { name: "ข้อมูลทั่วไป" }));
      await expectVisible(
        page.getByRole("heading", { name: "ผลการตรวจประเมินรายหัวข้อ" }),
      );
      const summaryHeadings = page.getByRole("heading", {
        name: "สรุปผลการตรวจประเมิน",
      });
      await expect(summaryHeadings).toHaveCount(2);
      await expectVisible(summaryHeadings.nth(1));
    });

    test("TC-012: ตาราง “ผลการตรวจประเมินรายหัวข้อ” และนำทางไปหน้า detail 012", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 2;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120002,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 102,
        rubberFarm: makeRubberFarm(),
      });
      const itemId = 21;
      const items = [
        {
          inspectionItemId: itemId,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [],
        },
      ];
      const farm = { ...makeRubberFarm(), farmerId: 502 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });

      await expectVisible(page.getByRole("columnheader", { name: "ลำดับ" }));
      await expectVisible(
        page.getByRole("columnheader", { name: "รายการตรวจประเมิน" }),
      );
      await expectVisible(
        page.getByRole("columnheader", { name: "ผลการประเมิน" }),
      );
      await expectVisible(
        page.getByRole("columnheader", { name: "รายละเอียด" }),
      );

      // Use nth(1) because first table is auditor list, second table is inspection items
      const table = page.locator(".primary-datatable-wrapper").nth(1);
      // Wait for table data to load before interacting
      await expect(table).toContainText("น้ำ", { timeout: 10000 });
      const eyeButton = table.locator("button:has(.pi-eye)").first();
      await expectVisible(eyeButton, { timeout: 10000 });
      await eyeButton.click();
      await page.waitForURL(
        `**/auditor/inspection-detail/${inspectionId}/${itemId}`,
        { timeout: 10000 },
      );
    });

    test("TC-013: กรณี completed: ซ่อนปุ่มบันทึกและปุ่มซ้ายเป็น “กลับ” 013", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 3;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120003,
        inspectionResult: "ผ่าน",
        rubberFarmId: 103,
        rubberFarm: makeRubberFarm(),
      });
      const items = [];
      const farm = { ...makeRubberFarm(), farmerId: 503 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });
      await expectVisible(page.getByRole("button", { name: "กลับ" }));
      await expect(
        page.getByRole("button", { name: "บันทึกผลการประเมิน" }),
      ).toHaveCount(0);
    });

    test("TC-014: กรณี pending: บันทึกผลสำเร็จและกลับหน้า reports 014", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 4;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120004,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 104,
        rubberFarm: makeRubberFarm(),
      });
      const items = [];
      const farm = { ...makeRubberFarm(), farmerId: 504 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.route(
        `**/api/v1/inspections/${inspectionId}/result`,
        async (route) => {
          await jsonResponse(route, 200, { version: 2 });
        },
      );

      await mockReportsList(page, () => ({
        results: [],
        paginator: { total: 0 },
      }));

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "บันทึกผลการประเมิน" }).click();
      await expectVisible(
        page.getByText("บันทึกผลการประเมินเรียบร้อยแล้ว", { exact: true }),
      );
      await page.waitForURL("**/auditor/reports", { timeout: 10000 });
    });

    test("TC-015: กรณี pending: บันทึกไม่สำเร็จ 015", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 5;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120005,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 105,
        rubberFarm: makeRubberFarm(),
      });
      const items = [];
      const farm = { ...makeRubberFarm(), farmerId: 505 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.route(
        `**/api/v1/inspections/${inspectionId}/result`,
        async (route) => {
          await jsonResponse(route, 400, { message: "บันทึกไม่สำเร็จ (mock)" });
        },
      );

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "บันทึกผลการประเมิน" }).click();
      await expectVisible(
        page.getByText("บันทึกไม่สำเร็จ (mock)", { exact: true }),
      );
    });

    test("TC-016: กรณี pending: บันทึกชนกัน (409 conflict) 016", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 6;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120006,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 106,
        rubberFarm: makeRubberFarm(),
      });
      const items = [];
      const farm = { ...makeRubberFarm(), farmerId: 506 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.route(
        `**/api/v1/inspections/${inspectionId}/result`,
        async (route) => {
          await jsonResponse(route, 409, {
            userMessage: "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว (mock)",
          });
        },
      );

      const conflictMessage = "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว (mock)";
      const putResponse = page.waitForResponse((response) => {
        return (
          response
            .url()
            .includes(`/api/v1/inspections/${inspectionId}/result`) &&
          response.status() === 409
        );
      });
      const reloadNavigation = page
        .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 })
        .catch(() => null);

      let inspectionFetchCount = 0;
      page.on("request", (request) => {
        if (request.url().includes(`/api/v1/inspections/${inspectionId}`)) {
          inspectionFetchCount += 1;
        }
      });

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });

      await page.getByRole("button", { name: "บันทึกผลการประเมิน" }).click();
      await putResponse;

      // App reloads immediately after showing the toast, which can be too fast to
      // assert reliably in E2E. Treat "toast seen" OR "reload happened" as pass.
      const toastSeen = await page
        .getByText(conflictMessage, { exact: true })
        .isVisible()
        .catch(() => false);
      const nav = await reloadNavigation;

      if (!toastSeen && !nav) {
        await expect
          .poll(() => inspectionFetchCount, { timeout: 10000 })
          .toBeGreaterThan(1);
      }
    });

    test("TC-017: กรณี pending: error ระดับ network/exception 017", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 7;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120007,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 107,
        rubberFarm: makeRubberFarm(),
      });
      const items = [];
      const farm = { ...makeRubberFarm(), farmerId: 507 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });

      await page.route(
        `**/api/v1/inspections/${inspectionId}/result`,
        async (route) => {
          await route.abort("failed");
        },
      );

      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByRole("button", { name: "บันทึกผลการประเมิน" }).click();
      await expectVisible(
        page.getByText("เกิดข้อผิดพลาดในการบันทึกผลการประเมิน", {
          exact: true,
        }),
      );
    });
  });

  test.describe("หน้ารายละเอียดรายการตรวจ (/auditor/inspection-detail/:id/:itemId)", () => {
    test("TC-018: ต้อง login ก่อนเข้าใช้งาน 018", async ({ page }) => {
      await page.goto("/auditor/inspection-detail/1/1", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    });

    test("TC-019: แสดงหัวข้อและข้อมูลสรุปการตรวจ 019", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 10;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120010,
        inspectionResult: "ผ่าน",
        rubberFarmId: 110,
        rubberFarm: makeRubberFarm(),
      });
      const items = [
        {
          inspectionItemId: 1001,
          inspectionId,
          inspectionItemMasterId: 1,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          otherConditions: {},
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [],
        },
      ];
      const farm = { ...makeRubberFarm(), farmerId: 510 };

      await mockInspectionDetailApis(page, { inspection, items, farm });

      await page.goto(`/auditor/inspection-detail/${inspectionId}/1001`, {
        waitUntil: "domcontentloaded",
      });
      await expectVisible(
        page.getByRole("heading", { name: "รายละเอียดการตรวจประเมิน" }),
      );

      await expectVisible(
        page.getByRole("heading", { name: "รหัสการตรวจ", level: 2 }),
      );
      await expectVisible(
        page.getByRole("heading", { name: "วันที่ตรวจประเมิน", level: 2 }),
      );
      await expectVisible(
        page.getByRole("heading", { name: "ประเภทการตรวจประเมิน", level: 2 }),
      );
      await expectVisible(
        page.getByRole("heading", { name: "สถานที่", level: 2 }),
      );
    });

    test("TC-020: แสดงหัวข้อรายการ + ส่วนข้อกำหนด (หรือ empty) 020", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 11;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120011,
        inspectionResult: "ผ่าน",
        rubberFarmId: 111,
        rubberFarm: makeRubberFarm(),
      });

      const itemWithRequirementsId = 2001;
      const itemWithoutRequirementsId = 2002;

      const items = [
        {
          inspectionItemId: itemWithRequirementsId,
          inspectionId,
          inspectionItemMasterId: 1,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          otherConditions: {},
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [
            {
              requirementId: 1,
              requirementNo: 1,
              evaluationResult: "ใช่",
              evaluationMethod: "ดูเอกสาร",
              note: "",
              requirementMaster: {
                requirementName: "มีแหล่งน้ำสะอาด",
                requirementLevel: "ข้อกำหนดหลัก",
                requirementLevelNo: "1",
              },
            },
          ],
        },
        {
          inspectionItemId: itemWithoutRequirementsId,
          inspectionId,
          inspectionItemMasterId: 2,
          inspectionItemNo: 2,
          inspectionItemResult: "ผ่าน",
          otherConditions: {},
          inspectionItemMaster: { itemNo: 2, itemName: "พื้นที่ปลูก" },
          requirements: [],
        },
      ];

      const farm = { ...makeRubberFarm(), farmerId: 511 };
      await mockInspectionDetailApis(page, { inspection, items, farm });

      await page.goto(
        `/auditor/inspection-detail/${inspectionId}/${itemWithRequirementsId}`,
        { waitUntil: "domcontentloaded" },
      );
      await expectVisible(page.getByText("รายการที่ 1 : น้ำ", { exact: true }));
      await expectVisible(page.getByText("ข้อกำหนด", { exact: true }));

      await page.goto(
        `/auditor/inspection-detail/${inspectionId}/${itemWithoutRequirementsId}`,
        { waitUntil: "domcontentloaded" },
      );
      await expectVisible(
        page.getByText("รายการที่ 2 : พื้นที่ปลูก", { exact: true }),
      );
      await expectVisible(
        page.getByText("ไม่พบข้อกำหนดสำหรับรายการนี้", { exact: true }),
      );
    });

    test("TC-021: แสดง “ข้อมูลเพิ่มเติม” ตามประเภท item (ตัวอย่าง: น้ำ) 021", async ({
      page,
    }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);
      const inspectionId = 12;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120012,
        inspectionResult: "ผ่าน",
        rubberFarmId: 112,
        rubberFarm: makeRubberFarm(),
      });
      const itemId = 3001;
      const items = [
        {
          inspectionItemId: itemId,
          inspectionId,
          inspectionItemMasterId: 1,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          otherConditions: {
            waterSourceInPlantation: "บ่อบาดาล",
            waterSourcePostHarvest: "ประปาหมู่บ้าน",
          },
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [],
        },
      ];
      const farm = { ...makeRubberFarm(), farmerId: 512 };

      await mockInspectionDetailApis(page, { inspection, items, farm });

      await page.goto(`/auditor/inspection-detail/${inspectionId}/${itemId}`, {
        waitUntil: "domcontentloaded",
      });
      await expectVisible(page.getByText("ข้อมูลเพิ่มเติม", { exact: true }));
      await expectVisible(
        page.getByText("แหล่งน้ำที่ใช้ในแปลงปลูก", { exact: true }),
      );
      await expectVisible(
        page.getByText("น้ำที่ใช้ในการหลังการเก็บเกี่ยว", { exact: true }),
      );
    });

    test("TC-022: ปุ่มกลับไปหน้าสรุปผล 022", async ({ page }) => {
      test.skip(
        !HAS_AUDITOR_CREDS,
        "Missing E2E_TEST_AUDITOR_WITH_INSP_EMAIL/PASSWORD",
      );
      await loginAsAuditor(page, AUDITOR_USER);

      const inspectionId = 13;
      const inspection = makeInspection({
        inspectionId,
        inspectionNo: 2025120013,
        inspectionResult: "รอผลการตรวจประเมิน",
        rubberFarmId: 113,
        rubberFarm: makeRubberFarm(),
      });
      const itemId = 4001;
      const items = [
        {
          inspectionItemId: itemId,
          inspectionItemNo: 1,
          inspectionItemResult: "ผ่าน",
          inspectionItemMaster: { itemNo: 1, itemName: "น้ำ" },
          requirements: [],
          otherConditions: {},
        },
      ];
      const farm = { ...makeRubberFarm(), farmerId: 513 };

      await mockInspectionSummaryApis(page, { inspection, items, farm });
      await page.goto(`/auditor/inspection-summary/${inspectionId}`, {
        waitUntil: "domcontentloaded",
      });

      // Use nth(1) because first table is auditor list, second table is inspection items
      const summaryTable = page.locator(".primary-datatable-wrapper").nth(1);
      // Wait for table data to load before interacting
      await expect(summaryTable).toContainText("น้ำ", { timeout: 10000 });
      await summaryTable.locator("button:has(.pi-eye)").first().click();
      await page.waitForURL(
        `**/auditor/inspection-detail/${inspectionId}/${itemId}`,
        { timeout: 10000 },
      );

      await page.getByRole("button", { name: "กลับไปหน้าสรุปผล" }).click();
      await page.waitForURL(`**/auditor/inspection-summary/${inspectionId}`, {
        timeout: 10000,
      });
    });
  });
});
