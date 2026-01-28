const { test, expect } = require("@playwright/test");

const USER_WITH_FARMS = {
  email: process.env.E2E_TEST_USER_EMAIL,
  password: process.env.E2E_TEST_USER_PASSWORD,
};

function getErrorAlert(page) {
  return page.locator(".bg-red-50");
}

function getFormNextButton(page) {
  return page.getByRole("button", { name: /^ถัดไป$/ });
}

function getFormBackButton(page) {
  return page.getByRole("button", { name: "ย้อนกลับ" });
}

async function clearAndType(locator, value) {
  await locator.click();
  await locator.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await locator.press("Backspace");
  if (value !== undefined && value !== null && String(value).length > 0) {
    await locator.type(String(value));
  }
}

async function loginAsFarmer(page, { email, password }) {
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

  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);

  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.waitForURL(/\/farmer/, {
    timeout: 20000,
    waitUntil: "domcontentloaded",
  });
}

async function navigateAndSelectFarm(page) {
  await page.goto("/farmer/applications/edit", {
    waitUntil: "domcontentloaded",
  });

  const step1Table = page.locator(".primary-datatable-wrapper");
  await expect(step1Table).toBeVisible({ timeout: 10000 });

  const firstRow = step1Table.locator("tbody tr").first();
  await firstRow.click();
  await expect(firstRow).toHaveClass(/p-highlight/);

  await getFormNextButton(page).click();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true }),
  ).toBeVisible({ timeout: 10000 });
}

async function fillStep2ValidData(page) {
  const villageInput = page
    .locator('input[name="villageName"]')
    .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
    .first();
  const mooInput = page
    .locator("#moo")
    .or(page.locator('input[name="moo"]'))
    .or(page.locator('input[inputmode="numeric"]'))
    .first();

  const villageValue = await villageInput.inputValue();
  if (!villageValue) {
    await villageInput.fill("หมู่บ้านทดสอบ");
  }

  const mooValue = await mooInput.inputValue();
  if (!mooValue || mooValue === "0") {
    await clearAndType(mooInput, "5");
  }

  const roadInput = page
    .locator('input[name="road"]')
    .or(page.getByLabel("ถนน"))
    .first();
  const roadValue = await roadInput.inputValue();
  if (!roadValue) {
    await roadInput.fill("ถนนทดสอบ");
  }

  const alleyInput = page
    .locator('input[name="alley"]')
    .or(page.getByLabel("ซอย"))
    .first();
  const alleyValue = await alleyInput.inputValue();
  if (!alleyValue) {
    await alleyInput.fill("ซอยทดสอบ");
  }
}

async function ensureCanProceedFromStep2(page) {
  await fillStep2ValidData(page);

  for (let attempt = 1; attempt <= 3; attempt++) {
    await getFormNextButton(page).click();

    const step3Heading = page.getByRole("heading", {
      name: "รายละเอียดการปลูก",
      exact: true,
    });
    if (await step3Heading.isVisible()) return;

    const errorAlert = getErrorAlert(page);
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.innerText();
      if (
        errorText.includes("กรุณาคลิกบนแผนที่") ||
        errorText.includes("กรุณาระบุตำแหน่งที่ตั้งสวนยางบนแผนที่")
      ) {
        const mapContainer = page.locator(".leaflet-container");
        if (await mapContainer.isVisible()) {
          await mapContainer.click({ position: { x: 200, y: 200 } });
          continue;
        }
      }
    }

    if (attempt === 3) {
      await expect(step3Heading).toBeVisible({ timeout: 10000 });
    }
  }
}

async function gotoEditStep3(page) {
  await loginAsFarmer(page, USER_WITH_FARMS);
  await navigateAndSelectFarm(page);
  await ensureCanProceedFromStep2(page);

  await expect(
    page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true }),
  ).toBeVisible({ timeout: 10000 });
}

function getPlantingCard(page, index) {
  return page.locator(".bg-white").filter({ hasText: `รายการที่ ${index}` });
}

function getAutoCompleteInput(page, name) {
  return page
    .locator(`input[name="${name}"]`)
    .or(page.locator(`#${name} input`))
    .first();
}

async function selectFromDropdown(page, { id, optionText }) {
  const dropdown = page.locator(`#${id}`);
  await dropdown.scrollIntoViewIfNeeded();
  await dropdown.click();
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.click(`[role="option"]:has-text("${optionText}")`);
  await page.keyboard.press("Escape");
}

async function setInputNumberById(page, id, value) {
  const input = page.locator(`input[id="${id}"]`).first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await clearAndType(input, String(value));
}

async function clearInputNumberById(page, id) {
  const input = page.locator(`input[id="${id}"]`).first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await clearAndType(input, "");
}

