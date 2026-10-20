import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedTasks, ANCHORS } from "../src/model.js";

const KEY = "relay.workspace:v3";

test("backup imports reject damaged files, preview conflicts and preserve an undo version", async ({
  page,
}) => {
  await page.goto("/");
  const original = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).data,
    KEY,
  );
  await page
    .getByRole("button", { name: /James.s studio Solo workspace/ })
    .click();
  const input = page.getByLabel("Import complete workspace backup", {
    exact: true,
  });
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{damaged"),
  });
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "not valid JSON",
  );
  expect((await storedTasks(page))[0].title).toBe(
    original.projects[0].tasks[0].title,
  );
  const incoming = structuredClone(original);
  incoming.projects[0].tasks[0].title = "Reviewed import title";
  await input.setInputFiles({
    name: "relay.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ format: "relay-bundle", version: 3, data: incoming }),
    ),
  });
  await expect(page.getByText(/1 changed task\/link conflicts/)).toBeVisible();
  await page
    .getByText("James’s studio: Reviewed import title", { exact: true })
    .click();
  await page
    .getByLabel("Resolve James’s studio: Reviewed import title", {
      exact: true,
    })
    .selectOption("incoming");
  await page
    .getByRole("button", { name: "Merge reviewed backup", exact: true })
    .click();
  await expect
    .poll(async () => (await storedTasks(page))[0].title)
    .toBe("Reviewed import title");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Undo", exact: true })
    .click();
  await expect
    .poll(async () => (await storedTasks(page))[0].title)
    .toBe(original.projects[0].tasks[0].title);
});

test("section editing, safe previews, reusable templates and concise handoffs preserve context", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Shape the project story", exact: true })
    .click();
  await page
    .getByLabel("Curated context", { exact: true })
    .fill(
      "Opening note\n\n## Unknown notes\nKeep this note.\n\n## Next step\nOld action\n\n## Verify\nInspect the result.",
    );
  await page
    .getByRole("button", { name: "Section editor", exact: true })
    .click();
  await page
    .getByLabel("Next step section", { exact: true })
    .fill("Check the published preview.");
  await expect(page.getByLabel("Curated context", { exact: true })).toHaveValue(
    /Keep this note/,
  );
  await page
    .getByRole("button", { name: "Handoff preview", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Handoff preview", exact: true }),
  ).toContainText("Check the published preview.");
  await page.getByText("My reusable templates (0)", { exact: true }).click();
  await page
    .getByLabel("Template name", { exact: true })
    .fill("A reusable check");
  await page
    .getByRole("button", { name: "Save context as template", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Template saved." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Shape the project story", exact: true })
    .click();
  await page.getByText("My reusable templates (1)", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Append A reusable check", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Curated context", { exact: true })
    .fill(
      '<img src=x onerror="window.__injected=true">\n[Unsafe](javascript:alert(1))\n[Source](https://example.com)',
    );
  await page
    .getByRole("button", { name: "Markdown preview", exact: true })
    .click();
  await expect(page.getByLabel("Briefing preview").locator("img")).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "Source (opens a new tab)", exact: true }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
});

test("damaged storage opens protected recovery without rewriting the raw value", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "damaged original"),
    KEY,
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("not valid JSON");
  await page.getByRole("button", { name: "Recovery", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Download protected raw data",
      exact: true,
    }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(
    "damaged original",
  );
});

test("cloud account controls load on demand and report rejected credentials without changing local work", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("supabase.co")) requests.push(request.url());
  });
  await page.route("https://*.supabase.co/auth/v1/token**", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: "invalid_grant",
        error_description: "Invalid login credentials",
      }),
    }),
  );
  await page.goto("/");
  expect(requests).toHaveLength(0);
  await page
    .getByRole("button", { name: /James.s studio Solo workspace/ })
    .click();
  await page
    .getByRole("button", {
      name: "Accounts, cloud sync & collaboration",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Account email", { exact: true })
    .fill("test@example.invalid");
  await page
    .getByLabel("Account password", { exact: true })
    .fill("Test-password-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Invalid login credentials",
  );
  expect((await storedTasks(page)).length).toBe(4);
});
const samples = seedTasks(new Date(2026, 9, 20, 12));
test.beforeEach(async ({ context }) => {
  await context.addInitScript(
    ({ tasks, anchors, key }) => {
      if (
        localStorage.getItem(key) === null &&
        localStorage.getItem("vibetracker.tasks") === null
      ) {
        localStorage.setItem("vibetracker.tasks", JSON.stringify(tasks));
        localStorage.setItem("vibetracker.anchors", JSON.stringify(anchors));
      }
    },
    { tasks: samples, anchors: ANCHORS, key: KEY },
  );
});
async function openNew(page) {
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function saved(page) {
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function storedTasks(page) {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)).data.projects[0].tasks,
    KEY,
  );
}

