import { expect, test } from "@playwright/test";

const AUDITOR_USER = {
  email: process.env.E2E_TEST_AUDITOR_WITH_INSP_EMAIL,
  password: process.env.E2E_TEST_AUDITOR_WITH_INSP_PASSWORD,
};

const HAS_AUDITOR_CREDS = Boolean(AUDITOR_USER.email && AUDITOR_USER.password);

const INSPECTION_ID = 2;
const INSPECTION_NO = 2025120002;

const INSPECTION_STATUS_PENDING = "รอการตรวจประเมิน";
const INSPECTION_STATUS_DONE = "ตรวจประเมินแล้ว";
const INSPECTION_RESULT_PENDING = "รอผลการตรวจประเมิน";

const PAGE_HEADING = "ตรวจประเมินสวนยางพารา";
const PAGE_SUBTITLE = "รายการตรวจประเมินที่รอดำเนินการ";
const FARM_DETAILS_TITLE = "รายละเอียดสวนยางพารา";
const INSPECTION_FORM_TITLE = "การตรวจประเมิน";

const PROVINCE_SONGKHLA = "สงขลา";
const DISTRICT_HATYAI = "หาดใหญ่";
const SUBDISTRICT_KHOHONG = "คอหงส์";
const PROVINCE_PHUKET = "ภูเก็ต";
const DISTRICT_KATHU = "กะทู้";
const SUBDISTRICT_PATONG = "ป่าตอง";
const DISTRICT_SINGHA_NAKHON = "สิงหนคร";
const SUBDISTRICT_MUANG_NGAM = "ม่วงงาม";

const INSPECTION_TYPES = [
  { inspectionTypeId: 1, typeName: "ตรวจประเมินสวนยางพาราก่อนเปิดกรีด" },
  {
    inspectionTypeId: 2,
    typeName: "ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด",
  },
  {
    inspectionTypeId: 3,
    typeName: "ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตยางก้อนถ้วย",
  },
];

const DEFAULT_FARMER = {
  namePrefix: "นาย",
  firstName: "สมชาย",
  lastName: "ใจดี",
};

const BASE_INSPECTIONS = [
  makeInspection({
    inspectionId: 1,
    inspectionNo: 2025120001,
    inspectionDateAndTime: "2025-01-12T09:00:00.000Z",
    inspectionTypeId: 1,
    rubberFarmId: 100,
    villageName: "สวนยางบ้านเหนือ",
    province: PROVINCE_SONGKHLA,
    district: DISTRICT_HATYAI,
    subDistrict: SUBDISTRICT_KHOHONG,
  }),
  makeInspection({
    inspectionId: INSPECTION_ID,
    inspectionNo: INSPECTION_NO,
    inspectionDateAndTime: "2025-01-15T10:00:00.000Z",
    inspectionTypeId: 1,
    rubberFarmId: 101,
    villageName: "สวนยางบ้านตัวอย่าง",
    province: PROVINCE_SONGKHLA,
    district: DISTRICT_HATYAI,
    subDistrict: SUBDISTRICT_KHOHONG,
  }),
  makeInspection({
    inspectionId: 3,
    inspectionNo: 2025120003,
    inspectionDateAndTime: "2025-01-18T08:30:00.000Z",
    inspectionTypeId: 1,
    rubberFarmId: 102,
    villageName: "สวนยางบ้านนา",
    province: PROVINCE_SONGKHLA,
    district: DISTRICT_SINGHA_NAKHON,
    subDistrict: SUBDISTRICT_MUANG_NGAM,
    farmer: {
      namePrefix: "นาง",
      firstName: "สายใจ",
      lastName: "ดีงาม",
    },
  }),
  makeInspection({
    inspectionId: 4,
    inspectionNo: 2025120004,
    inspectionDateAndTime: "2025-01-20T13:30:00.000Z",
    inspectionTypeId: 3,
    rubberFarmId: 103,
    villageName: "สวนยางภูเก็ต",
    province: PROVINCE_PHUKET,
    district: DISTRICT_KATHU,
    subDistrict: SUBDISTRICT_PATONG,
    farmer: {
      namePrefix: "นาย",
      firstName: "ภูเก็ต",
      lastName: "ดีมาก",
    },
  }),
  makeInspection({
    inspectionId: 5,
    inspectionNo: 2025120005,
    inspectionDateAndTime: "2025-01-21T09:00:00.000Z",
    inspectionTypeId: 1,
    rubberFarmId: 104,
    villageName: "สวนยางกันตัง",
    province: "ตรัง",
    district: "กันตัง",
    subDistrict: "กันตัง",
  }),
  makeInspection({
    inspectionId: 6,
    inspectionNo: 2025120006,
    inspectionDateAndTime: "2025-01-22T11:00:00.000Z",
    inspectionTypeId: 2,
    rubberFarmId: 105,
    villageName: "สวนยางยะลา",
    province: "ยะลา",
    district: "เมืองยะลา",
    subDistrict: "สะเตง",
  }),
];

