// tests/farmerApplications/farmerApplications.spec.js (Playwright E2E Tests)
import { expect, test } from "@playwright/test";

const USERS = {
  farmer: {
    email: process.env.E2E_TEST_USER_EMAIL,
    password: process.env.E2E_TEST_USER_PASSWORD,
  },
};

async function loginAsFarmer(page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "เกษตรกร" }).click();

  const emailInput = page
    .getByLabel("อีเมล")
    .or(page.locator('input[name="email"]'))
    .first();
  const passwordInput = page
    .getByLabel("รหัสผ่าน")
    .or(page.locator('input[name="password"]'))
    .first();

  await emailInput.fill(USERS.farmer.email);
  await passwordInput.fill(USERS.farmer.password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await page.waitForURL(/\/farmer/, {
    timeout: 20000,
    waitUntil: "domcontentloaded",
  });
}

function buildAdviceAndDefect({
  adviceAndDefectId = 1,
  date = "2025-12-01T00:00:00+07:00",
  adviceList = [],
  defectList = [],
} = {}) {
  return { adviceAndDefectId, date, adviceList, defectList };
}

function formatFarmId(value) {
  return `RF${String(value).padStart(5, "0")}`;
}

const INSPECTION_BASE = 2025050000;

function inspectionNoFromSequence(sequence) {
  return String(INSPECTION_BASE + sequence);
}

function buildInspection({
  inspectionId = 1,
  inspectionNo = INSPECTION_BASE + 1,
  inspectionDateAndTime = null,
  inspectionStatus = "รอการตรวจประเมิน",
  inspectionResult = "",
  rubberFarmId = 1,
  adviceAndDefect = null,
} = {}) {
  return {
    inspectionId,
    inspectionNo: String(inspectionNo ?? ""),
    inspectionDateAndTime,
    inspectionStatus,
    inspectionResult,
    rubberFarmId,
    adviceAndDefect,
  };
}

function buildFarm({
  rubberFarmId,
  farmId = null,
  villageName = `หมู่บ้านทดสอบ ${rubberFarmId}`,
  moo = 1,
  location = null,
  district = "เมือง",
  province = "สงขลา",
  subDistrict = "บ่อยาง",
  createdAt = "2025-01-01T00:00:00+07:00",
  inspection = null,
} = {}) {
  return {
    rubberFarmId,
    farmId,
    villageName,
    moo,
    location,
    district,
    province,
    subDistrict,
    createdAt,
    inspection,
  };
}

function buildPagedResponse({ results, offset = 0, limit = 10, total } = {}) {
  return {
    results,
    paginator: {
      offset,
      limit,
      total: typeof total === "number" ? total : results.length,
    },
  };
}

function getApplicationsTable(page) {
  return page.locator(".primary-datatable-wrapper");
}

async function gotoApplicationsPage(page) {
  await page.goto("/farmer/applications", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "ติดตามสถานะการรับรอง" }),
  ).toBeVisible({ timeout: 10000 });
}

async function mockRubberFarmsApi(page, handler) {
  await page.route("**/api/v1/rubber-farms**", async (route) => {
    const url = new URL(route.request().url());
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const multiSortMetaRaw = url.searchParams.get("multiSortMeta");

    let multiSortMeta;
    try {
      multiSortMeta = multiSortMetaRaw ? JSON.parse(multiSortMetaRaw) : null;
    } catch {
      multiSortMeta = null;
    }

    const response = await handler({
      url,
      offset,
      limit,
      multiSortMeta,
      route,
    });

    if (response?.__passthrough) {
      await route.continue();
      return;
    }

    const status = response?.status ?? 200;
    const body =
      typeof response?.body === "string"
        ? response.body
        : JSON.stringify(response?.body ?? {});

    await route.fulfill({
      status,
      contentType: "application/json",
      body,
    });
  });
}

