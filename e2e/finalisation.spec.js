import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { seedTasks, ANCHORS, taskPrompt } from "../src/model.js";
import { DEFAULT_ACCESS } from "../src/accessibility.js";
import { conciseBrief } from "../src/briefing.js";
import { CONTEXT_TEMPLATES } from "../src/competition.js";

test.use({ reducedMotion: "reduce" });
const KEY = "relay.workspace:v3";
const ACCESS = "relay.accessibility:v1";
const samples = seedTasks(new Date(2026, 9, 20, 12));

test.beforeEach(async ({ context }) => {
  await context.addInitScript(({ tasks, anchors, key }) => {
    if (!localStorage.getItem(key) && !localStorage.getItem("vibetracker.tasks")) {
      localStorage.setItem("vibetracker.tasks", JSON.stringify(tasks));
      localStorage.setItem("vibetracker.anchors", JSON.stringify(anchors));
    }
  }, { tasks: samples, anchors: ANCHORS, key: KEY });
});
const state = (page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
const tasks = async (page) => (await state(page)).data.projects[0].tasks;
const openSettings = (page) => page.getByRole("button", { name: /James.s studio Solo workspace/ }).click();
const editFirst = (page) => page.getByRole("button", { name: samples[0].title, exact: true }).click();
async function downloadedJSON(pending) {
  const download = await pending;
  return JSON.parse(await readFile(await download.path(), "utf8"));
}
const save = async (page) => {
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
};

test("saved recovery version restores across reload and can itself be undone", async ({ page }) => {
  await page.goto("/");
  await editFirst(page);
  await page.getByLabel("Task title", { exact: true }).fill("Changed before restoring");
  await save(page);
  await page.reload();
  await page.getByRole("button", { name: "Recovery", exact: true }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Restore version 1", exact: true }).click();
  await expect.poll(async () => (await tasks(page))[0].title).toBe(samples[0].title);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("banner").getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(async () => (await tasks(page))[0].title).toBe("Changed before restoring");
});

test("demo reset retains a recoverable copy of real tasks and deliverable links", async ({ page }) => {
  await page.goto("/");
  await editFirst(page);
  await page.getByLabel("Task title", { exact: true }).fill("My work before reset");
  await save(page);
  // A complete import exercises a linked deliverable as well as the changed task.
  const incoming = (await state(page)).data;
  incoming.projects[0].anchors[0].url = "https://example.com/my-presentation";
  await openSettings(page);
  await page.getByLabel("Import complete workspace backup", { exact: true }).setInputFiles({
    name: "links.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ format: "relay-bundle", version: 3, data: incoming })),
  });
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Replace all local projects", exact: true }).click();
  await expect.poll(async () => (await state(page)).data.projects[0].anchors[0].url).toBe("https://example.com/my-presentation");
  const before = (await state(page)).data.projects[0];
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Restore demo workspace", exact: true }).click();
  await expect.poll(async () => (await tasks(page))[0].title).toBe(samples[0].title);
  expect((await state(page)).data.projects[0].anchors[0].url).toBeNull();
  await page.reload();
  await page.getByRole("banner").getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(async () => (await state(page)).data.projects[0]).toEqual(before);
});

test("accessibility backup is opt-in and restored preferences survive reload", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  const download = async () => {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download complete workspace backup", exact: true }).click();
    return downloadedJSON(pending);
  };
  expect((await download()).preferences).toBeUndefined();
  await page.getByLabel("Include accessibility preferences in download", { exact: true }).check();
  const backup = await download();
  expect(backup.preferences).toEqual(DEFAULT_ACCESS);
  backup.preferences = { ...DEFAULT_ACCESS, theme: "dark", palette: "mono", textSize: 150, reduceMotion: true };
  const upload = async () => {
    await page.getByLabel("Import complete workspace backup", { exact: true }).setInputFiles({
      name: "preferences.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)),
    });
  };
  await upload();
  await page.getByRole("button", { name: "Merge reviewed backup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Preview before importing", exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ACCESS)).toEqual(DEFAULT_ACCESS);
  await upload();
  await page.getByLabel("Also restore validated accessibility preferences", { exact: true }).check();
  await page.getByRole("button", { name: "Merge reviewed backup", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "mono");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "true");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), ACCESS)).toEqual(backup.preferences);
});

