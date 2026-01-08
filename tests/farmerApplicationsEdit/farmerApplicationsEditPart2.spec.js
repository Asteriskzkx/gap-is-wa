const { test, expect } = require("@playwright/test");

const USER_WITH_FARMS = {
  email: process.env.E2E_TEST_USER_EMAIL,
  password: process.env.E2E_TEST_USER_PASSWORD,
};

function getErrorAlert(page) {
  return page.locator(".bg-red-50");
}

async function clearAndType(locator, value) {
  await locator.click();
  await locator.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await locator.press("Backspace");
  if (value !== undefined && value !== null && String(value).length > 0) {
    await locator.type(String(value));
  }
}

async function selectFromAutoCompleteByTyping(page, { name, query, option }) {
  const input = page.locator(`input[name="${name}"]`).first();
  await expect(input).toBeVisible({ timeout: 10000 });

  await input.click();
  await clearAndType(input, query);

  // Ensure suggestions panel is open (more reliable than relying on input focus).
  const dropdownButton = page
    .locator(`#${name}`)
    .locator("button.p-autocomplete-dropdown")
    .first();

  // PrimeReact overlays can re-render while we click; add a small retry loop.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await dropdownButton.click();

    const panel = page.locator(".p-autocomplete-panel:visible").first();
    await expect(panel).toBeVisible({ timeout: 10000 });

    const desiredOption = panel
      .getByRole("option", { name: option, exact: true })
      .first();
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Login as farmer (shared from Part 1)
 */
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

/**
 * Navigate to edit page and select a farm (complete Step 1)
 */
async function navigateAndSelectFarm(page) {
  await page.goto("/farmer/applications/edit", {
    waitUntil: "domcontentloaded",
  });

  // Wait for table to load
  const step1Table = page.locator(".primary-datatable-wrapper");
  await expect(step1Table).toBeVisible({ timeout: 10000 });

  // Select first farm row
  const firstRow = step1Table.locator("tbody tr").first();
  await firstRow.click();
  await expect(firstRow).toHaveClass(/p-highlight/);

  // Click next to go to Step 2
  const nextButton = page.getByRole("button", { name: /^ถัดไป$/ });
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  // Wait for Step 2 to load
  await expect(
    page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
  ).toBeVisible({ timeout: 10000 });
}

/**
 * Get form "ถัดไป" button (avoids collision with paginator)
 */
function getFormNextButton(page) {
  return page.getByRole("button", { name: /^ถัดไป$/ });
}

/**
 * Get form "ย้อนกลับ" button
 */
function getFormBackButton(page) {
  return page.getByRole("button", { name: "ย้อนกลับ" });
}

/**
 * Fill all required Step 2 fields with valid data
 */
async function fillStep2ValidData(page) {
  // Fill basic address fields (assuming they're prefilled, just verify or update)
  const villageInput = page
    .locator('input[name="villageName"]')
    .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
    .first();
  const mooInput = page
    .locator("#moo")
    .or(page.locator('input[name="moo"]'))
    .or(page.locator('input[inputmode="numeric"]'))
    .first();

  // Ensure they have values
  const villageValue = await villageInput.inputValue();
  if (!villageValue) {
    await villageInput.fill("หมู่บ้านทดสอบ");
  }

  const mooValue = await mooInput.inputValue();
  if (!mooValue || mooValue === "0") {
    await clearAndType(mooInput, "5");
  }

  // Road and alley
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

  // Province/amphure/tambon should already be prefilled in edit mode.
  // Verify at least province is selected
  const provinceInput = page.locator('input[name="provinceId"]').first();
  const provinceValue = await provinceInput.inputValue();
  if (!provinceValue) {
    // If empty, select one
    await selectFromAutoCompleteByTyping(page, {
      name: "provinceId",
      query: "ก",
      option: /.+/,
    });

    // Amphure
    const amphureInput = page.locator('input[name="amphureId"]').first();
    await expect(amphureInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#amphureId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const amphureFirstOption = page.locator('[role="option"]:visible').first();
    await expect(amphureFirstOption).toBeVisible({ timeout: 10000 });
    await amphureFirstOption.click();

    // Tambon
    const tambonInput = page.locator('input[name="tambonId"]').first();
    await expect(tambonInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#tambonId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const tambonFirstOption = page.locator('[role="option"]:visible').first();
    await expect(tambonFirstOption).toBeVisible({ timeout: 10000 });
    await tambonFirstOption.click();
  }
}

// ============================================================================
// Test Suite: Step 2 (ข้อมูลสวนยาง)
// ============================================================================

test.describe("Farmer Applications Edit — Part 2 (Step 2: ข้อมูลสวนยาง)", () => {
  test.describe.configure({ mode: "serial" });

  test("TC-013: โหลดข้อมูลสวนยางเดิมขึ้นฟอร์ม (prefill)", async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Step 2 should now be visible with prefilled data
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
    ).toBeVisible();

    // Check that at least villageName has a value (prefilled)
    const villageInput = page
      .locator('input[name="villageName"]')
      .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
      .first();
    await expect(villageInput).not.toHaveValue("", { timeout: 10000 });

    // Check moo has a numeric value
    const mooInput = page
      .locator("#moo")
      .or(page.locator('input[name="moo"]'))
      .or(page.locator('input[inputmode="numeric"]'))
      .first();
    await expect(mooInput).not.toHaveValue("", { timeout: 10000 });
    const mooValue = await mooInput.inputValue();
    expect(parseInt(mooValue, 10) || 0).toBeGreaterThan(0);

    // Check province/amphure/tambon are prefilled
    const provinceInput = page.locator('input[name="provinceId"]').first();
    await expect(provinceInput).not.toHaveValue("", { timeout: 10000 });
  });

  test('TC-014: ล้าง "หมู่บ้าน/ชุมชน" แล้วกด "ถัดไป" — แสดง error', async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    const villageInput = page
      .locator('input[name="villageName"]')
      .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
      .first();
    await villageInput.clear();
    await expect(villageInput).toHaveValue("");

    const nextButton = getFormNextButton(page);
    await nextButton.click();

    await expect(page.getByText(/กรุณากรอกข้อมูลสวนยางให้ครบถ้วน/)).toBeVisible(
      { timeout: 5000 }
    );
  });

  test('TC-015: ล้าง "หมู่ที่" (InputNumber) แล้วกด "ถัดไป" — แสดง error', async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Clear moo field
    const mooInput = page
      .locator("#moo")
      .or(page.locator('input[name="moo"]'))
      .or(page.locator('input[inputmode="numeric"]'))
      .first();
    await clearAndType(mooInput, "");

    // PrimeReact InputNumber can normalize to "0"/""; we only care it fails validation.
    await mooInput.blur();

    const nextButton = getFormNextButton(page);
    await nextButton.click();

    await expect(getErrorAlert(page)).toContainText(
      /กรุณากรอกข้อมูลสวนยางให้ครบถ้วน/,
      { timeout: 5000 }
    );
  });

  test('TC-016: ล้าง "ถนน" แล้วกด "ถัดไป" — แสดง error', async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    const roadInput = page
      .locator('input[name="road"]')
      .or(page.getByLabel("ถนน"))
      .first();
    await roadInput.clear();
    await expect(roadInput).toHaveValue("");

    const nextButton = getFormNextButton(page);
    await nextButton.click();

    await expect(getErrorAlert(page)).toContainText(
      /กรุณากรอกข้อมูลสวนยางให้ครบถ้วน/,
      { timeout: 5000 }
    );
  });

  test('TC-017: ล้าง "ซอย" แล้วกด "ถัดไป" — แสดง error', async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    const alleyInput = page
      .locator('input[name="alley"]')
      .or(page.getByLabel("ซอย"))
      .first();
    await alleyInput.clear();
    await expect(alleyInput).toHaveValue("");

    const nextButton = getFormNextButton(page);
    await nextButton.click();

    await expect(getErrorAlert(page)).toContainText(
      /กรุณากรอกข้อมูลสวนยางให้ครบถ้วน/,
      { timeout: 5000 }
    );
  });

  test("TC-018: ช่องจังหวัด/อำเภอ/ตำบล แสดงค่าเดิมและโต้ตอบได้", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    const provinceInput = page.locator('input[name="provinceId"]').first();
    const amphureInput = page.locator('input[name="amphureId"]').first();
    const tambonInput = page.locator('input[name="tambonId"]').first();

    await expect(provinceInput).not.toHaveValue("", { timeout: 10000 });
    await expect(amphureInput).not.toHaveValue("", { timeout: 10000 });
    await expect(tambonInput).not.toHaveValue("", { timeout: 10000 });

    // Open each listbox once to ensure it's interactive
    // PrimeReact AutoComplete reliably opens via its dropdown button.
    const provinceWidget = page.locator("#provinceId").first();
    await provinceWidget.locator("button.p-autocomplete-dropdown").click();
    await expect(page.locator("#provinceId_list")).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("Escape");

    const amphureWidget = page.locator("#amphureId").first();
    await amphureWidget.locator("button.p-autocomplete-dropdown").click();
    await expect(page.locator("#amphureId_list")).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("Escape");

    const tambonWidget = page.locator("#tambonId").first();
    await tambonWidget.locator("button.p-autocomplete-dropdown").click();
    await expect(page.locator("#tambonId_list")).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("Escape");
  });

  test("TC-019: รูปแบบการจำหน่าย (productDistributionType) disabled ในโหมดแก้ไข", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Find the productDistributionType dropdown (Dropdown component)
    const distributionDropdown = page
      .locator("#productDistributionType")
      .first();
    await expect(distributionDropdown).toHaveClass(/p-disabled/);
  });

  test("TC-020: เปลี่ยนจังหวัดแล้วสามารถเลือกอำเภอ/ตำบลใหม่ได้", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    await selectFromAutoCompleteByTyping(page, {
      name: "provinceId",
      query: "เชียง",
      option: "เชียงใหม่",
    });

    const amphureInput = page.locator('input[name="amphureId"]').first();
    await expect(amphureInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#amphureId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const amphureFirstOption = page.locator('[role="option"]:visible').first();
    await expect(amphureFirstOption).toBeVisible({ timeout: 10000 });
    await amphureFirstOption.click();

    const tambonInput = page.locator('input[name="tambonId"]').first();
    await expect(tambonInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#tambonId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const tambonFirstOption = page.locator('[role="option"]:visible').first();
    await expect(tambonFirstOption).toBeVisible({ timeout: 10000 });
    await tambonFirstOption.click();
  });

  test("TC-021: เปลี่ยนจังหวัดแล้วเลือกอำเภอ/ตำบลใหม่จนผ่านได้", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Fill all other required fields first
    await fillStep2ValidData(page);

    // Now change province and complete amphure/tambon
    await selectFromAutoCompleteByTyping(page, {
      name: "provinceId",
      query: "เชียง",
      option: "เชียงใหม่",
    });

    const amphureInput = page.locator('input[name="amphureId"]').first();
    await expect(amphureInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#amphureId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const amphureFirstOption = page.locator('[role="option"]:visible').first();
    await expect(amphureFirstOption).toBeVisible({ timeout: 10000 });
    await amphureFirstOption.click();

    const tambonInput = page.locator('input[name="tambonId"]').first();
    await expect(tambonInput).toBeEnabled({ timeout: 10000 });
    await page
      .locator("#tambonId")
      .locator("button.p-autocomplete-dropdown")
      .first()
      .click();
    const tambonFirstOption = page.locator('[role="option"]:visible').first();
    await expect(tambonFirstOption).toBeVisible({ timeout: 10000 });
    await tambonFirstOption.click();

    // Now try next
    const nextButton = getFormNextButton(page);
    await nextButton.click();

    // Should proceed to Step 3
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-022: แก้ไขตำแหน่งบนแผนที่ — marker และพิกัดถูกอัปเดต", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Wait for map to load
    const mapContainer = page.locator(".leaflet-container").first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Get current coordinates text before click
    const coordsTextBefore = await page
      .locator("text=/พิกัด:|Coordinates:/i")
      .first()
      .textContent();

    // Click on map (use Leaflet's center or a known position)
    await mapContainer.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);

    // Check that coordinates text changed
    const coordsTextAfter = await page
      .locator("text=/พิกัด:|Coordinates:/i")
      .first()
      .textContent();

    expect(coordsTextAfter).not.toBe(coordsTextBefore);

    // Marker should be visible (there's always a marker in edit mode)
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible();
  });

  test("TC-023: กด 'ย้อนกลับ' จาก Step 2 กลับ Step 1 — สวนยางที่เลือกยังคงถูกเลือก", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Now in Step 2
    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
    ).toBeVisible();

    const backButton = getFormBackButton(page);
    await backButton.click();

    // Should be back at Step 1
    await expect(
      page.getByRole("heading", { name: "เลือกสวนยางที่ต้องการแก้ไข" })
    ).toBeVisible({ timeout: 5000 });

    // The selected farm should still be highlighted
    const step1Table = page.locator(".primary-datatable-wrapper");
    const selectedRow = step1Table.locator("tbody tr.p-highlight").first();
    await expect(selectedRow).toBeVisible();
  });

  test("TC-024: กรอกข้อมูล Step 2 ถูกต้องแล้วไป Step 3", async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Fill all required Step 2 fields
    await fillStep2ValidData(page);

    const nextButton = getFormNextButton(page);
    await nextButton.click();

    // Should proceed to Step 3
    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" })
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-025: ดึงข้อมูลสวนยางล้มเหลว — แสดง error", async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);

    // Intercept the farms list API to force failure (deterministic)
    await page.route(/\/api\/v1\/rubber-farms\?/, (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/farmer/applications/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "เลือกสวนยางที่ต้องการแก้ไข" })
    ).toBeVisible({ timeout: 10000 });

    await expect(getErrorAlert(page)).toContainText(
      /ไม่สามารถดึงข้อมูลสวนยางได้/,
      { timeout: 20000 }
    );
  });

  test("TC-026: กลับมาที่ Step 2 แล้วข้อมูลยังคงอยู่", async ({ page }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);
    await navigateAndSelectFarm(page);

    // Modify villageName
    const villageInput = page
      .locator('input[name="villageName"]')
      .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
      .first();
    const originalValue = await villageInput.inputValue();
    const newValue = originalValue + " - แก้ไข";
    await villageInput.clear();
    await villageInput.fill(newValue);
    await expect(villageInput).toHaveValue(newValue);

    // Fill other fields and go to Step 3
    await fillStep2ValidData(page);
    const nextButton = getFormNextButton(page);
    await nextButton.click();

    await expect(
      page.getByRole("heading", { name: "รายละเอียดการปลูก" })
    ).toBeVisible({ timeout: 10000 });

    // Go back to Step 2
    const backButton = getFormBackButton(page);
    await backButton.click();

    await expect(
      page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
    ).toBeVisible({ timeout: 5000 });

    // Check that modified value is still there
    const villageInputAfter = page
      .locator('input[name="villageName"]')
      .or(page.getByLabel("หมู่บ้าน/ชุมชน"))
      .first();
    await expect(villageInputAfter).toHaveValue(newValue);
  });
});
