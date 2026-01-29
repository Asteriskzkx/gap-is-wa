import { expect, test } from "@playwright/test";

const AUDITOR_USER = {
  email: process.env.E2E_TEST_AUDITOR_EMAIL,
  password: process.env.E2E_TEST_AUDITOR_PASSWORD,
};

const HAS_AUDITOR_CREDS = Boolean(AUDITOR_USER.email && AUDITOR_USER.password);

const PRODUCT_TYPES = {
  freshLatex: "น้ำยางสด",
  cupLump: "ยางก้อนถ้วย",
};

const MOCK_FARMS = [
  {
    id: 101,
    location: "หมู่บ้านสวนยางทดสอบ, หมู่ 5, หาดใหญ่, หาดใหญ่, สงขลา",
    province: "สงขลา",
    district: "หาดใหญ่",
    subDistrict: "หาดใหญ่",
    productDistributionType: PRODUCT_TYPES.freshLatex,
    farmerName: "นายสมชาย ใจดี",
    farmerEmail: "test@email.com",
  },
  {
    id: 102,
    location: "หมู่บ้านสวนยางทดสอบ2, หมู่ 5, หาดใหญ่, หาดใหญ่, สงขลา",
    province: "สงขลา",
    district: "หาดใหญ่",
    subDistrict: "หาดใหญ่",
    productDistributionType: PRODUCT_TYPES.cupLump,
    farmerName: "นายสมชาย ใจดี",
    farmerEmail: "test@email.com",
  },
];

const MOCK_INSPECTION_TYPES = [
  {
    inspectionTypeId: 1,
    typeName: "ตรวจประเมินสวนยางพาราก่อนเปิดกรีด",
    description: "การตรวจประเมินมาตรฐานสวนยางพาราก่อนเปิดกรีด",
  },
  {
    inspectionTypeId: 2,
    typeName: "ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด",
    description:
      "การตรวจประเมินมาตรฐานสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด",
  },
  {
    inspectionTypeId: 3,
    typeName: "ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตยางก้อนถ้วย",
    description:
      "การตรวจประเมินมาตรฐานสวนยางพาราหลังเปิดกรีดและการผลิตยางก้อนถ้วย",
  },
];

const MOCK_AUDITORS = [
  { id: 201, name: "นายประเมิน ยางดี", email: "gap_auditor@certify.org" },
  {
    id: 202,
    name: "นายวิชัย ประเมินผล",
    email: "quality.assessor@rubberstandards.com",
  },
];

const MOCK_FARM_DETAILS = {
  rubberFarmId: 101,
  villageName: "หมู่บ้านสวนยางทดสอบ",
  moo: 1,
  road: "ถนนทดสอบ",
  alley: "ซอยทดสอบ",
  subDistrict: "หาดใหญ่",
  district: "หาดใหญ่",
  province: "สงขลา",
  location: {
    type: "Point",
    coordinates: [100.4452514648438, 13.76172844995],
  },
  productDistributionType: PRODUCT_TYPES.freshLatex,
  plantingDetails: [
    {
      plantingDetailId: 68,
      specie: "RRIT 251",
      areaOfPlot: 10.5,
      numberOfRubber: 500,
      numberOfTapping: 400,
      ageOfRubber: 8,
      yearOfTapping: "2020-01-01",
      monthOfTapping: "2020-01-01",
      totalProduction: 1500.5,
    },
  ],
};

async function loginAsAuditor(page, { email, password }) {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const auditorRoleButton = page
    .getByRole("button", { name: /ผู้ตรวจประเมิน/ })
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

async function mockAuditorApplicationsApis(page) {
  await page.route("**/api/v1/auditors/available-farms**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: MOCK_FARMS,
        paginator: { total: MOCK_FARMS.length },
      }),
    });
  });

  await page.route("**/api/v1/inspections/types**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_INSPECTION_TYPES),
    });
  });

  await page.route("**/api/v1/auditors/other-auditors**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: MOCK_AUDITORS,
        paginator: { total: MOCK_AUDITORS.length },
      }),
    });
  });

  await page.route(/\/api\/v1\/rubber-farms\/\d+/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_FARM_DETAILS),
    });
  });
}