test("legacy migration preserves identities and creates complete saved transactions", async ({
  page,
}) => {
  await page.goto("/");
  await expect.poll(async () => (await storedTasks(page)).length).toBe(4);
  await expect(
    page.getByRole("button", { name: "Shape the project story", exact: true }),
  ).toBeVisible();
  await openNew(page);
  await page
    .getByLabel("Task title", { exact: true })
    .fill("Browser regression task");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Verify a saved task survives a browser reload.");
  await page
    .getByLabel("Curated context", { exact: true })
    .fill(
      "Decisions: keep the existing task identity. Next step: reload the page. Verify: the task remains on the board with its context.",
    );
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await saved(page);
  await page.reload();
  await expect.poll(async () => (await storedTasks(page)).length).toBe(5);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(async () => (await storedTasks(page)).length).toBe(4);
  await page.reload();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(async () => (await storedTasks(page)).length).toBe(5);
});

test("unsaved drafts survive refresh and explicit recovery", async ({
  page,
}) => {
  await page.goto("/");
  await openNew(page);
  await page
    .getByLabel("Task title", { exact: true })
    .fill("A draft worth keeping");
  await page
    .getByLabel("Curated context", { exact: true })
    .fill(
      "Decisions: save this unfinished thought without creating a task yet.",
    );
  await expect(page.getByText(/Recovery draft saved/)).toBeVisible();
  await page.reload();
  await openNew(page);
  await page
    .getByRole("button", { name: "Continue recovered draft", exact: true })
    .click();
  await expect(page.getByLabel("Task title", { exact: true })).toHaveValue(
    "A draft worth keeping",
  );
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await saved(page);
  expect(
    (await storedTasks(page)).some((t) => t.title === "A draft worth keeping"),
  ).toBe(true);
});

test("deleted tasks remain recoverable after reload", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Shape the project story", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, delete task", exact: true })
    .click();
  await saved(page);
  await page.reload();
  await page.getByRole("button", { name: "Recovery", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Restore task: Shape the project story",
      exact: true,
    })
    .click();
  await expect.poll(async () => (await storedTasks(page)).length).toBe(4);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Shape the project story", exact: true }),
  ).toBeVisible();
});

test("two tabs cannot overwrite a changed task with a stale draft", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Shape the project story", exact: true })
    .click();
  await page
    .getByLabel("Curated context", { exact: true })
    .fill("Unsaved work in the first tab");
  const other = await context.newPage();
  await other.goto("/");
  await other
    .getByRole("button", { name: "Shape the project story", exact: true })
    .click();
  await other
    .getByLabel("Task title", { exact: true })
    .fill("Latest name from the second tab");
  await other
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await saved(other);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    /changed in another tab|Another tab changed/,
  );
  expect(
    (await storedTasks(page)).find((t) => t.id === samples[0].id).title,
  ).toBe("Latest name from the second tab");
  await expect(page.getByLabel("Curated context", { exact: true })).toHaveValue(
    "Unsaved work in the first tab",
  );
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await page
    .getByRole("button", { name: "Yes, delete task", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "before deleting it",
  );
  expect(
    (await storedTasks(page)).find((t) => t.id === samples[0].id).title,
  ).toBe("Latest name from the second tab");
});

test("full storage reports a failed save without losing the prior workspace", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === key && window.__relayQuotaFailure)
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, k, v);
    };
  }, KEY);
  await page.goto("/");
  await expect.poll(async () => (await storedTasks(page)).length).toBe(4);
  await page.evaluate(() => {
    window.__relayQuotaFailure = true;
  });
  await openNew(page);
  await page
    .getByLabel("Task title", { exact: true })
    .fill("Must remain a draft");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "previous saved workspace is intact",
  );
  expect((await storedTasks(page)).length).toBe(4);
});

test("clipboard denial offers accessible manual-copy text", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () =>
          Promise.reject(new DOMException("Denied", "NotAllowedError")),
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Copy as Prompt Context: Shape the project story",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Copy your briefing manually",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Manual copy text", { exact: true }),
  ).toHaveValue(/Shape the project story/);
});

test("enlarged mobile workspace and access dialog reflow without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Accessibility", exact: true })
    .click();
  await page.getByLabel("Text size", { exact: true }).selectOption("200");
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "true");
  const widths = await page
    .getByRole("dialog")
    .evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Board layout", exact: true }),
  ).toBeDisabled();
  await expect(page.getByTestId("task-list-row")).toHaveCount(4);
});

test("main view, focus desk and access settings pass automated accessibility checks", async ({
  page,
}) => {
  await page.goto("/");
  for (const view of ["board", "focus", "access"]) {
    if (view === "focus")
      await page
        .getByRole("button", { name: "Focus desk", exact: true })
        .last()
        .click();
    if (view === "access")
      await page
        .getByRole("button", { name: "Accessibility", exact: true })
        .click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  }
});

test("design guide and presentation retain named access controls and slide navigation", async ({
  page,
}) => {
  await page.goto("/design.html");
  await expect(
    page.getByRole("heading", {
      name: "Every choice should help you continue.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("img")).toHaveAttribute(
    "alt",
    /two square nodes/,
  );
  let results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.goto("/presentation.html");
  await page.keyboard.press("End");
  await expect(page.locator("#counter")).toHaveText("8 / 8");
  await expect(
    page.getByRole("button", { name: "Next slide", exact: true }),
  ).toBeDisabled();
  results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
