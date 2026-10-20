import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the real animated journal renders, opens the focus chapter, pauses and stops scheduling idle frames", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame;
    window.__scheduledFrames = 0;
    window.requestAnimationFrame = function (callback) {
      window.__scheduledFrames++;
      return raf.call(window, callback);
    };
  });
  await page.goto("/");
  const figure = page.locator(".journal");
  await expect(figure).toHaveAttribute("data-journal-state", "ready", {
    timeout: 25000,
  });
  await expect(figure.locator("canvas")).toBeVisible();
  const host = page.locator(".journal-canvas");
  await expect(host).toHaveAttribute("data-settled", "true");
  await expect(host).toHaveAttribute("data-clip", "OpenJournal");
  const closed = await figure.locator("canvas").screenshot();
  await page
    .getByRole("button", { name: "Open your focus chapter", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Less noise. Your next move.",
  );
  await page.mouse.move(0, 0);
  await expect(host).toHaveAttribute("data-settled", "true");
  const opened = await figure.locator("canvas").screenshot();
  expect(opened.equals(closed)).toBe(false);
  await page
    .getByRole("button", { name: "Pause 3D motion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Resume 3D motion", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await expect(host).toHaveAttribute("data-settled", "true");
  const scheduled = await page.evaluate(() => window.__scheduledFrames);
  // This bounded sample measures idle scheduling; it is not a wait for UI readiness.
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__scheduledFrames)).toBe(scheduled);
  await page
    .getByRole("button", { name: "Back to the bigger picture", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Good work deserves a clear next step.",
  );
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page
    .getByLabel("Task title", { exact: true })
    .fill("A task in the immersive workspace");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "A task in the immersive workspace",
      exact: true,
    }),
  ).toBeVisible();
});

test("OS reduced motion skips the renderer/model and keeps navigation and modal focus usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const assets = [];
  page.on("request", (request) => {
    if (/journalScene|relay-journal.glb/.test(request.url()))
      assets.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".journal")).toHaveAttribute(
    "data-journal-state",
    "reduced",
  );
  await expect(page.locator(".journal-poster")).toBeVisible();
  await page
    .getByRole("button", { name: "Open your focus chapter", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Less noise. Your next move.",
  );
  await page
    .getByRole("button", { name: "Back to the bigger picture", exact: true })
    .click();
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "New task", exact: true }),
  ).toBeFocused();
  expect(assets).toHaveLength(0);
});

test("failed model loading retains the rendered poster and working focus action", async ({
  page,
}) => {
  await page.route("**/models/relay-journal.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".journal")).toHaveAttribute(
    "data-journal-state",
    "fallback",
    { timeout: 25000 },
  );
  await expect(page.locator(".journal-poster")).not.toHaveClass(/is-hidden/);
  await expect(
    page.getByRole("button", { name: "Retry 3D view", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open your focus chapter", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Less noise. Your next move.",
  );
});

test("the saved in-app motion preference disposes the renderer and survives reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".journal")).toHaveAttribute(
    "data-journal-state",
    "ready",
    { timeout: 25000 },
  );
  await page
    .getByRole("button", { name: "Accessibility", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Reduce motion", exact: true })
    .check();
  await expect(page.locator("html")).toHaveAttribute(
    "data-reduce-motion",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".journal canvas")).toHaveCount(0);
  await expect(page.locator(".journal-poster")).not.toHaveClass(/is-hidden/);
  await page.reload();
  await expect(page.locator(".journal")).toHaveAttribute(
    "data-journal-state",
    "reduced",
  );
  await expect(page.locator(".journal canvas")).toHaveCount(0);
});

test("the redesigned hero reflows on mobile and retains readable semantic controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
  await page.screenshot({ path: test.info().outputPath("journal-mobile.png") });
});
