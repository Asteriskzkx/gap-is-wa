// tests/performance/performance.spec.js
import { test } from "@playwright/test";
import lighthouse from "lighthouse";
import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

test.describe("Performance Testing (Lighthouse)", () => {
  test("Full Lighthouse Audit (All Categories)", async () => {
    const browser = await chromium.launch({
      args: ["--remote-debugging-port=9222"],
    });

    const { lhr } = await lighthouse(BASE_URL, {
      port: 9222,
      output: "json",
      logLevel: "error",
    });

    console.log("\n=== Lighthouse Audit Results ===");
    console.log("Performance:", lhr.categories.performance.score * 100);
    console.log("Accessibility:", lhr.categories.accessibility.score * 100);
    console.log(
      "Best Practices:",
      lhr.categories["best-practices"].score * 100
    );
    console.log("SEO:", lhr.categories.seo.score * 100);

    // Performance Metrics
    console.log("\n=== Performance Metrics ===");
    if (lhr.audits.metrics?.details?.items?.[0]) {
      const metrics = lhr.audits.metrics.details.items[0];
      console.log(
        "First Contentful Paint:",
        metrics.firstContentfulPaint,
        "ms"
      );
      console.log(
        "Largest Contentful Paint:",
        metrics.largestContentfulPaint,
        "ms"
      );
      console.log("Total Blocking Time:", metrics.totalBlockingTime, "ms");
      console.log("Cumulative Layout Shift:", metrics.cumulativeLayoutShift);
      console.log("Speed Index:", metrics.speedIndex, "ms");
    } else {
      console.log("Performance metrics not available");
    }

    await browser.close();
  });
});
