const { test, expect } = require("@playwright/test");

const USER_WITH_FARMS = {
  email: process.env.E2E_TEST_USER_EMAIL,
  password: process.env.E2E_TEST_USER_PASSWORD,
};

function getFormNextButton(page) {
  return page.getByRole("button", { name: /^ถัดไป$/ });
}

function getSubmitButton(page) {
  return page.getByRole("button", {
    name: /^(บันทึกและส่งข้อมูล|กำลังบันทึก\.\.\.)$/,
  });
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
  await gotoEditStep1(page);

  const step1Table = page.locator(".primary-datatable-wrapper");
  const firstRow = step1Table.locator("tbody tr").first();
  await firstRow.click();
  await expect(firstRow).toHaveClass(/p-highlight/);

  await getFormNextButton(page).click();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลสวนยาง", exact: true })
  ).toBeVisible({ timeout: 10000 });

  // Step 2 -> Step 3
  await getFormNextButton(page).click();
  await expect(
    page.getByRole("heading", { name: "รายละเอียดการปลูก", exact: true })
  ).toBeVisible({ timeout: 10000 });

  // Step 3 -> Step 4 (use the same auto-heal behavior by clicking next until success)
  for (let attempt = 1; attempt <= 6; attempt++) {
    await getFormNextButton(page).click();

    const step4Heading = page.getByRole("heading", {
      name: "ตรวจสอบและยืนยันข้อมูล",
      exact: true,
    });
    if (await step4Heading.isVisible()) break;

    const errorAlert = page.locator(".bg-red-50");
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.innerText();

      if (errorText.includes("กรุณาเพิ่มรายละเอียดการปลูกอย่างน้อย 1 รายการ")) {
        await page.getByRole("button", { name: "เพิ่มรายการปลูก" }).click();
        continue;
      }

      if (errorText.includes("กรุณาเลือกพันธุ์ยางพารา")) {
        // open dropdown for specie-0 and choose a known option
        await page.locator("#specie-0 button.p-autocomplete-dropdown").click();
        const panel = page.locator(".p-autocomplete-panel:visible").first();
        await expect(panel).toBeVisible({ timeout: 10000 });
        await panel.getByRole("option", { name: "RRIT 251" }).first().click();
        continue;
      }

      const fillNumber = async (id, value) => {
        const input = page.locator(`input[id="${id}"]`).first();
        await expect(input).toBeVisible({ timeout: 10000 });
        await input.click();
        await input.press(
          process.platform === "darwin" ? "Meta+A" : "Control+A"
        );
        await input.press("Backspace");
        await input.type(String(value));
      };

      if (errorText.includes("กรุณากรอกพื้นที่แปลง")) {
        await fillNumber("areaOfPlot-0", 10.5);
        continue;
      }
      if (errorText.includes("กรุณากรอกจำนวนต้นยางทั้งหมด")) {
        await fillNumber("numberOfRubber-0", 500);
        continue;
      }
      if (errorText.includes("กรุณากรอกจำนวนต้นกรีดที่กรีดได้")) {
        await fillNumber("numberOfTapping-0", 400);
        continue;
      }
      if (errorText.includes("กรุณากรอกอายุต้นยาง")) {
        await fillNumber("ageOfRubber-0", 8);
        continue;
      }
      if (errorText.includes("กรุณาเลือกปีที่เริ่มกรีด")) {
        const yearWrapper = page.locator("#yearOfTapping-0");
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
        await fillNumber("totalProduction-0", 1500.5);
        continue;
      }
    }
  }

  await expect(
    page.getByRole("heading", {
      name: "ตรวจสอบและยืนยันข้อมูล",
      exact: true,
    })
  ).toBeVisible({ timeout: 10000 });
}

test.describe("Farmer Applications Edit — Part 5 (UI/UX และ Navigation)", () => {
  test.describe.configure({ mode: "serial" });

  test("TC-045: แสดง Step Indicator 4 steps พร้อมชื่อขั้นตอน", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoEditStep1(page);

    await expect(page.getByText("เลือกสวนยาง", { exact: true })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("ข้อมูลสวนยาง", { exact: true })).toBeVisible();
    await expect(
      page.getByText("รายละเอียดการปลูก", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("ยืนยันข้อมูล", { exact: true })).toBeVisible();
  });

  test("TC-046: Step 1 ไม่มีปุ่ม “ย้อนกลับ”", async ({ page }) => {
    await gotoEditStep1(page);
    await expect(page.getByRole("button", { name: "ย้อนกลับ" })).toHaveCount(0);
  });

  test("TC-047: Step 4 แสดงปุ่ม submit “บันทึกและส่งข้อมูล”", async ({
    page,
  }) => {
    await gotoEditStep4(page);
    await expect(getSubmitButton(page)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /^ถัดไป$/ })).toHaveCount(0);
  });

  test("TC-048: Responsive design (desktop/tablet/mobile)", async ({
    page,
  }) => {
    await loginAsFarmer(page, USER_WITH_FARMS);

    const viewports = [
      { width: 1280, height: 720 },
      { width: 820, height: 1180 },
      { width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto("/farmer/applications/edit", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.locator(".primary-datatable-wrapper")).toBeVisible({
        timeout: 10000,
      });

      if (vp.width < 768) {
        await expect(page.getByText(/ขั้นตอนที่ 1:/)).toBeVisible({
          timeout: 10000,
        });
      } else {
        await expect(
          page.getByText("ขั้นตอนที่ 1", { exact: true })
        ).toBeVisible({
          timeout: 10000,
        });
      }
    }
  });
});
