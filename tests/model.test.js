import test from "node:test";
import assert from "node:assert/strict";
import {
  ANCHORS,
  TEAM,
  deadline,
  daysUntil,
  isDate,
  resumePrompt,
  safeUrl,
  saveTask,
  seedTasks,
  taskPrompt,
  validAnchors,
  validTasks,
  validateTask,
} from "../src/model.js";

const now = new Date(2026, 9, 20, 14, 30);
const tasks = seedTasks(now);

test("four demo tasks use the locked model and all four stages", () => {
  assert.equal(tasks.length, 4);
  assert.equal(new Set(tasks.map((task) => task.status)).size, 4);
  assert.ok(validTasks(tasks));
  assert.equal(tasks[0].dueDate, "2026-10-23");
});
test("calendar dates reject impossible dates and handle DST", () => {
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2024-02-29"), true);
  assert.equal(daysUntil("2026-10-26", new Date(2026, 9, 24, 23, 59)), 2);
  assert.equal(daysUntil("2026-10-20", now), 0);
});
test("urgency distinguishes past, today, tomorrow, upcoming, safe and done", () => {
  const task = { ...tasks[0], status: "todo" };
  for (const [date, tone] of [
    ["2026-10-19", "overdue"],
    ["2026-10-20", "warning"],
    ["2026-10-21", "warning"],
    ["2026-10-22", "warning"],
    ["2026-10-23", "safe"],
    [null, "neutral"],
  ]) {
    assert.equal(deadline({ ...task, dueDate: date }, now).tone, tone);
  }
  assert.equal(
    deadline({ ...task, status: "done", dueDate: "2020-01-01" }, now).label,
    "Completed",
  );
});
test("task saving preserves identity and creation date", () => {
  const saved = saveTask(
    {
      ...tasks[0],
      title: "  Changed title  ",
      status: "done",
      assignee: TEAM[2],
    },
    tasks[0],
    now,
  );
  assert.equal(saved.id, tasks[0].id);
  assert.equal(saved.createdDate, tasks[0].createdDate);
  assert.equal(saved.title, "Changed title");
  assert.equal(saved.contextUpdatedAt, tasks[0].contextUpdatedAt);
});
test("context timestamp changes only with the briefing or source tool", () => {
  const later = new Date(now.getTime() + 3600000);
  assert.equal(
    saveTask({ ...tasks[0], description: "new description" }, tasks[0], later)
      .contextUpdatedAt,
    tasks[0].contextUpdatedAt,
  );
  assert.equal(
    saveTask({ ...tasks[0], context: "New decision" }, tasks[0], later)
      .contextUpdatedAt,
    later.toISOString(),
  );
  assert.equal(
    saveTask({ ...tasks[0], contextTool: "Claude" }, tasks[0], later)
      .contextUpdatedAt,
    later.toISOString(),
  );
  assert.equal(
    saveTask({ ...tasks[0], context: "" }, tasks[0], later).contextUpdatedAt,
    later.toISOString(),
  );
});
test("new tasks get a new ID and local creation date", () => {
  const saved = saveTask(
    { ...tasks[0], context: "", contextTool: null },
    null,
    now,
    "new-id",
  );
  assert.equal(saved.id, "new-id");
  assert.equal(saved.createdDate, "2026-10-20");
  assert.equal(saved.contextUpdatedAt, null);
});
test("invalid titles, stages, owners and tools are rejected", () => {
  for (const change of [
    { title: " " },
    { status: "unknown" },
    { assignee: "Fake user" },
    { type: "unknown" },
    { dueDate: "2026-13-01" },
    { contextTool: "Unknown" },
  ]) {
    assert.ok(validateTask({ ...tasks[0], ...change }));
  }
});
test("empty saved board is valid and corrupt data is rejected", () => {
  assert.ok(validTasks([]));
  assert.equal(validTasks(null), false);
  assert.equal(validTasks({ tasks }), false);
  assert.equal(validTasks([tasks[0], tasks[0]]), false);
  assert.equal(validTasks([{ ...tasks[0], title: null }]), false);
  assert.equal(validTasks([{ ...tasks[0], createdDate: "nonsense" }]), false);
});
test("deliverable URLs permit HTTP(S) only and reject credentials", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("data:text/html,hello"), null);
  assert.equal(safeUrl("https://user:password@example.com"), null);
  assert.equal(
    safeUrl("  https://example.com/demo  "),
    "https://example.com/demo",
  );
  assert.equal(safeUrl(""), null);
});
test("anchors require exactly the four known slots", () => {
  assert.ok(validAnchors(ANCHORS));
  assert.equal(validAnchors([]), false);
  assert.equal(
    validAnchors([ANCHORS[0], ANCHORS[0], ANCHORS[2], ANCHORS[3]]),
    false,
  );
  assert.equal(
    validAnchors(
      ANCHORS.map((anchor) => ({ ...anchor, url: "javascript:alert(1)" })),
    ),
    false,
  );
});
test("prompt contains the full task and curated context", () => {
  const prompt = taskPrompt(tasks[0]);
  for (const text of [
    tasks[0].title,
    tasks[0].description,
    tasks[0].context,
    tasks[0].assignee,
    tasks[0].dueDate,
    "ChatGPT",
    "Next step",
  ])
    assert.ok(prompt.includes(text));
  assert.ok(
    taskPrompt({ ...tasks[0], context: "", dueDate: null }).includes(
      "Ask for missing details",
    ),
  );
});
test("resume briefing orders unfinished tasks by urgency and includes anchors", () => {
  const prompt = resumePrompt(tasks, ANCHORS, now);
  assert.ok(prompt.indexOf(tasks[2].title) < prompt.indexOf(tasks[1].title));
  assert.ok(prompt.indexOf(tasks[1].title) < prompt.indexOf(tasks[0].title));
  assert.ok(!prompt.includes(tasks[3].title));
  assert.ok(prompt.includes("3 unfinished tasks"));
  assert.ok(prompt.includes("Presentation: Not linked yet"));
  assert.ok(resumePrompt([], ANCHORS, now).includes("All tasks are done"));
});
