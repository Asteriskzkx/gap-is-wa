import { test, expect } from "@playwright/test";

const PATH_PAGE = "/admin/user-management";
const PATH_API = "/api/v1/users";

// Mock user data
const mockUsers = [
  {
    userId: 1,
    name: "นายทดสอบ ระบบ",
    email: "admin@test.com",
    role: "ADMIN",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    userId: 2,
    name: "นางสาวผู้ใช้ ทดสอบ",
    email: "farmer@test.com",
    role: "FARMER",
    createdAt: "2025-01-02T00:00:00.000Z",
  },
];

const mockUsersFiltered = [
  {
    userId: 1,
    name: "นายทดสอบ ระบบ",
    email: "admin@test.com",
    role: "ADMIN",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

const mockNormalizedAdminUser = {
  userId: 1,
  email: "admin@test.com",
  role: "ADMIN",
  admin: {
    adminId: 1,
    namePrefix: "นาย",
    firstName: "ทดสอบ",
    lastName: "ระบบ",
    version: 0,
  },
};

async function loginAsAdmin(page, { email, password }) {
  // ตรวจสอบว่า credentials มีค่าหรือไม่
  if (!email || !password) {
    throw new Error(
      "Missing E2E_TEST_ADMIN_EMAIL or E2E_TEST_ADMIN_PASSWORD environment variables. " +
        "Please set them in your .env file or test configuration."
    );
  }

  // ไปหน้า login และรอให้โหลดเสร็จสมบูรณ์
  await page.goto("/", { waitUntil: "networkidle" });

  const roleGroup = page.locator('label[for="role"]').locator("..");
  const roleButtons = roleGroup.locator("button");
  await expect(roleButtons).toHaveCount(4);

  const adminRoleButton = page
    .getByRole("button", { name: /ผู้ดูแลระบบ/ })
    .first();
  if (await adminRoleButton.isVisible().catch(() => false)) {
    await adminRoleButton.click();
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

  // รอให้ JavaScript โหลดเสร็จก่อน submit
  await page.waitForLoadState("networkidle");

  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();

  // ใช้ Promise.all เพื่อกด submit และรอ navigation พร้อมกัน
  await Promise.all([
    page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 }),
    submitButton.click(),
  ]);
}

// ============================================================
// การเข้าถึงหน้า (TC-001 to TC-002)
// ============================================================
test.describe("การเข้าถึงหน้า", () => {
  test.beforeEach(async ({ page }) => {
    // เคลียร์ session ให้แน่ใจว่าไม่ login
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("TC-001 ต้อง login ก่อนเข้าใช้งาน", async ({ page }) => {
    // 1) เปิดหน้า /admin/user-management โดยไม่มี session
    await page.goto(PATH_PAGE);

    // 2) ระบบ redirect ไปหน้า /
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test("TC-002 แสดงหัวข้อและคำอธิบายหน้า", async ({ page }) => {
    // Login ก่อน
    await loginAsAdmin(page, {
      email: process.env.E2E_TEST_ADMIN_EMAIL,
      password: process.env.E2E_TEST_ADMIN_PASSWORD,
    });

    // 1) Login แล้วเปิดหน้า /admin/user-management
    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // 2) เห็น "จัดการผู้ใช้ในระบบ" และ "จัดการข้อมูลผู้ใช้ในระบบ เช่น การเพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้"
    await expect(page.getByText("จัดการผู้ใช้ในระบบ")).toBeVisible();
    await expect(
      page.getByText(
        "จัดการข้อมูลผู้ใช้ในระบบ เช่น การเพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้"
      )
    ).toBeVisible();
  });
});

// ============================================================
// รายการผู้ใช้: ตัวกรอง/ตาราง (TC-003 to TC-012)
// ============================================================
test.describe("รายการผู้ใช้: ตัวกรอง/ตาราง", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await loginAsAdmin(page, {
      email: process.env.E2E_TEST_ADMIN_EMAIL,
      password: process.env.E2E_TEST_ADMIN_PASSWORD,
    });
  });

  test("TC-003 แสดงส่วนตัวกรองและปุ่มการทำงาน", async ({ page }) => {
    // 1) เปิดหน้า
    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // เห็นช่องค้นหา placeholder "ค้นหาชื่อหรืออีเมล..."
    const searchInput = page.getByPlaceholder("ค้นหาชื่อหรืออีเมล...");
    await expect(searchInput).toBeVisible();

    // เห็น dropdown placeholder "เลือก Role"
    const roleDropdown = page
      .locator(".p-dropdown")
      .filter({ hasText: "เลือก Role" });
    await expect(roleDropdown).toBeVisible();

    // เห็นปุ่ม tooltip "ล้างตัวกรอง"
    const clearFilterButton = page
      .locator('button[class*="p-button"]')
      .filter({ has: page.locator(".pi-filter-slash") });
    await expect(clearFilterButton).toBeVisible();

    // เห็นปุ่ม "รีเฟรช"
    await expect(page.getByRole("button", { name: "รีเฟรช" })).toBeVisible();

    // เห็นปุ่ม "เพิ่มผู้ใช้"
    await expect(
      page.getByRole("button", { name: "เพิ่มผู้ใช้" })
    ).toBeVisible();
  });

  test("TC-004 แสดงตารางพร้อมคอลัมน์หลัก", async ({ page }) => {
    // Mock ให้มีข้อมูลอย่างน้อย 1 แถว
    await page.route(`${PATH_API}?*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
      });
    });

    // 1) เปิดหน้า
    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // เห็นหัวคอลัมน์: "ID", "Name", "Email", "Role", "Create Date"
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(table.locator("th").filter({ hasText: "ID" })).toBeVisible();
    await expect(table.locator("th").filter({ hasText: "Name" })).toBeVisible();
    await expect(
      table.locator("th").filter({ hasText: "Email" })
    ).toBeVisible();
    await expect(table.locator("th").filter({ hasText: "Role" })).toBeVisible();
    await expect(
      table.locator("th").filter({ hasText: "Create Date" })
    ).toBeVisible();
  });

  test("TC-005 แสดงข้อความว่างเมื่อไม่มีผู้ใช้", async ({ page }) => {
    // Mock ให้ users=[] และ total=0
    await page.route(`${PATH_API}?*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: [], total: 0 }),
      });
    });

    // 1) เปิดหน้า
    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // เห็นข้อความ "ไม่พบผู้ใช้ในระบบ."
    await expect(page.getByText("ไม่พบผู้ใช้ในระบบ.")).toBeVisible();

    // แสดง "แสดง 0 จาก 0 รายการ"
    await expect(page.getByText("แสดง 0 จาก 0 รายการ")).toBeVisible();
  });

  test("TC-006 ค้นหามีสถานะ debouncing", async ({ page }) => {
    // Mock API ให้ตอบช้า เพื่อให้เห็น debouncing indicator ชัดเจน
    await page.route(`${PATH_API}?*`, async (route) => {
      // หน่วงเวลาเพื่อให้เห็น debounce indicator
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
      });
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // รอให้หน้าโหลดข้อมูลเริ่มต้นเสร็จก่อน
    await page.waitForLoadState("networkidle");

    // 1) พิมพ์ในช่องค้นหา - ใช้ type แทน fill เพื่อให้เหมือนการพิมพ์จริง
    const searchInput = page.getByPlaceholder("ค้นหาชื่อหรืออีเมล...");
    await searchInput.type("test", { delay: 50 });

    // 2) เห็นข้อความ "กำลังรอค้นหา..." ระหว่างรอ debounce (timeout สั้นเพราะต้องจับทันที)
    await expect(page.getByText("กำลังรอค้นหา...")).toBeVisible({
      timeout: 2000,
    });
  });

  test("TC-007 ค้นหาแล้วตารางเปลี่ยนตามที่ mock", async ({ page }) => {
    // 1) mock ชุดข้อมูลเริ่มต้น
    await page.route(`${PATH_API}?*`, async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search");

      if (search && search.includes("admin")) {
        // 3) mock response ชุดใหม่หลัง debounce
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // รอข้อมูลเริ่มต้นโหลด
    await expect(page.getByText("admin@test.com")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 2) พิมพ์คำค้นหา
    const searchInput = page.getByPlaceholder("ค้นหาชื่อหรืออีเมล...");
    await searchInput.fill("admin");

    // รอ debounce และผลลัพธ์ - ใช้ waitForResponse แทน waitForTimeout
    await page.waitForResponse(
      (res) =>
        res.url().includes(PATH_API) && res.url().includes("search=admin")
    );

    // ตารางเปลี่ยนเป็นชุดข้อมูลตามที่ mock ไว้
    await expect(page.getByText("admin@test.com")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-008 เลือก role แล้วตารางเปลี่ยนตามที่ mock", async ({ page }) => {
    await page.route(`${PATH_API}?*`, async (route) => {
      const url = new URL(route.request().url());
      const role = url.searchParams.get("role");

      if (role === "ADMIN") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // รอข้อมูลเริ่มต้น
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 1) เลือก Role = ADMIN - ใช้ dropdown ที่มี placeholder "เลือก Role"
    const roleDropdown = page
      .locator(".p-dropdown")
      .filter({ hasText: /เลือก Role|BASIC|FARMER|AUDITOR|COMMITTEE|ADMIN/ })
      .first();
    await roleDropdown.click();

    // Start waiting for the filtered API response before clicking the option
    await Promise.all([
      page.waitForResponse((res) => res.url().includes(PATH_API) && res.url().includes("role=ADMIN")),
      page.getByRole("option", { name: "ADMIN", exact: true }).click(),
    ]);

    // 2) ตารางเปลี่ยนเป็นชุดข้อมูลตามที่ mock ไว้
    await expect(page.getByText("admin@test.com")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-009 กด 'ล้างตัวกรอง' แล้วกลับค่าเริ่มต้น", async ({ page }) => {
    let apiCallCount = 0;
    await page.route(`${PATH_API}?*`, async (route) => {
      apiCallCount++;
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search");
      const role = url.searchParams.get("role");

      if (search || role) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });

    // รอให้ข้อมูลเริ่มต้นโหลด
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 1) ตั้งค่าค้นหา
    const searchInput = page.getByPlaceholder("ค้นหาชื่อหรืออีเมล...");
    await searchInput.fill("admin");

    // รอ debounce + response
    await page.waitForTimeout(600);
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 5000,
    });

    // เลือก role
    const roleDropdown = page
      .locator(".p-dropdown")
      .filter({ hasText: /เลือก Role|BASIC|FARMER|AUDITOR|COMMITTEE|ADMIN/ })
      .first();
    await roleDropdown.click();
    await page.getByRole("option", { name: "ADMIN", exact: true }).click();
    await page.waitForTimeout(300);

    // 2) กดปุ่ม "ล้างตัวกรอง"
    const clearFilterButton = page
      .locator('button[class*="p-button"]')
      .filter({ has: page.locator(".pi-filter-slash") });
    await clearFilterButton.click();

    // รอให้ตารางกลับเป็นชุดเริ่มต้น - รอให้ farmer@test.com แสดงกลับมา
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 3) ช่องค้นหาถูกล้าง
    await expect(searchInput).toHaveValue("");
  });

  test("TC-010 กด 'รีเฟรช' แล้วดึงข้อมูลใหม่", async ({ page }) => {
    let callCount = 0;
    await page.route(`${PATH_API}?*`, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        // 1) mock response ชุดใหม่
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("admin@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 2) กดปุ่ม "รีเฟรช" และรอ response
    await Promise.all([
      page.waitForResponse((res) => res.url().includes(PATH_API)),
      page.getByRole("button", { name: "รีเฟรช" }).click(),
    ]);

    // ตารางอัปเดตตามชุดข้อมูลที่ mock ไว้
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("admin@test.com")).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-011 Pagination: เปลี่ยนจำนวนรายการต่อหน้า", async ({ page }) => {
    await page.route(`${PATH_API}?*`, async (route) => {
      const url = new URL(route.request().url());
      const take = url.searchParams.get("take");

      if (take === "25") {
        // mock ให้ชุดข้อมูลต่างจาก 10
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 1) เปลี่ยน rows เป็น 25
    const rowsDropdown = page.locator(".p-paginator .p-dropdown");
    await rowsDropdown.click();

    // รอและคลิก option พร้อมรอ response
    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes(PATH_API) && res.url().includes("take=25")
      ),
      page.getByRole("option", { name: "25" }).click(),
    ]);

    // ตารางอัปเดตตามชุดข้อมูลที่ mock ไว้
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-012 Sorting: คลิกหัวคอลัมน์ให้ลำดับเปลี่ยน", async ({ page }) => {
    let sortCallCount = 0;
    await page.route(`${PATH_API}?*`, async (route) => {
      const url = new URL(route.request().url());
      const sortField = url.searchParams.get("sortField");
      const sortOrder = url.searchParams.get("sortOrder");

      sortCallCount++;
      if (sortField === "createdAt" && sortOrder === "1") {
        // mock ให้ response ต่างกันเมื่อ sort ascending
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsersFiltered, total: 1 }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
        });
      }
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("farmer@test.com")).toBeVisible({
      timeout: 10000,
    });

    // 1) คลิกหัวคอลัมน์ "Create Date" และรอ response
    const createDateHeader = page
      .locator("th")
      .filter({ hasText: "Create Date" });
    await Promise.all([
      page.waitForResponse((res) => res.url().includes(PATH_API)),
      createDateHeader.click(),
    ]);

    // 2) ตารางเปลี่ยนลำดับตามที่ mock ไว้
    await expect(page.getByText("farmer@test.com")).not.toBeVisible({
      timeout: 10000,
    });
  });
});