test("context comparison recovers only the selected passage and wraps up into a saved draft", async ({ page }) => {
  await page.goto("/");
  await editFirst(page);
  const prior = "First useful paragraph.\n\nA separate detail to recover.";
  await page.getByLabel("Curated context", { exact: true }).fill(prior);
  await save(page);
  await editFirst(page);
  await page.getByLabel("Curated context", { exact: true }).fill("Current text stays.");
  await save(page);
  await page.reload();
  await editFirst(page);
  await page.getByRole("button", { name: /Earlier context/ }).click();
  const comparison = page.locator("details").filter({ hasText: prior.split("\n")[0] }).first();
  await comparison.locator("summary").click();
  await expect(comparison).toContainText("Removed: First useful paragraph.");
  await expect(comparison).toContainText("Added: Current text stays.");
  await comparison.getByRole("button", { name: "Append passage 2 to draft", exact: true }).click();
  await expect(page.getByLabel("Curated context", { exact: true })).toHaveValue("Current text stays.\n\nA separate detail to recover.");
  expect((await tasks(page))[0].context).toBe("Current text stays.");
  await page.getByRole("button", { name: "Wrap up session", exact: true }).click();
  const values = { "What works": "Recovery is working.", "Next step": "Check the live release.", Verify: "Reload the deployed board.", Risks: "Device speech needs listening." };
  for (const [heading, text] of Object.entries(values)) {
    await page.getByLabel(`Wrap-up: ${heading}`, { exact: true }).fill(text);
  }
  await save(page);
  await page.reload();
  const saved = (await tasks(page))[0];
  for (const [heading, text] of Object.entries(values)) expect(saved.context).toContain(`## ${heading}\n${text}`);
  expect(saved.context).toContain("Current text stays.\n\nA separate detail to recover.");
  expect(saved.id).toBe(samples[0].id);
});

test("concise and detailed handoff copying matches the visible preview exactly", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async text => { window.__copiedHandoff = text; } },
  }));
  await page.goto("/");
  await editFirst(page);
  await page.getByRole("button", { name: "Handoff preview", exact: true }).click();
  const region = page.getByRole("region", { name: "Handoff preview", exact: true });
  for (const [detail, expected] of [["concise", conciseBrief(samples[0])], ["detailed", taskPrompt(samples[0])]]) {
    await page.getByLabel("Briefing detail", { exact: true }).selectOption(detail);
    await expect(region.locator("pre")).toHaveText(expected);
    await region.getByRole("button", { name: "Copy previewed handoff", exact: true }).click();
    expect(await page.evaluate(() => window.__copiedHandoff)).toBe(expected);
  }
});

test("render failure offers the original raw data and reload recovers without resetting it", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("relay-test-render-failed")) return;
    sessionStorage.setItem("relay-test-render-failed", "true");
    window.matchMedia = () => { throw new Error("Injected render dependency failure"); };
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Relay could not display this view.", exact: true })).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download raw recovery data", exact: true }).click();
  const raw = await downloadedJSON(pending);
  expect(JSON.parse(raw["vibetracker.tasks"])).toEqual(samples);
  await page.getByRole("button", { name: "Reload Relay", exact: true }).click();
  await expect(page.getByRole("button", { name: samples[0].title, exact: true })).toBeVisible();
  expect(await tasks(page)).toEqual(samples);
});

test("failed preference import reports its actual save result and retains current preferences", async ({ page }) => {
  await page.addInitScript(key => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key && window.__denyPreferenceSave) throw new DOMException("Denied", "QuotaExceededError");
      return set.call(this, name, value);
    };
  }, ACCESS);
  await page.goto("/");
  const before = await page.evaluate(key => localStorage.getItem(key), ACCESS);
  const data = (await state(page)).data;
  await openSettings(page);
  await page.getByLabel("Import complete workspace backup", { exact: true }).setInputFiles({
    name: "preferences.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ format: "relay-bundle", version: 3, data, preferences: { ...DEFAULT_ACCESS, theme: "dark" } })),
  });
  await page.getByLabel("Also restore validated accessibility preferences", { exact: true }).check();
  await page.evaluate(() => { window.__denyPreferenceSave = true; });
  await page.getByRole("button", { name: "Merge reviewed backup", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("preferences could not be saved");
  expect(await page.evaluate(key => localStorage.getItem(key), ACCESS)).toBe(before);
  expect((await tasks(page)).length).toBe(4);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Preferences were not replaced");
});

test("validation names and focuses the affected field, deletion and clearing filters retain keyboard position", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Task title", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  const title = page.getByLabel("Task title", { exact: true });
  await expect(title).toBeFocused();
  await expect(title).toHaveAttribute("aria-invalid", "true");
  const description = await title.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${description}"]`)).toHaveText("Give this task a title.");
  await title.fill("A valid task");
  await expect(title).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await page.getByRole("button", { name: "A valid task", exact: true }).click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await page.getByRole("button", { name: "Yes, delete task", exact: true }).click();
  await expect(page.locator("#workspace")).toBeFocused();
  const search = page.getByRole("textbox", { name: "Search tasks", exact: true });
  await search.fill("nothing matches this search");
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("");
  await page.getByRole("button", { name: "Edit Presentation link", exact: true }).click();
  const url = page.getByLabel("Presentation URL", { exact: true });
  await url.fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Save link", exact: true }).click();
  await expect(url).toBeFocused();
  await expect(url).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText("http:// or https://");
});

