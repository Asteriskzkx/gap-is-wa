const { test, expect } = require("@playwright/test");

const USER_WITH_FARMS = {
  email: process.env.E2E_TEST_USER_EMAIL,
  password: process.env.E2E_TEST_USER_PASSWORD,
};

function getErrorAlert(page) {
  return page.locator(".bg-red-50");
}

function getSuccessAlert(page) {
  return page.locator(".bg-green-50");
}

function getFormNextButton(page) {
  return page.getByRole("button", { name: /^ถัดไป$/ });
}

function getFormBackButton(page) {
  return page.getByRole("button", { name: "ย้อนกลับ" });
}

function getSubmitButton(page) {
  return page.getByRole("button", {
    name: /^(บันทึกและส่งข้อมูล|กำลังบันทึก\.\.\.)$/,
  });
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

async function setInputNumberById(page, id, value) {
  const input = page.locator(`input[id="${id}"]`).first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await clearAndType(input, String(value));
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

async function gotoEditStep1(page) {
  await loginAsFarmer(page, USER_WITH_FARMS);
  await page.goto("/farmer/applications/edit", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(".primary-datatable-wrapper")).toBeVisible({
    timeout: 10000,
  });
}

async function gotoEditStep4(page) {
  await loginAsFarmer(page, USER_WITH_FARMS);
  await navigateAndSelectFarm(page);
  await ensureCanProceedFromStep2(page);

  await expect(
    page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true }),
  ).toBeVisible({ timeout: 10000 });

  await ensureStep3ValidAndGoNext(page);

  await expect(
    page.getByRole("heading", { name: "ตรวจสอบและยืนยันข้อมูล", exact: true }),
  ).toBeVisible({ timeout: 10000 });
}

test.describe("Farmer Applications Edit — Part 4 (Step 4: ตรวจสอบและยืนยันข้อมูล)", () => {
  test.describe.configure({ mode: "serial" });

  test.describe("Step 4: ตรวจสอบและยืนยันข้อมูล", () => {
    test.beforeEach(async ({ page }) => {
      await gotoEditStep4(page);
    });

    test("TC-039: แสดงสรุปข้อมูลสวนยางและรายละเอียดการปลูก", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", {
          name: "ตรวจสอบและยืนยันข้อมูล",
          exact: true,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true }),
      ).toBeVisible();

      await expect(page.getByText("พันธุ์ยางพารา")).toBeVisible();

      const confirmCheckbox = page.locator('input[id="confirm"]');
      await expect(confirmCheckbox).toBeVisible();
      await expect(confirmCheckbox).not.toBeChecked();
    });

    test("TC-040: ไม่ tick checkbox แล้วยืนยันส่งข้อมูล", async ({ page }) => {
      const submitButton = getSubmitButton(page);
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      const errorAlert1 = getErrorAlert(page).filter({
        hasText: "กรุณายืนยันความถูกต้องของข้อมูลก่อนส่ง",
      });
      await expect(
        page.getByRole("heading", {
          name: "ตรวจสอบและยืนยันข้อมูล",
          exact: true,
        }),
      ).toBeVisible();
      await errorAlert1.scrollIntoViewIfNeeded();
      await expect(errorAlert1).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(3000);
    });

    test("TC-041: tick checkbox แล้วยืนยันส่งข้อมูลสำเร็จ", async ({
      page,
    }) => {
      await page.locator('input[id="confirm"]').scrollIntoViewIfNeeded();
      await page.check('input[id="confirm"]');
      await expect(page.locator('input[id="confirm"]')).toBeChecked();

      const submitButton = getSubmitButton(page);
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      await expect(
        page.getByRole("heading", {
          name: "ตรวจสอบและยืนยันข้อมูล",
          exact: true,
        }),
      ).toBeVisible();
      const successAlert = getSuccessAlert(page).filter({
        hasText: "อัปเดตข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าหลัก...",
      });
      await successAlert.scrollIntoViewIfNeeded();
      await expect(successAlert).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(3000);
    });

    test("TC-042: แสดง loading state ระหว่างส่งข้อมูล", async ({ page }) => {
      await page.route(
        "**/api/v1/rubber-farms/*/update-with-details",
        async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ rubberFarm: { version: 999 } }),
          });
        },
        { times: 1 },
      );

      await page.check('input[id="confirm"]');
      const submitButton = getSubmitButton(page);
      await submitButton.scrollIntoViewIfNeeded();
      await submitButton.click();

      await expect(getSubmitButton(page)).toBeDisabled();
      await expect(getSubmitButton(page)).toHaveText(/กำลังบันทึก/);
    });

    test("TC-043: ส่งข้อมูลล้มเหลว (ทั่วไป)", async ({ page }) => {
      await page.route(
        "**/api/v1/rubber-farms/*/update-with-details",
        async (route) => {
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
              message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
            }),
          });
        },
        { times: 1 },
      );

      await page.check('input[id="confirm"]');
      await getSubmitButton(page).click();

      const errorAlert2 = getErrorAlert(page).filter({
        hasText: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
      });
      await expect(
        page.getByRole("heading", {
          name: "ตรวจสอบและยืนยันข้อมูล",
          exact: true,
        }),
      ).toBeVisible();
      await errorAlert2.scrollIntoViewIfNeeded();
      await expect(errorAlert2).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(3000);
    });

    test("TC-044: ส่งข้อมูลชนกัน (ข้อมูลถูกแก้ไขโดยผู้อื่น)", async ({
      page,
    }) => {
      const conflictMessage =
        "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง";

      await page.route(
        "**/api/v1/rubber-farms/*/update-with-details",
        async (route) => {
          await route.fulfill({
            status: 409,
            contentType: "application/json",
            body: JSON.stringify({ userMessage: conflictMessage }),
          });
        },
        { times: 1 },
      );

      await page.check('input[id="confirm"]');
      await getSubmitButton(page).click();

      await expect(
        page.getByRole("heading", {
          name: "ตรวจสอบและยืนยันข้อมูล",
          exact: true,
        }),
      ).toBeVisible();
      const conflictAlert = page.getByText(conflictMessage);
      await conflictAlert.scrollIntoViewIfNeeded();
      await expect(conflictAlert).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(3000);
    });
  });
});