async function selectYearByText(page, { id, yearText }) {
  const wrapper = page.locator(`#${id}`);
  await expect(wrapper).toBeVisible({ timeout: 10000 });
  await wrapper.locator("button").first().click();
  await page.waitForSelector(".p-yearpicker", { timeout: 10000 });
  await page.click(`.p-yearpicker .p-yearpicker-year:has-text("${yearText}")`);
}

async function selectMonthByText(page, { id, monthText }) {
  await page.locator(`#${id}`).click();
  await page.click(`li:has-text("${monthText}")`);
}

async function fillPlantingDetailItem(page, index) {
  await selectFromDropdown(page, {
    id: `specie-${index}`,
    optionText: "RRIT 251",
  });
  await setInputNumberById(page, `areaOfPlot-${index}`, 10.5);
  await setInputNumberById(page, `numberOfRubber-${index}`, 500);
  await setInputNumberById(page, `numberOfTapping-${index}`, 400);
  await setInputNumberById(page, `ageOfRubber-${index}`, 8);
  await selectYearByText(page, {
    id: `yearOfTapping-${index}`,
    yearText: "2022",
  });
  await selectMonthByText(page, {
    id: `monthOfTapping-${index}`,
    monthText: "มกราคม",
  });
  await setInputNumberById(page, `totalProduction-${index}`, 1500.5);
}

async function ensureStep3ValidAndGoNext(page) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    await getFormNextButton(page).click();

    const step4Heading = page.getByRole("heading", {
      name: "ตรวจสอบและยืนยันข้อมูล",
      exact: true,
    });
    if (await step4Heading.isVisible()) return;

    const errorAlert = getErrorAlert(page);
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    const errorText = await errorAlert.innerText();

    if (errorText.includes("กรุณาเพิ่มรายละเอียดการปลูกอย่างน้อย 1 รายการ")) {
      await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
      continue;
    }

    if (errorText.includes("กรุณาเลือกพันธุ์ยางพารา")) {
      await selectFromDropdown(page, {
        id: "specie-0",
        optionText: "RRIT 251",
      });
      continue;
    }

    if (errorText.includes("กรุณากรอกพื้นที่แปลง")) {
      await setInputNumberById(page, "areaOfPlot-0", 10.5);
      continue;
    }

    if (errorText.includes("กรุณากรอกจำนวนต้นยางทั้งหมด")) {
      await setInputNumberById(page, "numberOfRubber-0", 500);
      continue;
    }

    if (errorText.includes("กรุณากรอกจำนวนต้นกรีดที่กรีดได้")) {
      await setInputNumberById(page, "numberOfTapping-0", 400);
      continue;
    }

    if (errorText.includes("กรุณากรอกอายุต้นยาง")) {
      await setInputNumberById(page, "ageOfRubber-0", 8);
      continue;
    }

    if (errorText.includes("กรุณาเลือกปีที่เริ่มกรีด")) {
      const yearWrapper = page.locator("#yearOfTapping-0");
      await expect(yearWrapper).toBeVisible({ timeout: 10000 });
      await yearWrapper.locator("button").first().click();
      await page.waitForSelector(".p-yearpicker", { timeout: 10000 });
      await page.click('.p-yearpicker .p-yearpicker-year:has-text("2022")');
      continue;
    }

    if (errorText.includes("กรุณาเลือกเดือนที่เริ่มกรีด")) {
      await page.locator("#monthOfTapping-0").click();
      await page.click('li:has-text("มกราคม")');
      continue;
    }

    if (errorText.includes("กรุณากรอกผลผลิตรวม")) {
      await setInputNumberById(page, "totalProduction-0", 1500.5);
      continue;
    }

    if (attempt === 6) {
      throw new Error(`Unrecognized Step 3 validation error: ${errorText}`);
    }
  }
}