test.describe("Farmer Applications — ติดตามสถานะการรับรอง", () => {
  test("TC-001: ไม่ได้ login แล้วเข้าหน้า applications", async ({ page }) => {
    await page.goto("/farmer/applications", { waitUntil: "domcontentloaded" });

    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 10000,
    });
    await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
  });

  test.describe("Authenticated", () => {
    test.describe.configure({ mode: "serial" });

    let page;

    test.beforeEach(async ({ page: testPage }) => {
      page = testPage;
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.unroute("**/api/v1/rubber-farms**");
      await loginAsFarmer(page);
    });

    test("TC-002: แสดงหัวข้อและคำอธิบายหน้า", async () => {
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: [] }),
      }));

      await gotoApplicationsPage(page);
      await expect(
        page.getByText("ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต"),
      ).toBeVisible();
      // await page.waitForTimeout(3000);
    });

    test("TC-003: แสดง loading ระหว่างดึงข้อมูล", async () => {
      await mockRubberFarmsApi(page, async () => {
        await new Promise((r) => setTimeout(r, 1200));
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoApplicationsPage(page);

      const table = getApplicationsTable(page);
      await expect(table).toBeVisible();

      const loadingOverlay = table.locator(".p-datatable-loading-overlay");
      await expect(loadingOverlay).toBeVisible();
      // await page.waitForTimeout(3000);
    });

    test("TC-004: แสดง error เมื่อ API ดึงข้อมูลล้มเหลว", async () => {
      await mockRubberFarmsApi(page, async () => ({
        status: 500,
        body: { message: "Internal Server Error" },
      }));

      await gotoApplicationsPage(page);
      await expect(
        page.getByText("ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง"),
      ).toBeVisible();
      await expect(getApplicationsTable(page)).toHaveCount(0);
    });

    test("TC-005: ไม่มีข้อมูลแล้วแสดงกล่องแจ้งเตือน", async () => {
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: [], total: 0 }),
      }));

      await gotoApplicationsPage(page);
      await expect(page.getByText("ยังไม่มีข้อมูลสวนยาง")).toBeVisible();
      await expect(
        page.getByText("กรุณาลงทะเบียนสวนยางเพื่อยื่นขอรับรอง"),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ลงทะเบียนสวนยาง" }),
      ).toBeVisible();
    });

    test("TC-006: ปุ่ม “ลงทะเบียนสวนยาง” ไปหน้า New", async () => {
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: [], total: 0 }),
      }));

      await gotoApplicationsPage(page);
      const registerButton = page.getByRole("button", {
        name: "ลงทะเบียนสวนยาง",
      });
      await expect(registerButton).toBeVisible();

      // Avoid any late/interrupted interceptions during navigation.
      await page.unroute("**/api/v1/rubber-farms**");

      await Promise.all([
        page.waitForURL(/\/farmer\/applications\/new/, { timeout: 20000 }),
        registerButton.click({ force: true }),
      ]);
      await expect(page).toHaveURL(/\/farmer\/applications\/new/);
    });

    test("TC-007: Empty state ไม่แสดงตาราง", async () => {
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: [], total: 0 }),
      }));

      await gotoApplicationsPage(page);
      await expect(getApplicationsTable(page)).toHaveCount(0);
    });

    test("TC-008: มีข้อมูลแล้วแสดง DataTable", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 12,
          farmId: formatFarmId(12),
          location: "สถานที่ A",
          villageName: "บ้าน A",
          moo: 1,
          province: "สงขลา",
          district: "เมืองสงขลา",
          subDistrict: "บ่อยาง",
          inspection: buildInspection({
            rubberFarmId: 12,
            inspectionDateAndTime: "2025-12-01T00:00:00+07:00",
            inspectionStatus: "รอการตรวจประเมิน",
          }),
        }),
        buildFarm({
          rubberFarmId: 7,
          farmId: null,
          location: null,
          villageName: "บ้าน B",
          moo: 2,
          province: "กรุงเทพมหานคร",
          district: "เขตบางรัก",
          subDistrict: "สีลม",
          inspection: buildInspection({
            rubberFarmId: 7,
            inspectionDateAndTime: null,
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ผ่าน",
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms, total: farms.length }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table).toBeVisible();
      await expect(table.locator("tbody tr")).toHaveCount(2);
    });

    test("TC-009: แสดงคอลัมน์หลักครบถ้วน", async () => {
      const farms = [buildFarm({ rubberFarmId: 1, farmId: formatFarmId(1) })];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(
        table.getByRole("columnheader", { name: "รหัสสวน" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "สถานที่" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "จังหวัด" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "อำเภอ" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "ตำบล" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "กำหนดการตรวจประเมิน" }),
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "สถานะ" }),
      ).toBeVisible();
      await page.waitForTimeout(3000);
    });

    test("TC-010: แสดงรหัสสวนจาก `farmId` เมื่อมีค่า", async () => {
      const farms = [buildFarm({ rubberFarmId: 12, farmId: formatFarmId(12) })];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="รหัสสวน"]')).toContainText(
        "RF00012",
      );
    });

    test("TC-011: แสดงรหัสสวนจาก `rubberFarmId` เมื่อไม่มี `farmId`", async () => {
      const farms = [buildFarm({ rubberFarmId: 7, farmId: null })];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="รหัสสวน"]')).toContainText(
        "RF00007",
      );
    });

    test("TC-012: แสดงสถานที่จาก `location` เมื่อมีค่า", async () => {
      const farms = [
        buildFarm({ rubberFarmId: 1, location: "หมู่บ้านทดสอบ 1 หมู่ 1" }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานที่"]')).toContainText(
        "หมู่บ้านทดสอบ 1 หมู่ 1",
      );
    });

    test("TC-013: แสดงสถานที่ fallback เป็น “หมู่บ้าน … หมู่ …”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          location: null,
          villageName: "บ้าน B",
          moo: 2,
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานที่"]')).toContainText(
        "บ้าน B หมู่ 2",
      );
    });

    test("TC-014: แสดงกำหนดการตรวจประเมินเป็น “-” เมื่อไม่มี", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionDateAndTime: null,
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(
        table.locator('td[data-label="กำหนดการตรวจประเมิน"]'),
      ).toContainText("-");
    });

    test("TC-015: แสดงกำหนดการตรวจประเมินเป็นวันที่ภาษาไทย", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionDateAndTime: "2025-12-01T00:00:00+07:00",
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator("tbody tr")).toHaveCount(1, {
        timeout: 10000,
      });
      await expect(
        table.locator('td[data-label="กำหนดการตรวจประเมิน"]').first(),
      ).toContainText("1 ธันวาคม 2568");
    });

    test("TC-016: สถานะ “รอกำหนดวันตรวจประเมิน”", async () => {
      const farms = [buildFarm({ rubberFarmId: 1, inspection: null })];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "รอกำหนดวันตรวจประเมิน",
      );
    });

    test("TC-017: สถานะ “รอการตรวจประเมิน”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "รอการตรวจประเมิน",
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "รอการตรวจประเมิน",
      );
    });

    test("TC-018: สถานะ “ตรวจประเมินแล้ว รอสรุปผล”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "รอผลการตรวจประเมิน",
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "ตรวจประเมินแล้ว รอสรุปผล",
      );
    });

    test("TC-019: สถานะ “ผ่านการรับรอง”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ผ่าน",
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "ผ่านการรับรอง",
      );
    });

    test("TC-020: สถานะ “ไม่ผ่านการรับรอง”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
          }),
        }),
      ];
      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "ไม่ผ่านการรับรอง",
      );
    });

    test("TC-021: แสดง paginator เมื่อมีหลายรายการ", async () => {
      const total = 11;
      const farms = Array.from({ length: 10 }, (_, i) =>
        buildFarm({ rubberFarmId: i + 1, farmId: formatFarmId(i + 1) }),
      );

      await mockRubberFarmsApi(page, async ({ offset, limit }) => ({
        body: buildPagedResponse({ results: farms, offset, limit, total }),
      }));

      await gotoApplicationsPage(page);
      const paginator = getApplicationsTable(page)
        .locator(".p-paginator")
        .first();
      await paginator.scrollIntoViewIfNeeded();
      await expect(paginator).toBeVisible();
      const page2Button = paginator.getByRole("button", { name: "2" });
      await page2Button.scrollIntoViewIfNeeded();
      await expect(page2Button).toBeVisible();
    });

    test("TC-022: เปลี่ยนหน้า pagination", async () => {
      const total = 20;
      const all = Array.from({ length: total }, (_, i) =>
        buildFarm({ rubberFarmId: i + 1, farmId: formatFarmId(i + 1) }),
      );

      await mockRubberFarmsApi(page, async ({ offset, limit }) => {
        const results = all.slice(offset, offset + limit);
        return { body: buildPagedResponse({ results, offset, limit, total }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);

      await expect(
        table.locator('td[data-label="รหัสสวน"]').first(),
      ).toContainText("RF00001");

      const page2Button = table.locator(".p-paginator").getByRole("button", {
        name: "2",
      });
      await Promise.all([
        page.waitForRequest((req) => {
          if (!req.url().includes("/api/v1/rubber-farms")) return false;
          const url = new URL(req.url());
          return url.searchParams.get("offset") === "10";
        }),
        page2Button.click(),
      ]);

      await expect(
        table.locator('td[data-label="รหัสสวน"]').first(),
      ).toContainText("RF00011");
    });

    test("TC-023: เปลี่ยนจำนวนรายการต่อหน้าเป็น 25", async () => {
      const total = 60;
      const all = Array.from({ length: total }, (_, i) =>
        buildFarm({ rubberFarmId: i + 1, farmId: formatFarmId(i + 1) }),
      );

      await mockRubberFarmsApi(page, async ({ offset, limit }) => {
        const results = all.slice(offset, offset + limit);
        return { body: buildPagedResponse({ results, offset, limit, total }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      const paginator = table.locator(".p-paginator").first();

      const rowsPerPageDropdown = paginator.locator(".p-dropdown").first();
      await rowsPerPageDropdown.scrollIntoViewIfNeeded();
      await expect(rowsPerPageDropdown).toBeVisible();
      await rowsPerPageDropdown.click();

      const dropdownPanel = page.locator(".p-dropdown-panel").first();
      await expect(dropdownPanel).toBeVisible();

      const option25 = dropdownPanel
        .locator(".p-dropdown-items li", { hasText: "25" })
        .first();
      await option25.scrollIntoViewIfNeeded();
      await expect(option25).toBeVisible();
      await option25.click();

      await expect(table.locator("tbody tr")).toHaveCount(25, {
        timeout: 20000,
      });
      await expect(
        paginator.locator(
          "text=/แสดง\\s+1\\s+ถึง\\s+25\\s+จาก\\s+60\\s+รายการ/",
        ),
      ).toBeVisible();
    });

    test("TC-024: เปลี่ยนจำนวนรายการต่อหน้าเป็น 50", async () => {
      const total = 60;
      const all = Array.from({ length: total }, (_, i) =>
        buildFarm({ rubberFarmId: i + 1, farmId: formatFarmId(i + 1) }),
      );

      await mockRubberFarmsApi(page, async ({ offset, limit }) => {
        const results = all.slice(offset, offset + limit);
        return { body: buildPagedResponse({ results, offset, limit, total }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      const paginator = table.locator(".p-paginator").first();

      const rowsPerPageDropdown = paginator.locator(".p-dropdown").first();
      await rowsPerPageDropdown.scrollIntoViewIfNeeded();
      await expect(rowsPerPageDropdown).toBeVisible();
      await rowsPerPageDropdown.click();

      const dropdownPanel = page.locator(".p-dropdown-panel").first();
      await expect(dropdownPanel).toBeVisible();

      const option50 = dropdownPanel
        .locator(".p-dropdown-items li", { hasText: "50" })
        .first();
      await option50.scrollIntoViewIfNeeded();
      await expect(option50).toBeVisible();
      await option50.click();

      await expect(table.locator("tbody tr")).toHaveCount(50, {
        timeout: 20000,
      });
      await expect(
        paginator.locator(
          "text=/แสดง\\s+1\\s+ถึง\\s+50\\s+จาก\\s+60\\s+รายการ/",
        ),
      ).toBeVisible();
    });

    test("TC-025: เรียงลำดับตาม “รหัสสวน” (ascending)", async () => {
      const base = [
        buildFarm({ rubberFarmId: 3, farmId: formatFarmId(3) }),
        buildFarm({ rubberFarmId: 1, farmId: formatFarmId(1) }),
        buildFarm({ rubberFarmId: 2, farmId: formatFarmId(2) }),
      ];

      await mockRubberFarmsApi(page, async ({ multiSortMeta }) => {
        const meta = Array.isArray(multiSortMeta) ? multiSortMeta[0] : null;
        const results = base.slice();
        if (meta?.field === "rubberFarmId" && meta?.order === 1) {
          results.sort((a, b) => a.rubberFarmId - b.rubberFarmId);
        }
        return { body: buildPagedResponse({ results }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);

      await expect(
        table.locator('td[data-label="รหัสสวน"]').first(),
      ).toContainText("RF00003");

      const header = table.locator("th", { hasText: "รหัสสวน" }).first();
      await header.click();

      await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
      await expect(
        table.locator('td[data-label="รหัสสวน"]').first(),
      ).toContainText("RF00001");
    });

    test("TC-026: เรียงลำดับตาม “รหัสสวน” (descending)", async () => {
      const base = [
        buildFarm({ rubberFarmId: 1, farmId: formatFarmId(1) }),
        buildFarm({ rubberFarmId: 3, farmId: formatFarmId(3) }),
        buildFarm({ rubberFarmId: 2, farmId: formatFarmId(2) }),
      ];

      await mockRubberFarmsApi(page, async ({ multiSortMeta }) => {
        const meta = Array.isArray(multiSortMeta) ? multiSortMeta[0] : null;
        const results = base.slice();
        if (meta?.field === "rubberFarmId" && meta?.order === 1) {
          results.sort((a, b) => a.rubberFarmId - b.rubberFarmId);
        } else if (meta?.field === "rubberFarmId" && meta?.order === -1) {
          results.sort((a, b) => b.rubberFarmId - a.rubberFarmId);
        }
        return { body: buildPagedResponse({ results }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      const header = table.locator("th", { hasText: "รหัสสวน" }).first();

      await header.click();
      await header.click();

      await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
      await expect(
        table.locator('td[data-label="รหัสสวน"]').first(),
      ).toContainText("RF00003");
    });

    test("TC-027: เรียงลำดับตาม “จังหวัด”", async () => {
      const base = [
        buildFarm({ rubberFarmId: 1, farmId: formatFarmId(1), province: "สงขลา" }),
        buildFarm({
          rubberFarmId: 2,
          farmId: formatFarmId(2),
          province: "กรุงเทพมหานคร",
        }),
        buildFarm({ rubberFarmId: 3, farmId: formatFarmId(3), province: "เชียงใหม่" }),
      ];

      await mockRubberFarmsApi(page, async ({ multiSortMeta }) => {
        const meta = Array.isArray(multiSortMeta) ? multiSortMeta[0] : null;
        const results = base.slice();
        if (meta?.field === "province" && meta?.order === 1) {
          results.sort((a, b) => a.province.localeCompare(b.province, "th"));
        }
        return { body: buildPagedResponse({ results }) };
      });

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);

      const header = table.locator("th", { hasText: "จังหวัด" }).first();
      await header.click();

      await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
      await expect(
        table.locator('td[data-label="จังหวัด"]').first(),
      ).toContainText("กรุงเทพมหานคร");
    });

    test("TC-028: แสดงปุ่มดูรายละเอียด (ไอคอนตา) ในทุกแถว", async () => {
      const farms = [
        buildFarm({ rubberFarmId: 1, farmId: formatFarmId(1) }),
        buildFarm({ rubberFarmId: 2, farmId: formatFarmId(2) }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      await expect(table.locator("tbody tr")).toHaveCount(2);
      await expect(table.locator("tbody tr button:has(.pi-eye)")).toHaveCount(
        2,
      );
    });

    test("TC-029: ปุ่มดูรายละเอียด disabled เมื่อไม่มีข้อมูลคำแนะนำ/ข้อบกพร่อง", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "รอการตรวจประเมิน",
            adviceAndDefect: null,
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      const row = table
        .locator("tbody tr", { hasText: "RF00001" })
        .first();
      const eyeButton = row.locator("button:has(.pi-eye)").first();
      await expect(eyeButton).toBeDisabled();

      await expect(page.getByRole("dialog")).toHaveCount(0);
    });

    test("TC-030: ปุ่มดูรายละเอียด enabled เมื่อมีข้อมูลคำแนะนำ/ข้อบกพร่อง", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const table = getApplicationsTable(page);
      const row = table.locator("tbody tr", { hasText: "RF00001" }).first();
      const eyeButton = row.locator("button:has(.pi-eye)").first();
      await expect(eyeButton).toBeEnabled();
    });

    test("TC-031: กดปุ่ม eye แล้วเปิด dialog สำเร็จ", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      const row = getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first();
      await row.locator("button:has(.pi-eye)").first().click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByText("ข้อมูลการให้คำปรึกษาและข้อบกพร่อง"),
      ).toBeVisible();
    });

    test("TC-032: แสดงส่วน “ข้อมูลการตรวจประเมิน” ใน dialog", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(999),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("ข้อมูลการตรวจประเมิน")).toBeVisible();
      await expect(dialog.getByText("รหัสการตรวจ:")).toBeVisible();
      await expect(dialog.getByText("2025050999")).toBeVisible();
      await expect(dialog.getByText("วันที่บันทึก:")).toBeVisible();
      await expect(dialog.getByText("1 ธันวาคม 2568")).toBeVisible();
    });

    test("TC-033: มีรายการให้คำปรึกษาแล้วแสดงการ์ดรายการ", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
              adviceList: [
                {
                  adviceItem: "ปรับปรุงการใส่ปุ๋ย",
                  recommendation: "ใส่ปุ๋ยอินทรีย์",
                  time: "2025-12-15T00:00:00+07:00",
                },
              ],
              defectList: [],
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(
        dialog.getByRole("heading", { name: "รายการให้คำปรึกษา" }),
      ).toBeVisible();
      await expect(dialog.getByText("ปรับปรุงการใส่ปุ๋ย")).toBeVisible();
      await expect(dialog.getByText("ใส่ปุ๋ยอินทรีย์")).toBeVisible();
      await expect(dialog.getByText("15 ธันวาคม 2568")).toBeVisible();
    });

    test("TC-034: ไม่มีรายการให้คำปรึกษาแล้วแสดงข้อความ “ไม่มีรายการให้คำปรึกษา”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
              adviceList: [],
              defectList: [],
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("ไม่มีรายการให้คำปรึกษา")).toBeVisible();
    });

    test("TC-035: มีข้อบกพร่องแล้วแสดงการ์ดข้อบกพร่อง", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
              adviceList: [],
              defectList: [
                {
                  defectItem: "พบโรคใบจุด",
                  defectDetail: "รายละเอียดโรคใบจุด",
                  time: "2025-12-20T00:00:00+07:00",
                },
              ],
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(
        dialog.getByRole("heading", { name: "ข้อบกพร่อง" }),
      ).toBeVisible();
      await expect(dialog.getByText("พบโรคใบจุด")).toBeVisible();
      await expect(dialog.getByText("รายละเอียดโรคใบจุด")).toBeVisible();
      await expect(dialog.getByText("20 ธันวาคม 2568")).toBeVisible();
    });

    test("TC-036: ไม่มีข้อบกพร่องแล้วแสดงข้อความ “ไม่มีข้อบกพร่อง”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
              adviceList: [],
              defectList: [],
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("ไม่มีข้อบกพร่อง")).toBeVisible();
    });

    test("TC-037: ปิด dialog ด้วยปุ่ม “ปิด”", async () => {
      const farms = [
        buildFarm({
          rubberFarmId: 1,
          farmId: formatFarmId(1),
          inspection: buildInspection({
            rubberFarmId: 1,
            inspectionNo: inspectionNoFromSequence(1),
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: "ไม่ผ่าน",
            adviceAndDefect: buildAdviceAndDefect({
              adviceAndDefectId: 1,
              date: "2025-12-01T00:00:00+07:00",
            }),
          }),
        }),
      ];

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: farms }),
      }));

      await gotoApplicationsPage(page);
      await getApplicationsTable(page)
        .locator("tbody tr", { hasText: "RF00001" })
        .first()
        .locator("button:has(.pi-eye)")
        .first()
        .click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog
        .locator(".p-dialog-footer")
        .getByRole("button", { name: "ปิด" })
        .click();
      await expect(dialog).toBeHidden();
    });

    test("TC-038: แสดงผลได้บน mobile viewport (smoke)", async () => {
      await page.setViewportSize({ width: 390, height: 844 });

      await mockRubberFarmsApi(page, async () => ({
        body: buildPagedResponse({ results: [], total: 0 }),
      }));

      await gotoApplicationsPage(page);
      await expect(
        page.getByRole("heading", { name: "ติดตามสถานะการรับรอง" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ลงทะเบียนสวนยาง" }),
      ).toBeVisible();
    });
  });
});
