// tests/farmerApplicationsCancel/farmerApplicationsCancel.spec.js (Playwright E2E Tests)
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
  await Promise.all([
    page.waitForURL(/\/farmer/, {
      timeout: 40000,
      waitUntil: "domcontentloaded",
    }),
    page.getByRole("button", { name: "เข้าสู่ระบบ" }).click(),
  ]);
}

function getTable(page) {
  return page.locator(".primary-datatable-wrapper");
}

function getStepNextButton(page) {
  // Avoid collision with paginator "ถัดไป".
  return page
    .locator("div.mt-4.flex.justify-end.gap-2")
    .getByRole("button", { name: "ถัดไป" });
}

async function gotoCancelPage(page) {
  await page.goto("/farmer/applications/cancel", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: "ขอยกเลิกใบรับรองแหล่งผลิต" })
  ).toBeVisible({ timeout: 10000 });
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

function buildCertificate({
  certificateId,
  activeFlag = true,
  cancelRequestFlag = false,
  cancelRequestDetail = "",
  version = 1,
  effectiveDate = "2025-12-01T00:00:00+07:00",
  expiryDate = "2026-12-01T00:00:00+07:00",
  inspection = null,
} = {}) {
  return {
    certificateId,
    activeFlag,
    cancelRequestFlag,
    cancelRequestDetail,
    version,
    effectiveDate,
    expiryDate,
    inspection,
  };
}

function buildInspection({
  inspectionNo = "INSP-0001",
  inspectionDateAndTime = "2025-11-15T10:00:00+07:00",
  rubberFarm = {},
} = {}) {
  return {
    inspectionNo,
    inspectionDateAndTime,
    rubberFarm: {
      villageName: "บ้านทดสอบ",
      subDistrict: "บ่อยาง",
      district: "เมืองสงขลา",
      province: "สงขลา",
      ...rubberFarm,
    },
  };
}

async function mockRevokeList(page, handler) {
  await page.route(
    "**/api/v1/certificates/revoke-list-for-farmer**",
    async (route) => {
      const url = new URL(route.request().url());
      const offset = Number(url.searchParams.get("offset") ?? "0");
      const limit = Number(url.searchParams.get("limit") ?? "10");

      const response = await handler({ url, offset, limit, route });
      const status = response?.status ?? 200;
      const body =
        typeof response?.body === "string"
          ? response.body
          : JSON.stringify(response?.body ?? {});

      await route.fulfill({ status, contentType: "application/json", body });
    }
  );
}

