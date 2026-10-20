import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
test.use({ reducedMotion: "reduce" });
const KEY = "relay.workspace:v3";
const notes = "Private meeting note\nGoal: Finish the menu\nDecisions: Keep React\nWhat works: Desktop links\nNext step: Check keyboard focus\nVerify: Press Tab and Escape\nRisks: Touch untested";
const project = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.projects[0], KEY);
async function start(page, title = "Team menu session") {
  await page.getByRole("button", { name: "Create capsule", exact: true }).click();
  await page.getByLabel("Capsule title", { exact: true }).fill(title);
  await page.getByLabel("Team / session notes", { exact: true }).fill(notes);
  await page.getByRole("button", { name: "Use headings from notes", exact: true }).click();
  await page.getByRole("button", { name: "Continue to handoff sections", exact: true }).click();
  await expect(page.getByLabel("Goal (required)", { exact: true })).toHaveValue("Finish the menu");
}
async function finish(page) {
  await page.getByRole("button", { name: "Continue to review", exact: true }).click();
  await page.getByLabel("Recorded revision", { exact: true }).fill("abc123");
  await page.getByRole("button", { name: "Save capsule", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Take off here");
}
test("first use explains capsules, captures notes, reports evidence honestly and reviews clipboard sharing", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pick up exactly where you left off.");
  await page.getByRole("button", { name: "Start an empty workspace", exact: true }).click();
  await page.getByText("New here? How Relay fits your work", { exact: true }).click();
  await expect(page.locator("#capsules")).toContainText("does not read your chats");
  await start(page);
  await expect(page.getByRole("heading", { name: "2. Decide where to take off", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Continue to review", exact: true }).click();
  await page.getByLabel("Recorded revision", { exact: true }).fill("abc123");
  await page.getByRole("button", { name: "Add evidence item", exact: true }).click();
  await page.getByLabel("Check name 1", { exact: true }).fill("Desktop check");
  await page.getByLabel("Command / evidence source 1", { exact: true }).fill("Manual desktop navigation");
  await page.getByLabel("Reported outcome 1", { exact: true }).selectOption("pass");
  await page.getByRole("button", { name: "Save capsule", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("describe the result");
  await expect(page.getByRole("alert")).toBeFocused();
  await page.getByLabel("Actual result / blocker 1", { exact: true }).fill("All desktop links opened; touch not checked.");
  await page.getByRole("button", { name: "Save capsule", exact: true }).click();
  await page.getByLabel("Current revision to compare", { exact: true }).fill("def456");
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("Revision differs");
  await page.getByRole("button", { name: "Copy capsule handoff", exact: true }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Check keyboard focus"); expect(copied).toContain("user-reported"); expect(copied).not.toContain("Private meeting note");
  await page.getByLabel("Include original notes in the copied / Markdown handoff", { exact: true }).check();
  await expect(page.getByLabel("Review the handoff before sharing", { exact: true })).toHaveValue(/Private meeting note/);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
test("saved capsule drafts survive reload and continuation preserves the earlier snapshot", async ({ page }) => {
  await page.goto("/"); await start(page);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("Draft saved");
  await page.reload();
  await page.getByRole("button", { name: "Continue saved capsule draft", exact: true }).click();
  await page.getByRole("button", { name: "2. Shape the handoff", exact: true }).click();
  await finish(page);
  const original = (await project(page)).capsules[0];
  await page.getByRole("button", { name: "Start next session from this capsule", exact: true }).click();
  await page.getByLabel("Capsule title", { exact: true }).fill("Second session");
  await page.getByRole("button", { name: "2. Shape the handoff", exact: true }).click();
  await page.getByLabel("Next step (required)", { exact: true }).fill("Test touch navigation");
  await finish(page);
  const saved = (await project(page)).capsules;
  expect(saved).toHaveLength(2); expect(saved[1]).toEqual(original); expect(saved[0].parentId).toBe(original.id);
});
test("capsule download imports through review, duplicate import is safe, malformed input preserves saved data", async ({ page }) => {
  await page.goto("/"); await start(page); await finish(page);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download full capsule (includes notes)", exact: true }).click();
  const file = await pending; const text = await readFile(await file.path(), "utf8");
  expect(JSON.parse(text).capsule.notes).toBe(notes);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  const input = page.getByLabel("Import a Resume Capsule", { exact: true });
  await input.setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{broken") });
  await expect(page.locator("#capsules").getByRole("alert")).toContainText("not valid JSON");
  expect((await project(page)).capsules).toHaveLength(1);
  await input.setInputFiles({ name: "capsule.json", mimeType: "application/json", buffer: Buffer.from(text) });
  await expect(page.getByRole("dialog")).toContainText("No saved work has changed");
  await page.getByRole("button", { name: "Import reviewed capsule", exact: true }).click();
  expect((await project(page)).capsules).toHaveLength(1);
  const imported = JSON.parse(text); imported.capsule.id = "from-other-device"; imported.capsule.title = "Other device handoff";
  await input.setInputFiles({ name: "another.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(imported)) });
  await page.getByRole("button", { name: "Import reviewed capsule", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open capsule: Other device handoff", exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "Find a capsule", exact: true }).fill("missing xyz");
  await expect(page.locator("#capsules")).toContainText("No capsules match");
  await page.getByRole("button", { name: "Clear capsule search", exact: true }).click();
});
test("notes file, keyboard steps and enlarged mobile editor reflow work without inventing results", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await page.getByLabel("Text size", { exact: true }).selectOption("200"); await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Create capsule", exact: true }).click();
  await page.getByLabel("Load notes file", { exact: true }).setInputFiles({ name: "meeting.md", mimeType: "text/markdown", buffer: Buffer.from(notes) });
  await expect(page.getByLabel("Team / session notes", { exact: true })).toHaveValue(notes);
  await page.getByLabel("Capsule title", { exact: true }).fill("Mobile handoff");
  await page.getByRole("button", { name: "Use headings from notes", exact: true }).click();
  await page.getByRole("button", { name: "Continue to handoff sections", exact: true }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "2. Decide where to take off", exact: true })).toBeFocused();
  await page.getByLabel("Next step (required)", { exact: true }).fill("Averylongwordwithoutspaces".repeat(15));
  await finish(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.getByRole("dialog").evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze(); expect(results.violations).toEqual([]);
});
test("failed persistence keeps the editor text, removal can be undone, denied clipboard has manual copy", async ({ page }) => {
  await page.goto("/"); await start(page);
  await page.evaluate(() => { const set = Storage.prototype.setItem; window.__restoreCapsuleStorage = () => { Storage.prototype.setItem = set; }; Storage.prototype.setItem = function(key, value) { if (key === "relay.workspace:v3") throw new Error("Storage blocked"); return set.call(this, key, value); }; });
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Storage blocked");
  await expect(page.getByLabel("Next step (required)", { exact: true })).toHaveValue("Check keyboard focus");
  await page.evaluate(() => window.__restoreCapsuleStorage()); await finish(page);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied"); } } }));
  await page.getByRole("button", { name: "Copy capsule handoff", exact: true }).click();
  await expect(page.getByRole("dialog").last()).toContainText("manually");
  await page.getByRole("dialog").last().getByRole("button", { name: "Close dialog", exact: true }).click();
  page.once("dialog", d => d.accept());
  await page.getByRole("button", { name: "Remove capsule", exact: true }).click();
  await expect.poll(async () => (await project(page)).capsules.length).toBe(0);
  await page.getByRole("banner").getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(async () => (await project(page)).capsules.length).toBe(1);
});

test("a competing tab cannot silently replace a capsule draft", async ({ page, context }) => {
  await page.goto("/"); await start(page, "First tab");
  const other = await context.newPage(); await other.goto("/"); await start(other, "Second tab");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("Draft saved");
  await other.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(other.getByRole("dialog").getByRole("alert")).toContainText(/changed elsewhere|Another tab/);
  await expect(other.getByLabel("Next step (required)", { exact: true })).toHaveValue("Check keyboard focus");
  expect((await project(page)).capsuleDraft.title).toBe("First tab");
});

test("hero starts capture directly and a real notes drop preserves original text", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create a Resume Capsule", exact: true }).click();
  const data = await page.evaluateHandle(text => {
    const value = new DataTransfer(); value.items.add(new File([text], "dropped.md", { type: "text/markdown" })); return value;
  }, notes);
  await page.getByLabel("Team / session notes", { exact: true }).dispatchEvent("drop", { dataTransfer: data });
  await expect(page.getByLabel("Team / session notes", { exact: true })).toHaveValue(notes);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze(); expect(results.violations).toEqual([]);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  expect((await project(page)).capsules).toBeUndefined();
  expect((await project(page)).capsuleDraft.notes).toBe(notes);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start an empty workspace", exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.welcome, KEY)).toBe(false);
});

test("the fully prefilled example can be reviewed and saved without entering any data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try an example draft", exact: true }).click();
  await expect(page.getByLabel("Capsule title", { exact: true })).toHaveValue("Campus Companion — mobile menu handoff");
  await expect(page.getByLabel("Team / session notes", { exact: true })).toHaveValue(/FICTIONAL DEMO PROJECT/);
  expect((await project(page)).capsules).toBeUndefined();
  await page.getByRole("button", { name: "Continue to handoff sections", exact: true }).click();
  for (const label of ["Goal (required)", "Decisions", "Tried / rejected", "What works", "Next step (required)", "How to verify", "Risks / unknowns"])
    await expect(page.getByLabel(label, { exact: true })).not.toHaveValue("");
  await page.getByRole("button", { name: "Continue to review", exact: true }).click();
  await expect(page.getByLabel("Recorded revision", { exact: true })).toHaveValue("demo-revision-1");
  await expect(page.getByLabel("Reported outcome 1", { exact: true })).toHaveValue("not-run");
  await page.getByRole("button", { name: "Save capsule", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Take off here");
  const saved = (await project(page)).capsules;
  expect(saved).toHaveLength(1); expect(saved[0].people).toBe("James — solo developer");
  expect(saved[0].evidence[0].status).toBe("not-run");
  await expect(page.getByLabel("Review the handoff before sharing", { exact: true })).toHaveValue(/demo-revision-1/);
});