const EXTRA_INSPECTIONS = Array.from({ length: 20 }, (_, index) => {
  const id = 10 + index;
  return makeInspection({
    inspectionId: id,
    inspectionNo: 2025120000 + id,
    inspectionDateAndTime: new Date(
      Date.UTC(2025, 1, 1 + index, 9, 0, 0),
    ).toISOString(),
    inspectionTypeId: 1,
    rubberFarmId: 200 + id,
    villageName: `สวนยางแปลงที่ ${id}`,
    province: PROVINCE_SONGKHLA,
    district: DISTRICT_HATYAI,
    subDistrict: SUBDISTRICT_KHOHONG,
    farmer: {
      namePrefix: "นาย",
      firstName: `ทดสอบ${id}`,
      lastName: "สวนยาง",
    },
  });
});

const MOCK_INSPECTIONS = [...BASE_INSPECTIONS, ...EXTRA_INSPECTIONS];

const MOCK_FARM_DETAILS = {
  rubberFarmId: 101,
  villageName: "สวนยางบ้านตัวอย่าง",
  moo: 5,
  road: "ถนนสายหลัก",
  alley: "ซอย 1",
  subDistrict: SUBDISTRICT_KHOHONG,
  district: DISTRICT_HATYAI,
  province: PROVINCE_SONGKHLA,
  productDistributionType: "น้ำยางสด",
  location: { type: "Point", coordinates: [100.501, 7.001] },
  plantingDetails: [
    {
      plantingDetailId: 1,
      specie: "RRIT 251",
      areaOfPlot: 10.5,
      numberOfRubber: 500,
      numberOfTapping: 400,
      ageOfRubber: 8,
      yearOfTapping: "2020-01-01",
      monthOfTapping: "2020-06-01",
      totalProduction: 1500,
    },
  ],
};

const REQUIREMENT_SAMPLE_NAME =
  "หากไม่ใช่น้ำฝน ต้องมาจากแหล่งที่ไม่มีการปนเปื้อนวัตถุอันตราย";
function createDefaultInspectionItems() {
  return [
    {
      inspectionItemId: 5001,
      inspectionId: INSPECTION_ID,
      inspectionItemMasterId: 1,
      inspectionItemNo: 1,
      inspectionItemResult: "NOT_EVALUATED",
      otherConditions: {},
      version: 1,
      inspectionItemMaster: {
        itemNo: 1,
        itemName: "น้ำ",
      },
      requirements: [
        {
          requirementId: 7001,
          requirementNo: 1,
          evaluationResult: "",
          evaluationMethod: "",
          note: "",
          version: 1,
          requirementMaster: {
            requirementName: REQUIREMENT_SAMPLE_NAME,
            requirementLevel: "ข้อกำหนดรอง",
            requirementLevelNo: "1.1",
          },
        },
        {
          requirementId: 7002,
          requirementNo: 2,
          evaluationResult: "",
          evaluationMethod: "",
          note: "",
          version: 1,
          requirementMaster: {
            requirementName: "มีการอนุรักษ์แหล่งน้ำ และสภาพแวดล้อม",
            requirementLevel: "ข้อแนะนำ",
            requirementLevelNo: "1.2",
          },
        },
      ],
    },
    {
      inspectionItemId: 5002,
      inspectionId: INSPECTION_ID,
      inspectionItemMasterId: 2,
      inspectionItemNo: 2,
      inspectionItemResult: "NOT_EVALUATED",
      otherConditions: {},
      version: 1,
      inspectionItemMaster: {
        itemNo: 2,
        itemName: "พื้นที่ปลูก",
      },
      requirements: [
        {
          requirementId: 7003,
          requirementNo: 1,
          evaluationResult: "",
          evaluationMethod: "",
          note: "",
          version: 1,
          requirementMaster: {
            requirementName:
              "พื้นที่ปลูกไม่มีการตกค้างของวัตถุอันตรายที่ส่งผลกระทบต่อการเจริญเติบโตของต้นยาง",
            requirementLevel: "ข้อกำหนดหลัก",
            requirementLevelNo: "2.1",
          },
        },
      ],
    },
  ];
}

function createCompletedInspectionItems() {
  return [
    {
      inspectionItemId: 6001,
      inspectionId: INSPECTION_ID,
      inspectionItemMasterId: 1,
      inspectionItemNo: 1,
      inspectionItemResult: "ผ่าน",
      otherConditions: {},
      version: 2,
      inspectionItemMaster: {
        itemNo: 1,
        itemName: "น้ำ",
      },
      requirements: [
        {
          requirementId: 8001,
          requirementNo: 1,
          evaluationResult: "ใช่",
          evaluationMethod: "พินิจ",
          note: "ครบถ้วน",
          version: 2,
          requirementMaster: {
            requirementName: REQUIREMENT_SAMPLE_NAME,
            requirementLevel: "ข้อกำหนดรอง",
            requirementLevelNo: "1.1",
          },
        },
      ],
    },
  ];
}

