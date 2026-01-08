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
    page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
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
    page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true })
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

async function selectFromAutoCompleteByTyping(page, { name, query, option }) {
  const input = getAutoCompleteInput(page, name);
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.click();
  await clearAndType(input, query);

  const dropdownButton = page
    .locator(`#${name}`)
    .locator("button.p-autocomplete-dropdown")
    .first();

  for (let attempt = 1; attempt <= 3; attempt++) {
    await dropdownButton.click();

    const panel = page.locator(".p-autocomplete-panel:visible").first();
    await expect(panel).toBeVisible({ timeout: 10000 });

    const desiredOption = panel.getByRole("option", { name: option }).first();
    await expect(desiredOption).toBeVisible({ timeout: 10000 });

    try {
      await desiredOption.click({ timeout: 5000, force: true });
      await expect(panel).toBeHidden({ timeout: 10000 });
      return;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
}

async function setInputNumberById(page, id, value) {
  const input = page.locator(`input[id="${id}"]`).first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await clearAndType(input, String(value));
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
      await selectFromAutoCompleteByTyping(page, {
        name: "specie-0",
        query: "RR",
        option: "RRIT 251",
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

  test("TC-001: แสดงหน้ารายละเอียดการปลูกและมีอย่างน้อย 1 รายการ", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true })
    ).toBeVisible();
    await expect(page.getByText("รายการที่ 1")).toBeVisible();

    const specieInput = getAutoCompleteInput(page, "specie-0");
    await expect(specieInput).toBeVisible();
  });

  test("TC-002: ไม่เลือกพันธุ์ยางพารา — แสดง error รายการที่ 1", async ({
    page,
  }) => {
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
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true })
    ).toBeVisible();
  });

  test("TC-003: กรอกพื้นที่แปลง 0 — แสดง error รายการที่ 1", async ({
    page,
  }) => {
    await setInputNumberById(page, "areaOfPlot-0", 0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกพื้นที่แปลงให้ถูกต้อง",
      })
    ).toBeVisible();
  });

  test("TC-004: กรอกจำนวนต้นยางทั้งหมด 0 — แสดง error รายการที่ 1", async ({
    page,
  }) => {
    await setInputNumberById(page, "numberOfRubber-0", 0);

    await getFormNextButton(page).click();
    await expect(
      getErrorAlert(page).filter({
        hasText: "รายการที่ 1: กรุณากรอกจำนวนต้นยางทั้งหมดให้ถูกต้อง",
      })
    ).toBeVisible();
  });

  test("TC-005: เพิ่ม/ลบรายการปลูก (รายการที่ 2)", async ({ page }) => {
    await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
    await expect(page.getByText("รายการที่ 2")).toBeVisible({ timeout: 10000 });

    // When there are 2 items, there will be 2 "ลบรายการ" buttons.
    // Click the second one to remove item #2.
    await page.getByRole("button", { name: "ลบรายการ" }).nth(1).click();

    await expect(page.getByText("รายการที่ 2")).toHaveCount(0);
  });

  test("TC-006: กดปุ่มย้อนกลับจาก Step 3 กลับไป Step 2 และถัดไปกลับมาได้", async ({
    page,
  }) => {
    await getFormBackButton(page).click();
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
    ).toBeVisible({ timeout: 10000 });

    await ensureCanProceedFromStep2(page);
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-007: กดถัดไปจาก Step 3 ไป Step 4 (ตรวจสอบและยืนยันข้อมูล)", async ({
    page,
  }) => {
    await ensureStep3ValidAndGoNext(page);
    await expect(
      page.getByRole("heading", {
        name: "ตรวจสอบและยืนยันข้อมูล",
        exact: true,
      })
    ).toBeVisible({ timeout: 10000 });
  });
});