test("read-aloud waits for a local voice and only uses online speech after a deliberate choice", async ({ page }) => {
  await page.addInitScript(() => {
    const online = { voiceURI: "test-online", name: "Test online voice", lang: "en-GB", default: true, localService: false };
    window.__spoken = [];
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, "speechSynthesis", { value: {
      getVoices: () => [online], addEventListener() {}, removeEventListener() {}, cancel() {}, pause() {}, resume() {},
      speak(utterance) { window.__spoken.push({ text: utterance.text, voice: utterance.voice?.voiceURI }); utterance.onstart?.(); },
    } });
  });
  await page.goto("/");
  await editFirst(page);
  await page.getByRole("button", { name: "Read aloud", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("No local device voice");
  expect(await page.evaluate(() => window.__spoken)).toEqual([]);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await page.getByLabel("Reading voice", { exact: true }).selectOption("test-online");
  await page.getByRole("button", { name: "Read aloud", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__spoken[0]?.voice)).toBe("test-online");
  await expect(page.getByRole("button", { name: "Pause reading", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Stop reading", exact: true }).click();
});

test("320px reflow, increased text spacing and forced colours retain accessible task workflows", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: `* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }` });
  await expect(page.getByTestId("task-list-row")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "New task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await page.getByLabel("Task title", { exact: true }).fill("Spacing and contrast check");
  await page.getByLabel("Curated context", { exact: true }).fill("Next: inspect the readable result. Verify: reload the board.");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations)).toEqual([]);
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("PRD handoff, stage menus, deliverable editing and additive templates persist together", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(`Hand off ${samples[0].title} to`, { exact: true }).selectOption("Demo Reviewer");
  await expect.poll(async () => (await tasks(page))[0].assignee).toBe("Demo Reviewer");
  await page.getByRole("button", { name: "List layout", exact: true }).click();
  await page.getByLabel(`List stage for ${samples[0].title}`, { exact: true }).selectOption("done");
  await expect.poll(async () => (await tasks(page))[0].status).toBe("done");
  await page.getByRole("button", { name: "Edit Presentation link", exact: true }).click();
  await page.getByLabel("Presentation URL", { exact: true }).fill("https://example.com/pitch");
  await page.getByRole("button", { name: "Save link", exact: true }).click();
  await page.reload();
  expect((await tasks(page))[0]).toMatchObject({ id: samples[0].id, status: "done", assignee: "Demo Reviewer", createdDate: samples[0].createdDate });
  await expect(page.getByRole("link", { name: "Open Presentation (opens a new tab)", exact: true })).toHaveAttribute("href", "https://example.com/pitch");
  await editFirst(page);
  const context = page.getByLabel("Curated context", { exact: true });
  await context.fill("Keep my original decisions.");
  let expected = "Keep my original decisions.";
  for (const template of Object.values(CONTEXT_TEMPLATES)) {
    await page.getByRole("button", { name: `+ ${template.label}`, exact: true }).click();
    expected += `\n\n${template.text}`;
    await expect(context).toHaveValue(expected);
  }
  await save(page);
  await page.reload();
  expect((await tasks(page))[0].context).toBe(expected);
});

test("raw Recovery download includes the latest saved workspace and unfinished editor drafts", async ({ page }) => {
  await page.goto("/");
  await editFirst(page);
  await page.getByLabel("Task title", { exact: true }).fill("Latest work in the raw export");
  await save(page);
  await page.getByRole("button", { name: "New task", exact: true }).click();
  await page.getByLabel("Task title", { exact: true }).fill("Unfinished draft in raw export");
  await expect(page.getByText(/Recovery draft saved/)).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Recovery", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download protected raw data", exact: true }).click();
  const raw = await downloadedJSON(pending);
  expect(JSON.parse(raw[KEY]).data.projects[0].tasks[0].title).toBe("Latest work in the raw export");
  expect(Object.entries(raw).some(([key, value]) => key.startsWith("relay.draft:") && value.includes("Unfinished draft in raw export"))).toBe(true);
  expect(raw["vibetracker.tasks"]).toBe(JSON.stringify(samples));
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("unfinished drafts");
});