function createIncompleteSingleInspectionItems() {
  return [
    {
      inspectionItemId: 7001,
      inspectionId: INSPECTION_ID,
      inspectionItemMasterId: 1,
      inspectionItemNo: 1,
      inspectionItemResult: "NOT_EVALUATED",
      otherConditions: {},
      version: 1,
      inspectionItemMaster: {
        itemNo: 1,
        itemName: "น้ำ",
      },
      requirements: [
        {
          requirementId: 9001,
          requirementNo: 1,
          evaluationResult: "",
          evaluationMethod: "",
          note: "",
          version: 1,
          requirementMaster: {
            requirementName: REQUIREMENT_SAMPLE_NAME,
            requirementLevel: "ข้อกำหนดรอง",
            requirementLevelNo: "1.1",
          },
        },
      ],
    },
  ];
}

function createMockInspections() {
  return JSON.parse(JSON.stringify(MOCK_INSPECTIONS));
}

function makeInspection({
  inspectionId,
  inspectionNo,
  inspectionDateAndTime,
  inspectionTypeId = 1,
  inspectionStatus = INSPECTION_STATUS_PENDING,
  inspectionResult = INSPECTION_RESULT_PENDING,
  auditorChiefId = 501,
  rubberFarmId,
  villageName,
  province,
  district,
  subDistrict,
  farmer = DEFAULT_FARMER,
}) {
  const inspectionType =
    INSPECTION_TYPES.find((type) => type.inspectionTypeId === inspectionTypeId)
      ?.typeName || INSPECTION_TYPES[0].typeName;

  return {
    inspectionId,
    inspectionNo,
    inspectionDateAndTime,
    inspectionTypeId,
    inspectionStatus,
    inspectionResult,
    auditorChiefId,
    rubberFarmId,
    version: 1,
    inspectionType: { typeName: inspectionType },
    rubberFarm: {
      villageName,
      district,
      province,
      subDistrict,
      farmer,
    },
  };
}