test.describe("Farmer Applications Edit — Part 3 (Step 3: รายละเอียดการปลูก)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await gotoEditStep3(page);
  });

  test("TC-027: โหลดรายละเอียดการปลูกที่มีอยู่", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("รายการที่ 1")).toBeVisible();

    const specieInput = getAutoCompleteInput(page, "specie-0");
    await expect(specieInput).toBeVisible();
  });

  test("TC-028: เพิ่มรายการปลูกใหม่ และกรอกครบถ้วนแล้วไป Step 4 ได้", async ({
    page,
  }) => {
    const deleteButtons = page.getByRole("button", { name: "ลบรายการ" });
    const initialDeleteCount = await deleteButtons.count();

    await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
    await expect(page.getByText("รายการที่ 2")).toBeVisible({ timeout: 10000 });

    const deleteCountAfterAdd = await deleteButtons.count();
    expect(deleteCountAfterAdd).toBeGreaterThan(initialDeleteCount);

    await fillPlantingDetailItem(page, 1);

    await getFormNextButton(page).click();
    await expect(
      page.getByRole("heading", {
        name: "ตรวจสอบและยืนยันข้อมูล",
        exact: true,
      }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-029: ลบรายการปลูกที่มีอยู่ 1 รายการ", async ({ page }) => {
    // The UI only shows the delete button when there are 2+ items.
    await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
    await expect(page.getByText("รายการที่ 2")).toBeVisible({ timeout: 10000 });

    const deleteButtons = page.getByRole("button", { name: "ลบรายการ" });
    await expect(deleteButtons).toHaveCount(2);

    // Delete the existing (first) item.
    await deleteButtons.first().click();

    // The remaining item becomes "รายการที่ 1", so "รายการที่ 2" should disappear.
    await expect(page.getByText("รายการที่ 2")).toHaveCount(0);
  });

  test("TC-030: ลบรายการปลูกที่เพิ่งเพิ่ม", async ({ page }) => {
    await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
    await expect(page.getByText("รายการที่ 2")).toBeVisible({ timeout: 10000 });

    const deleteButtons = page.getByRole("button", { name: "ลบรายการ" });
    const before = await deleteButtons.count();
    await expect(before).toBeGreaterThan(1);

    await deleteButtons.nth(before - 1).click();
    await expect(page.getByText("รายการที่ 2")).toHaveCount(0);
  });

  test("TC-031: ลบจนไม่เหลือรายการปลูก แล้วกดถัดไป", async ({ page }) => {
    // The UI hides the delete button when only 1 item remains.
    // To validate the empty-state rule, intercept the farm-details API
    // so Step 3 starts with 0 plantingDetails.
    await page.route(
      /\/api\/v1\/rubber-farms\/\d+$/,
      async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        json.plantingDetails = [];
        await route.fulfill({
          status: response.status(),
          headers: {
            ...response.headers(),
            "content-type": "application/json",
          },
          body: JSON.stringify(json),
        });
      },
      { times: 1 },
    );

    await gotoEditStep3(page);

    await expect(page.getByText("รายการที่ 1")).toHaveCount(0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "กรุณาเพิ่มรายละเอียดการปลูกอย่างน้อย 1 รายการ",
      }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-032: ไม่เลือกพันธุ์ยางพารา แล้วกดถัดไป", async ({ page }) => {
    // In edit mode, existing data is often prefilled. Clearing the AutoComplete
    // input text may not update the underlying state, so we instead:
    // 1) add a new (empty) planting item
    // 2) delete the prefilled item
    // Now the remaining (empty) item becomes "รายการที่ 1".
    await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
    await expect(page.getByText("รายการที่ 2")).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "ลบรายการ" }).first().click();
    await expect(page.getByText("รายการที่ 2")).toHaveCount(0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณาเลือกพันธุ์ยางพารา",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true }),
    ).toBeVisible();
  });

  test("TC-033: ไม่กรอกพื้นที่แปลง แล้วกดถัดไป", async ({ page }) => {
    await clearInputNumberById(page, "areaOfPlot-0");

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกพื้นที่แปลง",
      }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-034: กรอกพื้นที่แปลงเป็น 0 แล้วกดถัดไป", async ({ page }) => {
    await setInputNumberById(page, "areaOfPlot-0", 0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกพื้นที่แปลงให้ถูกต้อง",
      }),
    ).toBeVisible();
  });

  test("TC-035: ไม่กรอกจำนวนต้นยางทั้งหมด แล้วกดถัดไป", async ({ page }) => {
    await clearInputNumberById(page, "numberOfRubber-0");

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกจำนวนต้นยางทั้งหมด",
      }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-036: กรอกจำนวนต้นยางทั้งหมดเป็น 0 แล้วกดถัดไป", async ({ page }) => {
    await setInputNumberById(page, "numberOfRubber-0", 0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกจำนวนต้นยางทั้งหมดให้ถูกต้อง",
      }),
    ).toBeVisible();
  });

  test("TC-037: กดปุ่มย้อนกลับจาก Step 3 กลับ Step 2", async ({ page }) => {
    await getFormBackButton(page).click();
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true }),
    ).toBeVisible({ timeout: 10000 });

    const villageInput = page
      .locator('input[name="villageName"]')
      .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
      .first();
    await expect(villageInput).toBeVisible({ timeout: 10000 });
    await expect(villageInput).not.toHaveValue("");
  });

  test("TC-038: กรอกข้อมูล Step 3 ถูกต้องแล้วไป Step 4", async ({ page }) => {
    await ensureStep3ValidAndGoNext(page);
    await expect(
      page.getByRole("heading", {
        name: "ตรวจสอบและยืนยันข้อมูล",
        exact: true,
      }),
    ).toBeVisible({ timeout: 10000 });
  });
});