function getAutoCompleteWidget(page, id) {
  const wrapper = page.locator(`#${id}`);
  const inputWrapper = page.locator(`input#${id}`).locator("..");
  return wrapper.or(inputWrapper);
}

function getAutoCompleteInput(page, id) {
  return page
    .locator(`input#${id}`)
    .or(page.locator(`#${id} input`))
    .first();
}

async function selectFirstAutoCompleteOption(page, id) {
  const widget = getAutoCompleteWidget(page, id);
  const dropdown = widget.locator("button.p-autocomplete-dropdown").first();
  await dropdown.click();

  const panel = page.locator(".p-autocomplete-panel:visible").first();
  await expect(panel).toBeVisible({ timeout: 10000 });

  const option = panel.locator('[role="option"]').first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
}

function getNavButtons(page) {
  const nav = page.locator("div.mt-8.flex.justify-between");
  return {
    back: nav.locator("button").first(),
    next: nav.locator("button").nth(1),
  };
}

async function waitForFarmTable(page) {
  const table = page.locator(".primary-datatable-wrapper").first();
  await expect(table).toBeVisible({ timeout: 10000 });
  await expect(table.locator("tbody tr").first()).toBeVisible({
    timeout: 10000,
  });
  return table;
}

async function selectFirstFarmRow(page) {
  const table = await waitForFarmTable(page);
  const firstRow = table.locator("tbody tr").first();
  await firstRow.click();
  await expect(firstRow).toHaveClass(/bg-green-50/);
}

function getRowActionButton(row) {
  return row.locator("td").last().locator("button").first();
}

async function gotoStep2(page) {
  await selectFirstFarmRow(page);
  const { next } = getNavButtons(page);
  await next.click();
  await expect(
    page.locator('input[name="inspectionType"]').first(),
  ).toBeVisible({ timeout: 10000 });
}

async function selectAvailableInspectionType(page) {
  const radio = page
    .locator('input[name="inspectionType"]:not([disabled])')
    .first();
  await expect(radio).toBeVisible({ timeout: 10000 });
  await radio.check();
  await expect(radio).toBeChecked();
}

async function gotoStep3(page) {
  await gotoStep2(page);
  await selectAvailableInspectionType(page);
  const { next } = getNavButtons(page);
  await next.click();
  await expect(
    page.locator('input[type="checkbox"][id^="auditor-"]').first(),
  ).toBeVisible({ timeout: 10000 });
}

function getCalendarInput(page, id) {
  return page
    .locator(`#${id} input`)
    .or(page.locator(`input#${id}`))
    .first();
}

async function gotoStep4(page) {
  await gotoStep3(page);
  const { next } = getNavButtons(page);
  await next.click();
  await expect(getCalendarInput(page, "inspectionDate")).toBeVisible({
    timeout: 10000,
  });
}

async function setInspectionDate(page) {
  const dateInput = getCalendarInput(page, "inspectionDate");
  await dateInput.click();
  const panel = page.locator(".p-datepicker:visible").first();
  await expect(panel).toBeVisible({ timeout: 10000 });
  await panel
    .locator(
      "td:not(.p-disabled):not(.p-datepicker-other-month) span:not(.p-disabled)",
    )
    .first()
    .click();
  await expect(dateInput).not.toHaveValue("");
}

async function gotoStep5(page) {
  await gotoStep4(page);
  await setInspectionDate(page);
  const { next } = getNavButtons(page);
  await next.click();
  await expect(page.locator("text=/RF\\d{5}/")).toBeVisible({
    timeout: 10000,
  });
}

async function selectFirstAuditor(page) {
  const checkbox = page
    .locator('input[type="checkbox"][id^="auditor-"]')
    .first();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
}