// ============================================================
// เพิ่มผู้ใช้ใหม่ (Dialog "เพิ่มผู้ใช้ใหม่") (TC-013 to TC-017)
// ============================================================
test.describe("เพิ่มผู้ใช้ใหม่ (Dialog 'เพิ่มผู้ใช้ใหม่')", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await loginAsAdmin(page, {
      email: process.env.E2E_TEST_ADMIN_EMAIL,
      password: process.env.E2E_TEST_ADMIN_PASSWORD,
    });

    // Mock user list API
    await page.route(`${PATH_API}?*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
      });
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });
  });

  test("TC-013 เปิด dialog เพิ่มผู้ใช้ได้", async ({ page }) => {
    // 1) กดปุ่ม "เพิ่มผู้ใช้"
    await expect(page.getByRole("button", { name: "เพิ่มผู้ใช้" })).toBeEnabled();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();


    // เห็น dialog หัวข้อ "เพิ่มผู้ใช้ใหม่"
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: 'attached' });

   
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".p-dialog-title")).toContainText(
      "เพิ่มผู้ใช้ใหม่"
    );

    await page.waitForTimeout(500);

    const roleDropdown = dialog.getByRole('combobox').first();
    await expect (roleDropdown).toBeVisible();
  });

  test("TC-014 ปุ่ม 'บันทึก' disabled เมื่อกรอกไม่ครบ", async ({ page }) => {
    // 1) เปิด dialog โดยยังไม่เลือก Role/ไม่กรอกข้อมูล
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();

    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // ปุ่ม "บันทึก" disabled
    const saveButton = dialog.getByRole("button", { name: "บันทึก" });
    await expect(saveButton).toBeDisabled();
  });

  test("TC-015 สร้างผู้ใช้สำเร็จ (กรณี role=ADMIN)", async ({ page }) => {
    // Mock POST /api/v1/users ให้สำเร็จ
    await page.route(PATH_API, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ userId: 3 }),
        });
      } else {
        await route.continue();
      }
    });

    // 1) กดเปิด dialog
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // 2) เลือก Role = ADMIN
    const roleDropdown = dialog.locator(".p-dropdown").first();
    await roleDropdown.click();
    await page.getByRole("option", { name: "ADMIN" }).click();

    // 3) กรอก คำนำหน้า/ชื่อ/นามสกุล/อีเมล
    // เลือกคำนำหน้า
    const prefixDropdown = dialog.locator(".p-dropdown").nth(1);
    await prefixDropdown.click();
    await page.getByRole("option", { name: "นาย" }).click();

    
    // กรอกชื่อ
    await dialog.getByLabel("ชื่อ").fill("ทดสอบใหม่");
    await dialog.getByLabel("นามสกุล").fill("ผู้ใช้ใหม่");
    await dialog.getByLabel("อีเมล").fill("newuser@test.com");


    // 4) กด "บันทึก"
    const saveButton = dialog.getByRole("button", { name: "บันทึก" });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // เห็น toast "สร้างผู้ใช้สำเร็จ"
    await expect(page.getByText("สร้างผู้ใช้สำเร็จ")).toBeVisible({
      timeout: 10000,
    });

    // และ dialog ปิดลง
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test("TC-016 สร้างผู้ใช้ไม่สำเร็จ (API ตอบ error)", async ({ page }) => {
    // Mock POST ให้ error
    await page.route(PATH_API, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal Server Error" }),
        });
      } else {
        await route.continue();
      }
    });

    // 1) กดเปิด dialog
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // 2) กรอกข้อมูลครบ
    const roleDropdown = dialog.locator(".p-dropdown").first();
    await roleDropdown.click();
    await page.getByRole("option", { name: "ADMIN" }).click();

    const prefixDropdown = dialog.locator(".p-dropdown").nth(1);
    await prefixDropdown.click();
    await page.getByRole("option", { name: "นาย" }).click();

    await dialog.getByLabel("ชื่อ").fill("ทดสอบ");
    await dialog.getByLabel("นามสกุล").fill("ล้มเหลว");
    await dialog.getByLabel("อีเมล").fill("fail@test.com");

    // 3) กด "บันทึก"
    const saveButton = dialog.getByRole("button", { name: "บันทึก" });
    await saveButton.click();

    // เห็น toast "สร้างผู้ใช้ไม่สำเร็จ"
    await expect(page.getByText("สร้างผู้ใช้ไม่สำเร็จ")).toBeVisible({
      timeout: 10000,
    });

    // และ dialog ยังเปิดอยู่
    await expect(dialog).toBeVisible({ timeout: 10000 });
  });

  test("TC-017 ปิด dialog ด้วยปุ่ม 'ยกเลิก'", async ({ page }) => {
    // 1) เปิด dialog
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "เพิ่มผู้ใช้" }).click();
    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // 2) กด "ยกเลิก"
    await dialog.getByRole("button", { name: "ยกเลิก" }).click();

    // dialog ปิดลง
    await expect(dialog).not.toBeVisible();
  });
});

// ============================================================
// เมนูต่อแถว (Edit/Delete) และการลบผู้ใช้ (TC-018 to TC-022)
// ============================================================
test.describe("เมนูต่อแถว (Edit/Delete) และการลบผู้ใช้", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await loginAsAdmin(page, {
      email: process.env.E2E_TEST_ADMIN_EMAIL,
      password: process.env.E2E_TEST_ADMIN_PASSWORD,
    });

    // Mock user list API
    await page.route(`${PATH_API}?*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: mockUsers, total: mockUsers.length }),
      });
    });

    await page.goto(PATH_PAGE, { waitUntil: "domcontentloaded" });
  });

  test("TC-018 เปิดเมนูต่อแถวและเห็นตัวเลือก Edit/Delete", async ({ page }) => {
    // รอให้ตารางโหลด
    await expect(page.getByText("admin@test.com")).toBeVisible();

    // 1) กดปุ่มจุดสามจุดในแถวแรก
    const moreButton = page
      .locator("tbody tr")
      .first()
      .locator("button")
      .filter({ has: page.locator(".pi-ellipsis-v") });
    await moreButton.click();

    // 2) เห็นเมนูรายการ "Edit" และ "Delete"
    const menu = page.locator(".p-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByText("Edit")).toBeVisible();
    await expect(menu.getByText("Delete")).toBeVisible();
  });

  test("TC-019 กด Delete แล้วเห็น dialog ยืนยันการลบ", async ({ page }) => {
    await expect(page.getByText("admin@test.com")).toBeVisible();

    // 1) เปิดเมนู
    const moreButton = page
      .locator("tbody tr")
      .first()
      .locator("button")
      .filter({ has: page.locator(".pi-ellipsis-v") });
    await moreButton.click();

    // 2) กด "Delete"
    await page.locator(".p-menu").getByText("Delete").click();

    // เห็น dialog หัวข้อ "ยืนยันการลบ"
    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".p-dialog-title")).toContainText(
      "ยืนยันการลบ"
    );

    // และข้อความ "ต้องการลบผู้ใช้ชื่อ : … ใช่ไหม?"
    await expect(dialog.getByText(/ต้องการลบผู้ใช้ชื่อ/)).toBeVisible();
    await expect(dialog.getByText(/ใช่ไหม/)).toBeVisible();

    // พร้อมปุ่ม "ยกเลิก", "ลบ"
    await expect(dialog.getByRole("button", { name: "ยกเลิก" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "ลบ" })).toBeVisible();
  });

  test("TC-020 ยกเลิกลบแล้ว dialog ปิดลง", async ({ page }) => {
    await expect(page.getByText("admin@test.com")).toBeVisible();

    // 1) เปิด dialog ยืนยันการลบ
    const moreButton = page
      .locator("tbody tr")
      .first()
      .locator("button")
      .filter({ has: page.locator(".pi-ellipsis-v") });
    await moreButton.click();
    await page.locator(".p-menu").getByText("Delete").click();

    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // 2) กด "ยกเลิก"
    await dialog.getByRole("button", { name: "ยกเลิก" }).click();

    // dialog ปิดลง
    await expect(dialog).not.toBeVisible();
  });

  test("TC-021 ลบผู้ใช้สำเร็จ", async ({ page }) => {
    // Mock DELETE /api/v1/users/:id ให้สำเร็จ
    await page.route(`${PATH_API}/*`, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await expect(page.getByText("admin@test.com")).toBeVisible();

    // 1) เปิด dialog
    const moreButton = page
      .locator("tbody tr")
      .first()
      .locator("button")
      .filter({ has: page.locator(".pi-ellipsis-v") });
    await moreButton.click();
    await page.locator(".p-menu").getByText("Delete").click();

    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible();

    // 3) กด "ลบ"
    await dialog.getByRole("button", { name: "ลบ" }).click();

    // เห็น toast "ลบผู้ใช้สำเร็จ"
    await expect(page.getByText("ลบผู้ใช้สำเร็จ")).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-022 ลบผู้ใช้ไม่สำเร็จ (API ตอบ error)", async ({ page }) => {
    // รอให้ตารางโหลดเสร็จก่อน
    await expect(page.getByText("admin@test.com")).toBeVisible({ timeout: 10000 });

    // Mock DELETE ให้ error (ต้อง route หลังจากหน้าโหลดแล้ว)
    await page.route(`${PATH_API}/*`, async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Delete failed" }),
        });
      } else {
        await route.continue();
      }
    });

    // 1) เปิด dialog
    const moreButton = page
      .locator("tbody tr")
      .first()
      .locator("button")
      .filter({ has: page.locator(".pi-ellipsis-v") });
    await moreButton.click();
    
    // รอให้เมนูแสดง
    const menu = page.locator(".p-menu");
    await expect(menu).toBeVisible({ timeout: 5000 });
    await menu.getByText("Delete").click();

    const dialog = page.locator(".p-dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 2) กด "ลบ"
    await dialog.getByRole("button", { name: "ลบ" }).click();

    // เห็น toast "ลบผู้ใช้ไม่สำเร็จ"
    await expect(page.getByText("ลบผู้ใช้ไม่สำเร็จ")).toBeVisible({
      timeout: 10000,
    });
  });
});

