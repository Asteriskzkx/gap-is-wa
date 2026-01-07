# Playwright E2E Tests Documentation

## 📋 Overview

โปรเจกต์นี้ใช้ **Playwright** สำหรับการทำ E2E Testing และ **Lighthouse** สำหรับการทดสอบ Performance

## 📦 Prerequisites

### 1. ติดตั้ง Dependencies

```bash
npm install
npm install -D @playwright/test lighthouse
```

### 2. ติดตั้ง Playwright Browsers

```bash
npx playwright install
```

### 3. เริ่มต้น Development Server

ก่อนรัน tests ต้องเปิด development server ก่อน:

```bash
npm run dev
```

Server จะรันที่ `http://localhost:3000`

## 🧪 Running Tests

### รัน Login Tests ทั้งหมด

```bash
# รันทุก browser (default: 7 browsers)
npx playwright test tests/login/login.spec.js

# รันเฉพาะ Chromium
npx playwright test tests/login/login.spec.js --project=chromium

# รันเฉพาะ Firefox
npx playwright test tests/login/login.spec.js --project=firefox

# รันเฉพาะ WebKit (Safari)
npx playwright test tests/login/login.spec.js --project=webkit

# รันหลาย browser พร้อมกัน
npx playwright test tests/login/login.spec.js --project=chromium --project=firefox

# รัน Desktop browsers เท่านั้น (chromium, firefox, webkit)
npx playwright test tests/login/login.spec.js --project=chromium --project=firefox --project=webkit
```

### รัน Performance Tests (Lighthouse)

**หมายเหตุ:** Performance tests ใช้ Lighthouse และรองรับเฉพาะ Chromium เท่านั้น

```bash
# รัน performance test (แนะนำ)
npx playwright test --project=performance

# หรือระบุ file โดยตรง
npx playwright test tests/performance/performance.spec.js --project=performance

# รันแบบ UI mode
npx playwright test --project=performance --ui
```

### รัน All Tests

```bash
# รันทุก tests ทุก browser (ใช้เวลานาน)
npx playwright test

# รันทุก tests เฉพาะ Chromium (แนะนำ)
npx playwright test --project=chromium

# รันทุก tests บน Desktop browsers เท่านั้น
npx playwright test --project=chromium --project=firefox --project=webkit
```

## 🎯 Browser Projects

ระบบมี browser projects ทั้งหมด 7 แบบ:

1. **chromium** - Chromium browser (แนะนำสำหรับ development)
2. **firefox** - Mozilla Firefox
3. **webkit** - WebKit (Safari engine)
4. **Mobile Chrome** - Chrome on mobile (Pixel 5)
5. **Mobile Safari** - Safari on mobile (iPhone 12)
6. **Microsoft Edge** - Microsoft Edge browser
7. **Google Chrome** - Google Chrome browser
8. **performance** - สำหรับ Lighthouse performance tests (Chromium เท่านั้น)

**แนะนำ:** ใช้ `--project=chromium` สำหรับการทดสอบระหว่างพัฒนา เพื่อประหยัดเวลา

### รัน Tests แบบ Interactive (UI Mode)

```bash
npx playwright test --ui
```

### รัน Tests พร้อมดู Browser

```bash
npx playwright test --headed
```

### รัน Test เฉพาะ Test Case

```bash
# รัน test case เดียว
npx playwright test -g "TC-001"

# รัน test suite เดียว
npx playwright test -g "Form Validation"
```

## 📊 Test Reports

### สร้าง HTML Report

```bash
npx playwright test --reporter=html
```

จากนั้นเปิดรายงาน:

```bash
npx playwright show-report
```

### ดู Test Results แบบ JSON

```bash
npx playwright test --reporter=json
```

## 🐛 Debugging

### Debug Mode

```bash
# เปิด Playwright Inspector
npx playwright test --debug

# Debug test case เฉพาะ
npx playwright test -g "TC-001" --debug
```

### บันทึก Video และ Screenshot

เพิ่มใน `playwright.config.js`:

```javascript
export default {
  use: {
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
};
```

### Trace Viewer

```bash
# รัน tests พร้อม trace
npx playwright test --trace on

# ดู trace file
npx playwright show-trace trace.zip
```

## 🔧 Configuration

### `playwright.config.js`

```javascript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
```