test.describe("กำหนดการตรวจประเมิน - ผู้ตรวจประเมิน", () => {
  test("TC-001: เข้า /auditor/applications โดยไม่ล็อกอิน", async ({ page }) => {
    await page.goto("/auditor/applications", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test.describe("โฟลว์หลัก", () => {
    test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
    // test.describe.configure({ mode: "serial" });

    test.beforeEach(async ({ page }) => {
      await mockAuditorApplicationsApis(page);
      await loginAsAuditor(page, AUDITOR_USER);
      await page.goto("/auditor/applications", {
        waitUntil: "domcontentloaded",
      });
      await waitForFarmTable(page);
    });

    test("TC-002: ล็อกอินผู้ตรวจประเมินและเปิดหน้าแอป", async ({ page }) => {
      await expect(
        getAutoCompleteInput(page, "searchProvinceId"),
      ).toBeVisible();
      await expect(page.locator(".primary-datatable-wrapper")).toBeVisible();
    });

    test("TC-003: ตารางสวนยางแสดงคอลัมน์หลัก", async ({ page }) => {
      const table = await waitForFarmTable(page);
      await expect(table.locator("thead th")).toHaveCount(7);
      const firstRow = table.locator("tbody tr").first();
      await expect(getRowActionButton(firstRow)).toBeVisible();
    });

    test("TC-004: Dropdown cascade ตามจังหวัด/อำเภอ/ตำบล", async ({ page }) => {
      const amphureInput = getAutoCompleteInput(page, "searchAmphureId");
      const tambonInput = getAutoCompleteInput(page, "searchTambonId");

      await expect(amphureInput).toBeDisabled();
      await expect(tambonInput).toBeDisabled();

      await selectFirstAutoCompleteOption(page, "searchProvinceId");
      await expect(amphureInput).toBeEnabled({ timeout: 10000 });

      await selectFirstAutoCompleteOption(page, "searchAmphureId");
      await expect(tambonInput).toBeEnabled({ timeout: 10000 });
    });

    test("TC-005: ค้นหาด้วยตัวกรองตำแหน่ง", async ({ page }) => {
      await selectFirstAutoCompleteOption(page, "searchProvinceId");
      await selectFirstAutoCompleteOption(page, "searchAmphureId");
      await selectFirstAutoCompleteOption(page, "searchTambonId");

      const requestPromise = page.waitForRequest((request) => {
        if (!request.url().includes("/api/v1/auditors/available-farms")) {
          return false;
        }
        const params = new URL(request.url()).searchParams;
        return (
          params.has("province") &&
          params.has("district") &&
          params.has("subDistrict")
        );
      });

      await page
        .locator("button", { has: page.locator(".pi-search") })
        .first()
        .click();

      const request = await requestPromise;
      const params = new URL(request.url()).searchParams;
      expect(params.get("province")).toBeTruthy();
      expect(params.get("district")).toBeTruthy();
      expect(params.get("subDistrict")).toBeTruthy();
    });

    test("TC-006: ล้างตัวกรองการค้นหา", async ({ page }) => {
      await selectFirstAutoCompleteOption(page, "searchProvinceId");

      const resetRequest = page.waitForRequest((request) => {
        if (!request.url().includes("/api/v1/auditors/available-farms")) {
          return false;
        }
        const params = new URL(request.url()).searchParams;
        return (
          !params.has("province") &&
          !params.has("district") &&
          !params.has("subDistrict")
        );
      });

      await page
        .locator("button", { has: page.locator(".pi-refresh") })
        .first()
        .click();

      await resetRequest;
      await expect(getAutoCompleteInput(page, "searchProvinceId")).toHaveValue(
        "",
      );
      await expect(getAutoCompleteInput(page, "searchAmphureId")).toHaveValue(
        "",
      );
      await expect(getAutoCompleteInput(page, "searchTambonId")).toHaveValue(
        "",
      );
    });

    test("TC-007: เลือกแถวสวนยางสำเร็จ", async ({ page }) => {
      await selectFirstFarmRow(page);
      await page.waitForTimeout(3000);
    });

    test("TC-008: กดถัดไปโดยไม่เลือกสวนยาง", async ({ page }) => {
      const { next } = getNavButtons(page);
      await next.click();
      await expect(
        getAutoCompleteInput(page, "searchProvinceId"),
      ).toBeVisible();
      await expect(page.locator('input[name="inspectionType"]')).toHaveCount(0);
    });

    test("TC-009: ดูรายละเอียดสวนยางผ่านโมดัล", async ({ page }) => {
      const table = await waitForFarmTable(page);
      const firstRow = table.locator("tbody tr").first();
      await getRowActionButton(firstRow).click();

      const modal = page.getByRole("dialog", { name: "รายละเอียดสวนยางพารา" });
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(modal.getByText("ที่ตั้งสวนยาง")).toBeVisible();
      await expect(modal.locator(".primary-datatable-wrapper")).toBeVisible();

      const closeButton = modal
        .locator(".p-dialog-footer")
        .getByRole("button", {
          name: "ปิด",
        });
      await closeButton.click();
      await expect(modal).toBeHidden({ timeout: 10000 });
    });

    test("TC-010: กดถัดไปโดยไม่เลือกประเภทการตรวจ", async ({ page }) => {
      await gotoStep2(page);
      const { next } = getNavButtons(page);
      await next.click();
      await expect(
        page.locator('input[name="inspectionType"]').first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('input[type="checkbox"][id^="auditor-"]'),
      ).toHaveCount(0);
    });

    test("TC-011: เลือกประเภทการตรวจและไป Step 3", async ({ page }) => {
      await gotoStep2(page);
      await selectAvailableInspectionType(page);
      const { next } = getNavButtons(page);
      await next.click();
      await expect(
        page.locator('input[type="checkbox"][id^="auditor-"]').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test("TC-012: เลือกผู้ตรวจประเมินเพิ่มเติม", async ({ page }) => {
      await gotoStep3(page);
      await selectFirstAuditor(page);
      await expect(page.locator("tbody tr.bg-green-50").first()).toBeVisible();
    });

    test("TC-013: ค้นหาผู้ตรวจประเมิน", async ({ page }) => {
      await gotoStep3(page);

      const searchInput = page
        .getByPlaceholder("ค้นหาผู้ตรวจประเมิน")
        .first();
      await searchInput.fill("สมชาย");

      const requestPromise = page.waitForRequest((request) => {
        if (!request.url().includes("/api/v1/auditors/other-auditors")) {
          return false;
        }
        const params = new URL(request.url()).searchParams;
        return params.get("search") === "สมชาย";
      });

      await page.getByRole("button", { name: "ค้นหา" }).first().click();

      await requestPromise;
    });

    test("TC-014: กดถัดไปโดยไม่เลือกวันที่ตรวจ", async ({ page }) => {
      await gotoStep4(page);
      const { next } = getNavButtons(page);
      await next.click();
      await expect(getCalendarInput(page, "inspectionDate")).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator("text=/RF\\d{5}/")).toHaveCount(0);
    });

    test("TC-015: เลือกวันที่ตรวจและไป Step 5", async ({ page }) => {
      await gotoStep5(page);
      await expect(page.locator("text=RF00101")).toBeVisible();
    });

    test("TC-016: ยืนยันและบันทึกกำหนดการ", async ({ page }) => {
      await gotoStep3(page);
      await selectFirstAuditor(page);

      const { next } = getNavButtons(page);
      await next.click();
      await setInspectionDate(page);
      await next.click();
      await expect(page.locator("text=RF00101")).toBeVisible();

      let capturedPayload = null;
      await page.route("**/api/v1/inspections/schedule", async (route) => {
        capturedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ inspectionId: 999 }),
        });
      });

      const submitButton = getNavButtons(page).next;
      await Promise.all([
        page.waitForRequest((request) =>
          request.url().includes("/api/v1/inspections/schedule"),
        ),
        submitButton.click(),
      ]);

      expect(capturedPayload).toMatchObject({
        rubberFarmId: MOCK_FARMS[0].id,
        inspectionTypeId: 2,
        additionalAuditorIds: [MOCK_AUDITORS[0].id],
      });
      expect(
        new Date(capturedPayload.inspectionDateAndTime).toString(),
      ).not.toBe("Invalid Date");

      await page.waitForURL(/\/auditor\/dashboard/, {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });
    });
  });
});