// ============================================================
// หน้าแก้ไขผู้ใช้ (/admin/user-management/edit/:id) (TC-023 to TC-028)
// ============================================================
test.describe("หน้าแก้ไขผู้ใช้ (/admin/user-management/edit/:id)", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await loginAsAdmin(page, {
      email: process.env.E2E_TEST_ADMIN_EMAIL,
      password: process.env.E2E_TEST_ADMIN_PASSWORD,
    });
  });

  test("TC-023 ไม่พบผู้ใช้ (User not found)", async ({ page }) => {
    // Mock GET /api/v1/users/normalize/999 ให้ตอบ 404
    await page.route("/api/v1/users/normalize/999", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "User not found" }),
      });
    });

    // 1) เปิด /admin/user-management/edit/999
    await page.goto("/admin/user-management/edit/999", {
      waitUntil: "domcontentloaded",
    });

    // เห็นข้อความ "User not found."
    await expect(page.getByText("User not found.")).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-024 แสดงฟอร์มแก้ไขตาม role=ADMIN", async ({ page }) => {
    // Mock normalize ให้เป็นผู้ใช้ role ADMIN พร้อมข้อมูล admin
    await page.route("/api/v1/users/normalize/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockNormalizedAdminUser]),
      });
    });

    // 1) เปิด /admin/user-management/edit/1
    await page.goto("/admin/user-management/edit/1", {
      waitUntil: "domcontentloaded",
    });

    // เห็นหัวข้อ "แก้ไขข้อมูลของ ผู้ดูแลระบบ"
    await expect(page.getByText("แก้ไขข้อมูลของ ผู้ดูแลระบบ")).toBeVisible({
      timeout: 10000,
    });

    // และมีฟิลด์ "คำนำหน้า/ชื่อ/นามสกุล/อีเมล"
    await expect(page.getByText("คำนำหน้า")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByLabel(/ชื่อ/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/นามสกุล/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/อีเมล/)).toBeVisible({ timeout: 10000 });

    // พร้อมปุ่ม "บันทึก", "รีเซ็ต"
    await expect(page.getByRole("button", { name: "บันทึก" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "รีเซ็ต" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("TC-025 ปุ่ม 'บันทึก' disabled เมื่อยังไม่แก้ไขข้อมูล", async ({
    page,
  }) => {
    await page.route("/api/v1/users/normalize/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockNormalizedAdminUser]),
      });
    });

    // 1) เปิดฟอร์มโดยยังไม่เปลี่ยนค่าใด ๆ
    await page.goto("/admin/user-management/edit/1", {
      waitUntil: "domcontentloaded",
    });

    // รอให้ฟอร์มโหลดเสร็จ
    await expect(page.getByText("แก้ไขข้อมูลของ ผู้ดูแลระบบ")).toBeVisible({
      timeout: 10000,
    });

    // ปุ่ม "บันทึก" และ "รีเซ็ต" disabled
    await expect(page.getByRole("button", { name: "บันทึก" })).toBeDisabled({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: "รีเซ็ต" })).toBeDisabled({
      timeout: 10000,
    });
  });

  test("TC-026 บันทึกสำเร็จ (Admin edit)", async ({ page }) => {
    await page.route("/api/v1/users/normalize/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockNormalizedAdminUser]),
      });
    });

    // Mock PUT /api/v1/admins/:adminId ให้สำเร็จ
    await page.route("/api/v1/admins/1", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockNormalizedAdminUser.admin,
            firstName: "ทดสอบแก้ไข",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/admin/user-management/edit/1", {
      waitUntil: "domcontentloaded",
    });

    // รอให้ฟอร์มโหลดเสร็จ
    await expect(page.getByText("แก้ไขข้อมูลของ ผู้ดูแลระบบ")).toBeVisible({
      timeout: 10000,
    });

    // 1) เปลี่ยนค่าอย่างน้อย 1 ฟิลด์
    const firstNameInput = page.getByLabel(/ชื่อ/).first();
    await firstNameInput.clear();
    await firstNameInput.fill("ทดสอบแก้ไข");

    // 3) กด "บันทึก"
    const saveButton = page.getByRole("button", { name: "บันทึก" });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // เห็น toast (summary "สำเร็จ") และ detail "บันทึกข้อมูลผู้ดูแลระบบเรียบร้อย"
    await expect(page.getByText("สำเร็จ")).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("บันทึกข้อมูลผู้ดูแลระบบเรียบร้อย")
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-027 บันทึกไม่สำเร็จ (Admin edit)", async ({ page }) => {
    await page.route("/api/v1/users/normalize/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockNormalizedAdminUser]),
      });
    });

    // Mock PUT ให้ error พร้อม message
    await page.route("/api/v1/admins/1", async (route) => {
      if (route.request().method() === "PUT") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "บันทึกไม่สำเร็จ" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/admin/user-management/edit/1", {
      waitUntil: "domcontentloaded",
    });

    // รอให้ฟอร์มโหลดเสร็จ
    await expect(page.getByText("แก้ไขข้อมูลของ ผู้ดูแลระบบ")).toBeVisible({
      timeout: 10000,
    });

    // 1) เปลี่ยนค่า
    const firstNameInput = page.getByLabel(/ชื่อ/).first();
    await firstNameInput.clear();
    await firstNameInput.fill("ทดสอบล้มเหลว");

    // 3) กด "บันทึก"
    const saveButton = page.getByRole("button", { name: "บันทึก" });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });
    await saveButton.click();

    // เห็น toast (summary "ไม่สำเร็จ") และ detail เป็น "บันทึกข้อมูลผู้ดูแลระบบไม่สำเร็จ"
    await expect(page.getByText(/บันทึกไม่สำเร็จ/)).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/บันทึกข้อมูลผู้ดูแลระบบไม่สำเร็จ|บันทึกไม่สำเร็จ/)
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-028 รีเซ็ตค่ากลับค่าเริ่มต้น", async ({ page }) => {
    await page.route("/api/v1/users/normalize/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockNormalizedAdminUser]),
      });
    });

    await page.goto("/admin/user-management/edit/1", {
      waitUntil: "domcontentloaded",
    });

    // รอให้ฟอร์มโหลดเสร็จ
    await expect(page.getByText("แก้ไขข้อมูลของ ผู้ดูแลระบบ")).toBeVisible({
      timeout: 10000,
    });

    const firstNameInput = page.getByLabel(/ชื่อ/).first();
    const originalValue = await firstNameInput.inputValue();

    // 1) เปลี่ยนค่าอย่างน้อย 1 ฟิลด์
    await firstNameInput.clear();
    await firstNameInput.fill("ค่าที่เปลี่ยน");

    // ตรวจสอบว่าปุ่มรีเซ็ต enabled
    const resetButton = page.getByRole("button", { name: "รีเซ็ต" });
    await expect(resetButton).toBeEnabled({ timeout: 5000 });

    // 2) กด "รีเซ็ต"
    await resetButton.click();

    // ค่าในฟิลด์กลับเป็นค่าเริ่มต้น
    await expect(firstNameInput).toHaveValue(originalValue, { timeout: 5000 });

    // และปุ่มกลับเป็น disabled
    await expect(page.getByRole("button", { name: "บันทึก" })).toBeDisabled({
      timeout: 5000,
    });
    await expect(page.getByRole("button", { name: "รีเซ็ต" })).toBeDisabled({
      timeout: 5000,
    });
  });
});