function getValueByPath(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function compareValues(a, b, order) {
  const left = a ?? "";
  const right = b ?? "";
  let result = 0;

  if (typeof left === "number" && typeof right === "number") {
    result = left - right;
  } else {
    result = String(left).localeCompare(String(right), "th");
  }

  return order === -1 ? -result : result;
}

function applySorting(items, sortMeta) {
  if (!sortMeta.length) return items;

  return [...items].sort((a, b) => {
    for (const meta of sortMeta) {
      if (!meta.field || !meta.order) continue;
      const valueA = getValueByPath(a, meta.field);
      const valueB = getValueByPath(b, meta.field);
      const comparison = compareValues(valueA, valueB, meta.order);
      if (comparison !== 0) return comparison;
    }
    return 0;
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
    timeout: 20000,
    waitUntil: "domcontentloaded",
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

async function expectVisible(locator, options) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible(options);
}

async function selectAutoCompleteOptionByText(page, id, text) {
  const input = getAutoCompleteInput(page, id);
  await expectVisible(input, { timeout: 10000 });
  await input.click();
  await input.fill(text);

  const widget = getAutoCompleteWidget(page, id);
  const dropdown = widget.locator("button.p-autocomplete-dropdown").first();
  await dropdown.click();

  const panel = page.locator(".p-autocomplete-panel:visible").first();
  await expectVisible(panel, { timeout: 10000 });

  const option = panel.getByRole("option", { name: text, exact: true }).first();
  await expectVisible(option, { timeout: 10000 });
  await option.click();
  await expect(input).toHaveValue(text, { timeout: 10000 });
  await page.keyboard.press("Escape");
  if (await panel.isVisible().catch(() => false)) {
    await page.mouse.click(5, 5);
  }
  await panel.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
}

async function selectAutoCompleteOptionByIndex(page, id, index) {
  const input = getAutoCompleteInput(page, id);
  await expectVisible(input, { timeout: 10000 });
  await input.click();

  const widget = getAutoCompleteWidget(page, id);
  const dropdown = widget.locator("button.p-autocomplete-dropdown").first();
  await dropdown.click();

  const panel = page.locator(".p-autocomplete-panel:visible").first();
  await expectVisible(panel, { timeout: 10000 });

  const option = panel.getByRole("option").nth(index);
  await expectVisible(option, { timeout: 10000 });
  await option.click();
  await expect(input).not.toHaveValue("", { timeout: 10000 });
  await page.keyboard.press("Escape");
  if (await panel.isVisible().catch(() => false)) {
    await page.mouse.click(5, 5);
  }
  await panel.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
}

async function waitForInspectionsTable(page) {
  const table = page.locator(".primary-datatable-wrapper").first();
  await expectVisible(table, { timeout: 10000 });
  await expectVisible(table.locator("table"), { timeout: 10000 });
  return table;
}

async function getInspectionRow(page, inspectionNo) {
  const table = await waitForInspectionsTable(page);
  const row = table
    .locator("tbody tr")
    .filter({ hasText: String(inspectionNo) })
    .first();
  await expectVisible(row, { timeout: 10000 });
  return row;
}

function getSearchButton(page) {
  return page
    .getByRole("button", { name: "ค้นหา" })
    .or(page.locator("button", { has: page.locator(".pi-search") }))
    .first();
}

function getResetButton(page) {
  return page
    .getByRole("button", { name: "ล้างค่า" })
    .or(page.locator("button", { has: page.locator(".pi-refresh") }))
    .first();
}

async function clickSearchButton(page) {
  const panel = page.locator(".p-autocomplete-panel:visible").first();
  if (await panel.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "hidden", timeout: 1000 }).catch(() => {});
  }
  const button = getSearchButton(page);
  await button.scrollIntoViewIfNeeded();
  await button.click({ force: true });
}

function getFarmDetailsModal(page) {
  return page
    .locator(".fixed.inset-0")
    .filter({ has: page.getByRole("heading", { name: FARM_DETAILS_TITLE }) });
}

function getInspectionFormModal(page) {
  return page.locator(".fixed.inset-0").filter({
    has: page.getByRole("heading", { name: INSPECTION_FORM_TITLE }),
  });
}

async function openFarmDetails(page, inspectionNo = INSPECTION_NO) {
  const row = await getInspectionRow(page, inspectionNo);
  const buttons = row.locator("button");
  await expect(buttons).toHaveCount(2);
  await buttons.nth(0).click();
  await expectVisible(page.getByRole("heading", { name: FARM_DETAILS_TITLE }), {
    timeout: 10000,
  });
  return getFarmDetailsModal(page);
}

async function openInspectionForm(page, inspectionNo = INSPECTION_NO) {
  const row = await getInspectionRow(page, inspectionNo);
  const buttons = row.locator("button");
  await expect(buttons).toHaveCount(2);
  await buttons.nth(1).click();
  await expectVisible(
    page.getByRole("heading", { name: INSPECTION_FORM_TITLE }),
    { timeout: 10000 },
  );
  return getInspectionFormModal(page);
}

async function selectDropdownOptionByIndex(page, dropdown, index) {
  await dropdown.click();
  const panel = page.locator(".p-dropdown-panel:visible").first();
  await expectVisible(panel, { timeout: 10000 });
  const option = panel.locator('[role="option"]').nth(index);
  await expectVisible(option, { timeout: 10000 });
  await option.click();
  await expect(panel).toBeHidden({ timeout: 10000 });
}

async function fillAllRequirements(modal, page) {
  const resultDropdowns = modal.locator('[id^="eval-result-"]');
  const methodDropdowns = modal.locator('[id^="eval-method-"]');
  const totalResults = await resultDropdowns.count();
  const totalMethods = await methodDropdowns.count();

  for (let i = 0; i < totalResults; i += 1) {
    await selectDropdownOptionByIndex(page, resultDropdowns.nth(i), 0);
  }

  for (let i = 0; i < totalMethods; i += 1) {
    await selectDropdownOptionByIndex(page, methodDropdowns.nth(i), 0);
  }
}

async function mockInspectionsListRoute(page, { inspections, delayMs = 0 }) {
  await page.route("**/api/v1/inspections**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const url = new URL(route.request().url());
    const params = url.searchParams;

    let filtered = [...inspections];
    const province = params.get("province");
    const district = params.get("district");
    const subDistrict = params.get("subDistrict");

    if (province) {
      filtered = filtered.filter(
        (item) => item.rubberFarm?.province === province,
      );
    }

    if (district) {
      filtered = filtered.filter(
        (item) => item.rubberFarm?.district === district,
      );
    }

    if (subDistrict) {
      filtered = filtered.filter(
        (item) => item.rubberFarm?.subDistrict === subDistrict,
      );
    }

    const multiSortMetaParam = params.get("multiSortMeta");
    const sortField = params.get("sortField");
    const sortOrder = params.get("sortOrder");

    if (multiSortMetaParam) {
      try {
        const multiSortMeta = JSON.parse(multiSortMetaParam);
        if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
          filtered = applySorting(filtered, multiSortMeta);
        }
      } catch {
        filtered = [...filtered];
      }
    } else if (sortField && sortOrder) {
      filtered = applySorting(filtered, [
        {
          field: sortField,
          order: sortOrder === "asc" ? 1 : -1,
        },
      ]);
    }

    const limit = Number(params.get("limit") || "10");
    const offset = Number(params.get("offset") || "0");
    const results = filtered.slice(offset, offset + limit);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results,
        paginator: { total: filtered.length },
      }),
    });
  });
}