async function mockFilesApi(page, handler) {
  await page.route("**/api/v1/files/get-files**", async (route) => {
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

async function mockEditCancelRequestDetail(page, handler) {
  await page.route(
    "**/api/v1/certificates/edit-cancel-request-detail",
    async (route) => {
      const request = route.request();
      const postData = request.postData();
      let json = null;
      try {
        json = postData ? JSON.parse(postData) : null;
      } catch {
        json = null;
      }
      const response = await handler({ request, json, route });
      const status = response?.status ?? 200;
      const body =
        typeof response?.body === "string"
          ? response.body
          : JSON.stringify(response?.body ?? {});
      await route.fulfill({ status, contentType: "application/json", body });
    }
  );
}

async function installWindowOpenSpy(page) {
  await page.addInitScript(() => {
    window.__openedUrls = [];
    window.open = (url) => {
      window.__openedUrls.push(String(url ?? ""));
      return { focus: () => {} };
    };
  });
}

async function pickCalendarDay(page, calendarId, dayIndex = 0) {
  const calendarRoot = page.locator(`#${calendarId}`);
  // PrimeReact Calendar renders a button (icon) and a panel `.p-datepicker`.
  await calendarRoot.locator("button").click();
  const picker = page.locator(".p-datepicker").first();
  await expect(picker).toBeVisible();

  const day = picker.locator("td span:not(.p-disabled)").nth(dayIndex);
  await day.click();
  await expect(picker).toBeHidden();
}

test.describe("Farmer Applications Cancel — ขอยกเลิกใบรับรองแหล่งผลิต", () => {
  test("TC-001: ไม่ได้ login แล้วเข้าหน้า cancel", async ({ page }) => {
    await page.goto("/farmer/applications/cancel", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 10000,
    });
    await expect(page).toHaveURL((url) => new URL(url).pathname === "/");
  });

  test.describe("Authenticated", () => {
    test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await page.unroute("**/api/v1/certificates/revoke-list-for-farmer**");
      await page.unroute("**/api/v1/files/get-files**");
      await page.unroute("**/api/v1/certificates/edit-cancel-request-detail");
      await loginAsFarmer(page);
    });

    test("TC-002: แสดงหัวข้อ/คำอธิบาย/StepIndicator", async ({ page }) => {
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: [] }),
      }));

      await gotoCancelPage(page);
      await expect(
        page.getByText("ขอยกเลิกใบรับรองแหล่งผลิตที่ไม่ประสงค์จะรับรองต่อ")
      ).toBeVisible();
      await expect(
        page.getByText("เลือกใบรับรอง", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText("ขอยกเลิกใบรับรอง", { exact: true })
      ).toBeVisible();
    });

    test("TC-003: ค่าเริ่มต้นอยู่ Step 1", async ({ page }) => {
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: [] }),
      }));

      await gotoCancelPage(page);
      await expect(page.getByText("วันที่มีผล (จาก)")).toBeVisible();
      await expect(page.getByText("วันที่หมดอายุ (ถึง)")).toBeVisible();
      await expect(page.getByRole("button", { name: "ค้นหา" })).toBeVisible();
      await expect(page.getByRole("button", { name: "ล้างค่า" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ใบรับรองทั้งหมด" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" })
      ).toBeVisible();

      await expect(page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง")).toHaveCount(
        0
      );
      await expect(page.locator("#cancelRequestDetail")).toHaveCount(0);
    });

    test("TC-004: แสดง loading ระหว่างดึงข้อมูล", async ({ page }) => {
      await mockRevokeList(page, async () => {
        await new Promise((r) => setTimeout(r, 1200));
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      const table = getTable(page);
      await expect(table).toBeVisible();
      await expect(table.locator(".p-datatable-loading-overlay")).toBeVisible();
    });

    test("TC-005: ไม่มีรายการใบรับรอง", async ({ page }) => {
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: [], total: 0 }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await expect(table).toBeVisible();
      await expect(table.getByText("ไม่พบข้อมูล")).toBeVisible();
    });

    test("TC-006: แสดงคอลัมน์หลักครบถ้วน (แท็บ “ใบรับรองทั้งหมด”)", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 1001,
          inspection: buildInspection({ inspectionNo: "INSP-1001" }),
        }),
      ];

      await mockRevokeList(page, async ({ offset, limit }) => ({
        body: buildPagedResponse({
          results: certs.slice(offset, offset + limit),
          offset,
          limit,
          total: certs.length,
        }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);

      await expect(
        table.getByRole("columnheader", { name: "รหัสใบรับรอง" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "รหัสการตรวจ" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "วันที่ตรวจ" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "สถานที่" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "วันที่มีผล" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "วันที่หมดอายุ" })
      ).toBeVisible();

      await expect(table.locator("tbody tr")).toHaveCount(1);
      await expect(table.locator("tbody tr button:has(.pi-eye)")).toHaveCount(
        1
      );
    });

    test("TC-007: แสดง “-” เมื่อไม่มีข้อมูล inspection", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 1002,
          inspection: null,
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await expect(table.locator("tbody tr")).toHaveCount(1);

      await expect(table.locator('td[data-label="รหัสการตรวจ"]')).toContainText(
        "-"
      );
      await expect(table.locator('td[data-label="วันที่ตรวจ"]')).toContainText(
        "-"
      );
      await expect(table.locator('td[data-label="สถานที่"]')).toContainText(
        "-"
      );
    });

    test("TC-008: กด “ค้นหา” หลังเลือกวันที่", async ({ page }) => {
      let lastUrl = null;
      await mockRevokeList(page, async ({ url }) => {
        lastUrl = url;
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);

      await pickCalendarDay(page, "fromDate", 0);
      await pickCalendarDay(page, "toDate", 1);

      await page.getByRole("button", { name: "ค้นหา" }).click();

      await expect.poll(() => String(lastUrl)).toContain("fromDate=");
      await expect.poll(() => String(lastUrl)).toContain("toDate=");
    });

    test("TC-009: กด “ล้างค่า” รีเซ็ตตัวกรอง", async ({ page }) => {
      const seen = [];
      await mockRevokeList(page, async ({ url }) => {
        seen.push(url);
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await pickCalendarDay(page, "fromDate", 0);
      await pickCalendarDay(page, "toDate", 1);
      await page.getByRole("button", { name: "ค้นหา" }).click();

      await expect.poll(() => seen.length).toBeGreaterThanOrEqual(2);
      await expect
        .poll(() => seen.at(-1)?.searchParams.has("fromDate"))
        .toBe(true);
      await expect
        .poll(() => seen.at(-1)?.searchParams.has("toDate"))
        .toBe(true);

      await page.getByRole("button", { name: "ล้างค่า" }).click();

      await expect(page.locator("#fromDate input")).toHaveValue("");
      await expect(page.locator("#toDate input")).toHaveValue("");

      await expect
        .poll(() => seen.at(-1)?.searchParams.has("fromDate"))
        .toBe(false);
      await expect
        .poll(() => seen.at(-1)?.searchParams.has("toDate"))
        .toBe(false);
    });

    test("TC-010: เปลี่ยนแท็บเป็น “ใบรับรองที่ขอยกเลิก”", async ({ page }) => {
      let lastUrl;
      await mockRevokeList(page, async ({ url }) => {
        lastUrl = url;
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();

      await expect
        .poll(() => String(lastUrl))
        .toContain("cancelRequestFlag=true");
      await expect.poll(() => String(lastUrl)).not.toContain("activeFlag=");
    });

    test("TC-011: แสดงสถานะ “ยื่นขอยกเลิกแล้ว”", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 2001,
          cancelRequestFlag: true,
          activeFlag: true,
          inspection: buildInspection({ inspectionNo: "INSP-2001" }),
        }),
      ];

      await mockRevokeList(page, async ({ url }) => {
        // Only return data for cancel-request tab.
        if (url.searchParams.get("cancelRequestFlag") === "true") {
          return { body: buildPagedResponse({ results: certs }) };
        }
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();

      const table = getTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "ยื่นขอยกเลิกแล้ว"
      );
    });

    test("TC-012: แสดงสถานะ “ยกเลิกใบรับรองแล้ว”", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 2002,
          cancelRequestFlag: true,
          activeFlag: false,
          inspection: buildInspection({ inspectionNo: "INSP-2002" }),
        }),
      ];

      await mockRevokeList(page, async ({ url }) => {
        if (url.searchParams.get("cancelRequestFlag") === "true") {
          return { body: buildPagedResponse({ results: certs }) };
        }
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();

      const table = getTable(page);
      await expect(table.locator('td[data-label="สถานะ"]')).toContainText(
        "ยกเลิกใบรับรองแล้ว"
      );
    });

    test("TC-013: แท็บ “ใบรับรองที่ขอยกเลิก” ไม่มีปุ่ม “ถัดไป”", async ({
      page,
    }) => {
      await mockRevokeList(page, async ({ url }) => {
        if (url.searchParams.get("cancelRequestFlag") === "true") {
          return { body: buildPagedResponse({ results: [] }) };
        }
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();

      // Wait for the cancel-request tab UI to render (it shows "สถานะ" column instead of actions).
      await expect(
        getTable(page).getByRole("columnheader", { name: "สถานะ" })
      ).toBeVisible();
      await expect(getStepNextButton(page)).toHaveCount(0);
    });

    test("TC-014: เปลี่ยนกลับแท็บ “ใบรับรองทั้งหมด”", async ({ page }) => {
      let lastUrl;
      await mockRevokeList(page, async ({ url }) => {
        lastUrl = url;
        return { body: buildPagedResponse({ results: [] }) };
      });

      await gotoCancelPage(page);
      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();
      await page.getByRole("button", { name: "ใบรับรองทั้งหมด" }).click();

      await expect.poll(() => String(lastUrl)).toContain("activeFlag=true");
      await expect
        .poll(() => String(lastUrl))
        .toContain("cancelRequestFlag=false");
    });

    test("TC-015: ไม่เลือกใบรับรองแล้วปุ่ม “ถัดไป” disabled", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 3001,
          inspection: buildInspection({ inspectionNo: "INSP-3001" }),
        }),
      ];
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const nextButton = getStepNextButton(page);
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeDisabled();
    });

    test("TC-016: เลือกใบรับรองโดยคลิกที่แถว", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 3002,
          inspection: buildInspection({ inspectionNo: "INSP-3002" }),
        }),
      ];
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      const row = table.locator("tbody tr").first();
      await row.click();

      await expect(row).toHaveClass(/bg-green-50/);
      await expect(getStepNextButton(page)).toBeEnabled();
    });

    test("TC-017: เลือกใบรับรองอื่นแทน", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 3003,
          inspection: buildInspection({ inspectionNo: "INSP-3003" }),
        }),
        buildCertificate({
          certificateId: 3004,
          inspection: buildInspection({ inspectionNo: "INSP-3004" }),
        }),
      ];
      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      const row1 = table.locator("tbody tr").nth(0);
      const row2 = table.locator("tbody tr").nth(1);

      await row1.click();
      await expect(row1).toHaveClass(/bg-green-50/);
      await row2.click();
      await expect(row2).toHaveClass(/bg-green-50/);
      await expect(row1).not.toHaveClass(/bg-green-50/);
    });

    test("TC-018: เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
      const total = 60;
      const all = Array.from({ length: total }, (_, i) =>
        buildCertificate({
          certificateId: 4000 + i + 1,
          inspection: buildInspection({ inspectionNo: `INSP-${4000 + i + 1}` }),
        })
      );

      await mockRevokeList(page, async ({ offset, limit }) => {
        const results = all.slice(offset, offset + limit);
        return { body: buildPagedResponse({ results, offset, limit, total }) };
      });

      await gotoCancelPage(page);

      const table = getTable(page);
      await expect(table.locator("tbody tr")).toHaveCount(10);

      const paginator = table.locator(".p-paginator").first();
      const rowsPerPageDropdown = paginator.locator(".p-dropdown").first();
      await rowsPerPageDropdown.click();
      const dropdownPanel = page.locator(".p-dropdown-panel").first();
      await expect(dropdownPanel).toBeVisible();
      await dropdownPanel
        .locator(".p-dropdown-items li", { hasText: "25" })
        .first()
        .click();

      await expect(table.locator("tbody tr")).toHaveCount(25, {
        timeout: 20000,
      });
    });

    test("TC-019: เปลี่ยนหน้า pagination", async ({ page }) => {
      const total = 20;
      const all = Array.from({ length: total }, (_, i) =>
        buildCertificate({
          certificateId: 5000 + i + 1,
          inspection: buildInspection({ inspectionNo: `INSP-${5000 + i + 1}` }),
        })
      );

      await mockRevokeList(page, async ({ offset, limit }) => {
        const results = all.slice(offset, offset + limit);
        return { body: buildPagedResponse({ results, offset, limit, total }) };
      });

      await gotoCancelPage(page);
      const table = getTable(page);

      await expect(
        table.locator('td[data-label="รหัสใบรับรอง"]').first()
      ).toContainText("5001");

      await table
        .locator(".p-paginator")
        .getByRole("button", { name: "2" })
        .click();

      await expect(
        table.locator('td[data-label="รหัสใบรับรอง"]').first()
      ).toContainText("5011");
    });

    test("TC-020: Sorting ตาม “รหัสใบรับรอง”", async ({ page }) => {
      const base = [
        buildCertificate({
          certificateId: 6003,
          inspection: buildInspection(),
        }),
        buildCertificate({
          certificateId: 6001,
          inspection: buildInspection(),
        }),
        buildCertificate({
          certificateId: 6002,
          inspection: buildInspection(),
        }),
      ];

      await mockRevokeList(page, async ({ url }) => {
        let results = base.slice();
        const multiSortMetaRaw = url.searchParams.get("multiSortMeta");
        if (multiSortMetaRaw) {
          try {
            const meta = (JSON.parse(multiSortMetaRaw) || [])[0];
            if (meta?.field === "certificateId" && meta?.order === 1) {
              results.sort((a, b) => a.certificateId - b.certificateId);
            } else if (meta?.field === "certificateId" && meta?.order === -1) {
              results.sort((a, b) => b.certificateId - a.certificateId);
            }
          } catch {
            // ignore
          }
        }
        return { body: buildPagedResponse({ results }) };
      });

      await gotoCancelPage(page);
      const table = getTable(page);
      await expect(
        table.locator('td[data-label="รหัสใบรับรอง"]').first()
      ).toContainText("6003");

      const header = table.locator("th", { hasText: "รหัสใบรับรอง" }).first();
      await header.click();

      await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
      await expect(
        table.locator('td[data-label="รหัสใบรับรอง"]').first()
      ).toContainText("6001");
    });

    test("TC-021: เปลี่ยนแท็บแล้ว selection ถูกล้าง", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 7001,
          inspection: buildInspection({ inspectionNo: "INSP-7001" }),
        }),
        buildCertificate({
          certificateId: 7002,
          inspection: buildInspection({ inspectionNo: "INSP-7002" }),
        }),
      ];

      await mockRevokeList(page, async ({ url }) => {
        if (url.searchParams.get("cancelRequestFlag") === "true") {
          return { body: buildPagedResponse({ results: [] }) };
        }
        return { body: buildPagedResponse({ results: certs }) };
      });

      await gotoCancelPage(page);
      const table = getTable(page);
      const row1 = table.locator("tbody tr").first();
      await row1.click();
      await expect(row1).toHaveClass(/bg-green-50/);
      await expect(getStepNextButton(page)).toBeEnabled();

      await page.getByRole("button", { name: "ใบรับรองที่ขอยกเลิก" }).click();
      await page.getByRole("button", { name: "ใบรับรองทั้งหมด" }).click();

      await expect(getStepNextButton(page)).toBeDisabled();
      await expect(table.locator("tbody tr.bg-green-50")).toHaveCount(0);
    });

    test("TC-022: กดปุ่ม eye แล้วเปิดไฟล์ได้", async ({ page }) => {
      await installWindowOpenSpy(page);

      const certs = [
        buildCertificate({
          certificateId: 8001,
          inspection: buildInspection({ inspectionNo: "INSP-8001" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockFilesApi(page, async ({ url }) => {
        if (url.searchParams.get("idReference") === "8001") {
          return {
            body: {
              files: [{ url: "https://example.com/certificate-8001.pdf" }],
            },
          };
        }
        return { body: { files: [] } };
      });

      await gotoCancelPage(page);
      const table = getTable(page);
      await table.locator("tbody tr button:has(.pi-eye)").first().click();

      await expect
        .poll(async () => {
          return await page.evaluate(() => window.__openedUrls?.length || 0);
        })
        .toBeGreaterThan(0);

      await expect
        .poll(async () => {
          const urls = await page.evaluate(() => window.__openedUrls || []);
          return urls[0] || "";
        })
        .toContain("certificate-8001.pdf");
    });

    test("TC-023: กดปุ่ม eye แต่ไม่มีไฟล์", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 8002,
          inspection: buildInspection({ inspectionNo: "INSP-8002" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockFilesApi(page, async () => ({
        body: { files: [] },
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await table.locator("tbody tr button:has(.pi-eye)").first().click();

      await expect(page.getByText("ไม่พบไฟล์สำหรับใบรับรองนี้")).toBeVisible();
    });

    test("TC-024: กดปุ่ม eye แล้ว API error", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 8003,
          inspection: buildInspection({ inspectionNo: "INSP-8003" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockFilesApi(page, async () => ({
        status: 500,
        body: { message: "error" },
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await table.locator("tbody tr button:has(.pi-eye)").first().click();

      await expect(page.getByText("เกิดข้อผิดพลาดขณะดึงไฟล์")).toBeVisible();
    });

    test("TC-025: ไป Step 2 ได้เมื่อเลือกใบรับรอง", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 9001,
          inspection: buildInspection({ inspectionNo: "INSP-9001" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await table.locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await expect(
        page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง")
      ).toBeVisible();
      await expect(page.locator("#cancelRequestDetail")).toBeVisible();
    });

    test("TC-026: แสดงค่า prefill จาก `cancelRequestDetail`", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 9002,
          cancelRequestDetail: "รายละเอียดเดิม",
          inspection: buildInspection({ inspectionNo: "INSP-9002" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      const table = getTable(page);
      await table.locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await expect(page.locator("#cancelRequestDetail")).toHaveValue(
        "รายละเอียดเดิม"
      );
    });

    test("TC-027: ปุ่ม “บันทึกคำขอยกเลิก” disabled เมื่อว่าง", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 9003,
          cancelRequestDetail: "",
          inspection: buildInspection({ inspectionNo: "INSP-9003" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await expect(
        page.getByRole("button", { name: "บันทึกคำขอยกเลิก" })
      ).toBeDisabled();
    });

    test("TC-028: ปุ่ม “บันทึกคำขอยกเลิก” disabled เมื่อมีแต่ช่องว่าง", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 9004,
          cancelRequestDetail: "",
          inspection: buildInspection({ inspectionNo: "INSP-9004" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await page.locator("#cancelRequestDetail").fill("   ");
      await expect(
        page.getByRole("button", { name: "บันทึกคำขอยกเลิก" })
      ).toBeDisabled();
    });

    test("TC-029: จำกัดความยาว 255 ตัวอักษร", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 9005,
          cancelRequestDetail: "",
          inspection: buildInspection({ inspectionNo: "INSP-9005" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      const longText = "a".repeat(300);
      await page.locator("#cancelRequestDetail").fill(longText);
      const value = await page.locator("#cancelRequestDetail").inputValue();
      expect(value.length).toBe(255);
    });

    test("TC-030: บันทึกสำเร็จ", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 9200,
          cancelRequestDetail: "",
          version: 3,
          inspection: buildInspection({ inspectionNo: "INSP-9200" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockEditCancelRequestDetail(page, async ({ json }) => {
        // Basic payload sanity check
        if (json?.certificateId !== 9200) return { status: 400, body: {} };
        return { status: 200, body: { ok: true } };
      });

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await page.locator("#cancelRequestDetail").fill("ต้องการยกเลิกใบรับรอง");
      const saveButton = page.getByRole("button", { name: "บันทึกคำขอยกเลิก" });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      await expect(
        page.getByText("บันทึกคำขอยกเลิกเรียบร้อยแล้ว")
      ).toBeVisible();
      await expect(page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง")).toHaveCount(
        0
      );
      await expect(getStepNextButton(page)).toBeDisabled();
      await expect(getTable(page).locator("tbody tr.bg-green-50")).toHaveCount(
        0
      );
    });

    test("TC-031: บันทึกล้มเหลว (API error)", async ({ page }) => {
      const certs = [
        buildCertificate({
          certificateId: 9300,
          cancelRequestDetail: "",
          version: 1,
          inspection: buildInspection({ inspectionNo: "INSP-9300" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockEditCancelRequestDetail(page, async () => ({
        status: 500,
        body: { message: "error" },
      }));

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();

      await page.locator("#cancelRequestDetail").fill("ข้อความจะต้องยังอยู่");
      await page.getByRole("button", { name: "บันทึกคำขอยกเลิก" }).click();

      await expect(
        page.getByText("เกิดข้อผิดพลาดขณะบันทึกคำขอยกเลิก")
      ).toBeVisible();
      await expect(
        page.getByText("รายละเอียดคำขอยกเลิกใบรับรอง")
      ).toBeVisible();
      await expect(page.locator("#cancelRequestDetail")).toHaveValue(
        "ข้อความจะต้องยังอยู่"
      );
    });

    test("TC-032: หลังบันทึกสำเร็จ ปุ่ม “ถัดไป” กลับมา disabled", async ({
      page,
    }) => {
      const certs = [
        buildCertificate({
          certificateId: 9400,
          cancelRequestDetail: "",
          version: 1,
          inspection: buildInspection({ inspectionNo: "INSP-9400" }),
        }),
      ];

      await mockRevokeList(page, async () => ({
        body: buildPagedResponse({ results: certs }),
      }));

      await mockEditCancelRequestDetail(page, async () => ({
        status: 200,
        body: { ok: true },
      }));

      await gotoCancelPage(page);
      await getTable(page).locator("tbody tr").first().click();
      await getStepNextButton(page).click();
      await page.locator("#cancelRequestDetail").fill("ok");
      await page.getByRole("button", { name: "บันทึกคำขอยกเลิก" }).click();

      await expect(getStepNextButton(page)).toBeDisabled();
    });
  });
});