async function mockInspectionItemsRoute(
  page,
  itemsByInspectionId,
  { delayMs = 0 } = {},
) {
  await page.route("**/api/v1/inspection-items**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const url = new URL(route.request().url());
    const inspectionId = Number(url.searchParams.get("inspectionId"));
    const items = itemsByInspectionId[inspectionId] || [];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(items),
    });
  });
}

async function mockFarmDetailsRoute(page, { farmDetails, delayMs = 0 }) {
  await page.route(/\/api\/v1\/rubber-farms\/\d+/, async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const match = route
      .request()
      .url()
      .match(/rubber-farms\/(\d+)/);
    const farmId = Number(match?.[1]);
    if (farmDetails && farmId === farmDetails.rubberFarmId) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(farmDetails),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "Not Found" }),
    });
  });
}

async function mockSaveRoutes(page, { inspections }) {
  await page.route("**/api/v1/requirements/evaluation", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const payload = route.request().postDataJSON() || [];
    const updated = payload.map((item) => ({
      requirementId: item.requirementId,
      version: (item.version || 0) + 1,
    }));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ updated }),
    });
  });

  await page.route("**/api/v1/inspection-items/evaluation", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const payload = route.request().postDataJSON() || [];
    const updated = payload.map((item) => ({
      inspectionItemId: item.inspectionItemId,
      version: (item.version || 0) + 1,
    }));

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ updated }),
    });
  });

  await page.route(/\/api\/v1\/inspections\/\d+\/status/, async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const match = route
      .request()
      .url()
      .match(/inspections\/(\d+)\/status/);
    const inspectionId = Number(match?.[1]);
    const target = inspections.find(
      (item) => item.inspectionId === inspectionId,
    );
    if (target) {
      target.inspectionStatus = INSPECTION_STATUS_DONE;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
}
test.describe("ตรวจประเมินสวนยาง - ผู้ตรวจประเมิน", () => {
  test.skip(!HAS_AUDITOR_CREDS, "ยังไม่ได้ตั้งค่า E2E auditor credentials");
  test.describe.configure({ mode: "serial" });

  let inspections;
  let inspectionItemsById;

  test.beforeEach(async ({ page }) => {
    inspections = createMockInspections();
    inspectionItemsById = {
      [INSPECTION_ID]: createDefaultInspectionItems(),
    };
    await mockInspectionsListRoute(page, { inspections });
    await mockInspectionItemsRoute(page, inspectionItemsById);
    await mockFarmDetailsRoute(page, { farmDetails: MOCK_FARM_DETAILS });
    await mockSaveRoutes(page, { inspections });

    await loginAsAuditor(page, AUDITOR_USER);
    await page.goto("/auditor/inspections", {
      waitUntil: "domcontentloaded",
    });
    await waitForInspectionsTable(page);
  });

  test("TC-001: เข้าเมนูรายการตรวจประเมิน", async ({ page }) => {
    await expectVisible(page.getByRole("heading", { name: PAGE_HEADING }));
    await expectVisible(page.getByText(PAGE_SUBTITLE));
    await expectVisible(page.locator(".primary-datatable-wrapper"));
  });

  test("TC-002: แสดงรายการการตรวจประเมินเมื่อมีข้อมูล", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const rowCount = await table.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC-003: แสดงข้อความเมื่อไม่มีรายการตรวจประเมิน", async ({ page }) => {
    await mockInspectionsListRoute(page, { inspections: [] });
    await page.reload({ waitUntil: "domcontentloaded" });

    const table = await waitForInspectionsTable(page);
    await expect(table).toContainText("ไม่พบรายการตรวจประเมินที่รอดำเนินการ");
  });

  test("TC-004: แสดงสถานะโหลดข้อมูล", async ({ page }) => {
    await mockInspectionsListRoute(page, { inspections, delayMs: 1200 });
    await page.reload({ waitUntil: "domcontentloaded" });

    const spinner = page.locator(".animate-spin").first();
    await expectVisible(spinner);
    await waitForInspectionsTable(page);
  });

  test("TC-005: แสดงคอลัมน์หลักครบถ้วน", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    await expect(table.locator("thead th")).toHaveCount(7);
  });

  test("TC-006: แสดงรหัสการตรวจในแต่ละแถว", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row.locator("td").first()).toContainText(
      String(INSPECTION_NO),
    );
  });

  test("TC-007: แสดงวันที่และเวลาตรวจในรูปแบบที่อ่านได้", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    const dateCell = row.locator("td").nth(1);
    const dateText = (await dateCell.textContent()) || "";
    expect(dateText).not.toContain("Invalid");
    expect(dateText.trim().length).toBeGreaterThan(0);
  });

  test("TC-008: แสดงประเภทการตรวจประเมิน", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row.locator("td").nth(2)).toContainText(
      INSPECTION_TYPES[0].typeName,
    );
  });

  test("TC-009: แสดงชื่อสถานที่สวนยาง", async ({ page }) => {
    const modal = await openFarmDetails(page);
    await expect(modal).toContainText(MOCK_FARM_DETAILS.villageName);
    await modal.getByRole("button", { name: "ปิด" }).click();
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  test("TC-010: แสดงจังหวัด/อำเภอ/ตำบล", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row.locator("td").nth(4)).toContainText(PROVINCE_SONGKHLA);

    const modal = await openFarmDetails(page);
    await expect(modal).toContainText(PROVINCE_SONGKHLA);
    await expect(modal).toContainText(DISTRICT_HATYAI);
    await expect(modal).toContainText(SUBDISTRICT_KHOHONG);
    await modal.getByRole("button", { name: "ปิด" }).click();
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  test("TC-011: แสดงชื่อเกษตรกร", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row.locator("td").nth(3)).toContainText("สมชาย ใจดี");
  });

  test("TC-012: แสดงปุ่มการดำเนินการในแต่ละแถว", async ({ page }) => {
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row.locator("button")).toHaveCount(2);
  });

  test("TC-013: กรองตามจังหวัด", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return params.get("province") === PROVINCE_SONGKHLA;
    });

    await clickSearchButton(page);
    await requestPromise;

    const table = await waitForInspectionsTable(page);
    const provinceCell = table.locator("tbody tr").first().locator("td").nth(4);
    await expect(provinceCell).toContainText(PROVINCE_SONGKHLA);
  });

  test("TC-014: กรองตามอำเภอ", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await clickSearchButton(page);
    await expect(getAutoCompleteInput(page, "province-search")).toHaveValue(
      PROVINCE_SONGKHLA,
    );
    await expect(getAutoCompleteInput(page, "district-search")).toHaveValue(
      DISTRICT_HATYAI,
    );
  });

  test("TC-015: กรองตามตำบล", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await selectAutoCompleteOptionByText(page, "subdistrict-search", "คอหงส์");

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return (
        params.get("province") === PROVINCE_SONGKHLA &&
        params.get("district") === DISTRICT_HATYAI &&
        params.get("subDistrict") === SUBDISTRICT_KHOHONG
      );
    });

    await clickSearchButton(page);
    await requestPromise;
  });

  test("TC-016: กรองตามสถานะการตรวจ", async ({ page }) => {
    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return params.get("inspectionStatus") === INSPECTION_STATUS_PENDING;
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await requestPromise;

    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row).toContainText(INSPECTION_STATUS_PENDING);
  });

  test("TC-017: กรองหลายเงื่อนไขพร้อมกัน", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await clickSearchButton(page);
    await expect(getAutoCompleteInput(page, "province-search")).toHaveValue(
      PROVINCE_SONGKHLA,
    );
    await expect(getAutoCompleteInput(page, "district-search")).toHaveValue(
      DISTRICT_HATYAI,
    );

    const table = await waitForInspectionsTable(page);
    const rowCount = await table.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC-018: กดปุ่มค้นหาเรียกข้อมูลใหม่", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return (
        params.get("province") === PROVINCE_SONGKHLA &&
        params.get("offset") === "0"
      );
    });

    await clickSearchButton(page);
    await requestPromise;
  });

  test("TC-019: ล้างค่าตัวกรอง", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await selectAutoCompleteOptionByText(page, "subdistrict-search", "คอหงส์");

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return (
        !params.has("province") &&
        !params.has("district") &&
        !params.has("subDistrict")
      );
    });

    await getResetButton(page).click();
    await requestPromise;

    await expect(getAutoCompleteInput(page, "province-search")).toHaveValue("");
    await expect(getAutoCompleteInput(page, "district-search")).toHaveValue("");
    await expect(getAutoCompleteInput(page, "subdistrict-search")).toHaveValue(
      "",
    );
  });

  test("TC-020: เปลี่ยนจังหวัดแล้วอำเภอ/ตำบลถูกรีเซ็ต", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await selectAutoCompleteOptionByText(page, "subdistrict-search", "คอหงส์");

    await selectAutoCompleteOptionByText(page, "province-search", "ภูเก็ต");

    await expect(getAutoCompleteInput(page, "district-search")).toHaveValue("");
    await expect(getAutoCompleteInput(page, "subdistrict-search")).toHaveValue(
      "",
    );
  });

  test("TC-021: เปลี่ยนอำเภอแล้วตำบลถูกรีเซ็ต", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await selectAutoCompleteOptionByText(page, "district-search", "หาดใหญ่");
    await selectAutoCompleteOptionByText(page, "subdistrict-search", "คอหงส์");

    await selectAutoCompleteOptionByText(page, "district-search", "สิงหนคร");

    await expect(getAutoCompleteInput(page, "subdistrict-search")).toHaveValue(
      "",
    );
  });

  test("TC-022: ไม่พบผลลัพธ์การค้นหา", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "ภูเก็ต");
    await selectAutoCompleteOptionByText(
      page,
      "district-search",
      "เมืองภูเก็ต",
    );
    await page.unroute("**/api/v1/inspections**");
    await mockInspectionsListRoute(page, { inspections: [] });
    await clickSearchButton(page);
    await expect(getAutoCompleteInput(page, "province-search")).toHaveValue(
      PROVINCE_PHUKET,
    );
    await expect(getAutoCompleteInput(page, "district-search")).toHaveValue(
      "เมืองภูเก็ต",
    );

    const table = await waitForInspectionsTable(page);
    await expect(table).toContainText("ไม่พบรายการตรวจประเมินที่รอดำเนินการ");
  });

  test("TC-023: เปลี่ยนหน้าในตาราง", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const firstRowText = await table.locator("tbody tr").first().textContent();
    const paginator = table.locator(".p-paginator").first();
    const nextButton = paginator.locator("button.p-paginator-next").first();

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return params.get("offset") === "10";
    });

    await nextButton.click();
    await requestPromise;

    const nextRowText = await table.locator("tbody tr").first().textContent();
    expect(nextRowText).not.toBe(firstRowText);
  });

  test("TC-024: เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const paginator = table.locator(".p-paginator").first();
    const rppDropdown = paginator.locator(".p-dropdown").first();

    await rppDropdown.click();
    const option25 = page
      .locator(".p-dropdown-items li", { hasText: "25" })
      .first();
    await expectVisible(option25);

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return params.get("limit") === "25";
    });

    await option25.click();
    await requestPromise;
    await expect(rppDropdown).toContainText("25");
  });

  test("TC-025: เรียงตามรหัสการตรวจ", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const sortHeader = table
      .locator("thead th")
      .filter({ hasText: "รหัสการตรวจ" })
      .first();

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      const meta = params.get("multiSortMeta");
      return meta ? meta.includes("inspectionNo") : false;
    });

    await sortHeader.click();
    await requestPromise;
  });

  test("TC-026: เรียงตามวันที่และเวลา", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const sortHeader = table
      .getByRole("columnheader", { name: /วันที่/ })
      .first();

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      const meta = params.get("multiSortMeta");
      return meta ? meta.includes("inspectionDateAndTime") : false;
    });

    await sortHeader.click();
    await requestPromise;
  });

  test("TC-027: เรียงตามจังหวัด", async ({ page }) => {
    const table = await waitForInspectionsTable(page);
    const sortHeader = table
      .locator("thead th")
      .filter({ hasText: "จังหวัด" })
      .first();

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      const meta = params.get("multiSortMeta");
      return meta ? meta.includes("rubberFarm.province") : false;
    });

    await sortHeader.click();
    await requestPromise;
  });

  test("TC-028: คงค่าตัวกรองเมื่อเปลี่ยนหน้า", async ({ page }) => {
    await selectAutoCompleteOptionByText(page, "province-search", "สงขลา");
    await clickSearchButton(page);

    const table = await waitForInspectionsTable(page);
    const paginator = table.locator(".p-paginator").first();
    const nextButton = paginator.locator("button.p-paginator-next").first();

    const requestPromise = page.waitForRequest((request) => {
      if (!request.url().includes("/api/v1/inspections")) return false;
      const params = new URL(request.url()).searchParams;
      return params.get("province") === PROVINCE_SONGKHLA;
    });

    await nextButton.click();
    await requestPromise;
  });

  test("TC-029: เปิดหน้าต่างรายละเอียดสวนยาง", async ({ page }) => {
    const modal = await openFarmDetails(page);
    await expectVisible(modal);
  });

  test("TC-030: แสดงสถานะโหลดข้อมูลรายละเอียด", async ({ page }) => {
    await mockFarmDetailsRoute(page, {
      farmDetails: MOCK_FARM_DETAILS,
      delayMs: 1200,
    });
    const modal = await openFarmDetails(page);

    const spinner = modal.locator(".animate-spin").first();
    await expectVisible(spinner);
  });

  test("TC-031: แสดงข้อมูลสำคัญของสวนยาง", async ({ page }) => {
    const modal = await openFarmDetails(page);
    await expect(modal).toContainText(MOCK_FARM_DETAILS.villageName);
    await expect(modal).toContainText(MOCK_FARM_DETAILS.province);
    await expect(modal).toContainText(MOCK_FARM_DETAILS.district);
    await expect(modal).toContainText(MOCK_FARM_DETAILS.subDistrict);
    await expect(modal).toContainText(
      MOCK_FARM_DETAILS.productDistributionType,
    );
  });

  test("TC-032: ปิด Dialog ด้วยปุ่มปิด", async ({ page }) => {
    const modal = await openFarmDetails(page);
    await modal.locator("button").first().click();
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  test('TC-033: ปิด Dialog ด้วยปุ่ม "ปิด"', async ({ page }) => {
    const modal = await openFarmDetails(page);
    await modal.getByRole("button", { name: "ปิด" }).click();
    await expect(modal).toBeHidden({ timeout: 10000 });
  });

  test("TC-034: เข้าแบบฟอร์มตรวจประเมินจากรายการ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await expectVisible(modal);
  });

  test("TC-035: แสดงข้อมูลหัวเรื่องการตรวจ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await expect(modal).toContainText("รายการที่ 1 จาก");
  });

  test("TC-036: โหลดรายการข้อกำหนด/รายการตรวจ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await expectVisible(modal.locator('[id^="eval-result-"]').first());
  });

  test("TC-037: เปิดดูรายละเอียดรายการตรวจ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await expect(modal).toContainText(REQUIREMENT_SAMPLE_NAME);
  });

  test('TC-038: กดปุ่ม "ถัดไป" เพื่อเปลี่ยนรายการ', async ({ page }) => {
    const modal = await openInspectionForm(page);
    const info = modal.locator("p", { hasText: "รายการที่" }).first();
    const beforeText = (await info.textContent()) || "";

    await modal.getByRole("button", { name: "ถัดไป" }).click();
    await expect(info).not.toHaveText(beforeText);
  });

  test('TC-039: กดปุ่ม "ก่อนหน้า" เพื่อย้อนกลับ', async ({ page }) => {
    const modal = await openInspectionForm(page);
    const info = modal.locator("p", { hasText: "รายการที่" }).first();

    await modal.getByRole("button", { name: "ถัดไป" }).click();
    const afterNextText = (await info.textContent()) || "";

    await modal.getByRole("button", { name: "ก่อนหน้า" }).click();
    await expect(info).not.toHaveText(afterNextText);
  });

  test("TC-040: บันทึกรายการโดยไม่เลือกผลประเมิน", async ({ page }) => {
    const modal = await openInspectionForm(page);
    let saveCalled = false;

    page.on("request", (request) => {
      if (request.url().includes("/api/v1/requirements/evaluation")) {
        saveCalled = true;
      }
    });

    await modal.getByRole("button", { name: "บันทึกหน้านี้" }).click();
    await page.waitForTimeout(500);

    expect(saveCalled).toBe(false);
  });

  test("TC-041: บันทึกรายการเมื่อเลือกผลประเมินแล้ว", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await fillAllRequirements(modal, page);

    const requestPromise = page.waitForRequest((request) => {
      return request.url().includes("/api/v1/requirements/evaluation");
    });

    await modal.getByRole("button", { name: "บันทึกหน้านี้" }).click();
    await requestPromise;
  });

  test("TC-042: บันทึกหมายเหตุของรายการตรวจ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await fillAllRequirements(modal, page);

    const noteInput = modal.locator('[id^="note-"]').first();
    await noteInput.fill("บันทึกหมายเหตุทดสอบ");

    await modal.getByRole("button", { name: "บันทึกหน้านี้" }).click();
    await modal.getByRole("button", { name: "ถัดไป" }).click();
    await modal.getByRole("button", { name: "ก่อนหน้า" }).click();

    await expect(noteInput).toHaveValue("บันทึกหมายเหตุทดสอบ");
  });

  test("TC-043: บันทึกทุกรายการสำเร็จ", async ({ page }) => {
    const modal = await openInspectionForm(page);
    await fillAllRequirements(modal, page);

    await modal.getByRole("button", { name: "ถัดไป" }).click();
    await fillAllRequirements(modal, page);

    const requestPromise = page.waitForRequest((request) => {
      return request.url().includes("/api/v1/inspection-items/evaluation");
    });

    await modal.getByRole("button", { name: "บันทึกทั้งหมด" }).click();
    await requestPromise;
  });

  test("TC-044: เสร็จสิ้นการตรวจประเมิน", async ({ page }) => {
    inspectionItemsById[INSPECTION_ID] = createCompletedInspectionItems();
    await mockInspectionItemsRoute(page, inspectionItemsById);

    const modal = await openInspectionForm(page);

    const requestPromise = page.waitForRequest((request) => {
      return request
        .url()
        .includes(`/api/v1/inspections/${INSPECTION_ID}/status`);
    });

    await modal.getByRole("button", { name: "จบการตรวจประเมิน" }).click();
    await requestPromise;

    await expect(modal).toBeHidden({ timeout: 10000 });
    const row = await getInspectionRow(page, INSPECTION_NO);
    await expect(row).toContainText(INSPECTION_STATUS_DONE);
  });

  test("TC-045: ป้องกันการเสร็จสิ้นเมื่อข้อมูลไม่ครบ", async ({ page }) => {
    inspectionItemsById[INSPECTION_ID] =
      createIncompleteSingleInspectionItems();
    await mockInspectionItemsRoute(page, inspectionItemsById);

    const modal = await openInspectionForm(page);
    const completeButton = modal.getByRole("button", {
      name: "จบการตรวจประเมิน",
    });
    await expect(completeButton).toBeDisabled();
  });
});
