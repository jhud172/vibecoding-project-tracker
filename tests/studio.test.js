import test from "node:test";
import assert from "node:assert/strict";
import { ANCHORS, seedTasks } from "../src/model.js";
import {
  CONTEXT_TEMPLATES,
  contextChecklist,
  describeChange,
  focusQueue,
  focusReason,
  makeBackup,
  mergeBackup,
  parseBackup,
  validActivity,
} from "../src/competition.js";

const now = new Date(2026, 9, 20, 12);
const tasks = seedTasks(now);
const checks = (
  context,
  description = "Explain the outcome and the constraints clearly.",
) =>
  Object.fromEntries(
    contextChecklist({ context, description }).map((item) => [
      item.id,
      item.done,
    ]),
  );

test("blank briefing scaffolds do not masquerade as completed handoffs", () => {
  for (const template of Object.values(CONTEXT_TEMPLATES)) {
    const result = checks(template.text);
    assert.equal(result.context, false);
    assert.equal(result.next, false);
    assert.equal(result.verify, false);
  }
});
test("handoff checks recognise populated headings and colon-form prose", () => {
  const context =
    "We retain localStorage and the four-stage schema because it matches the requirements.\n## Next step\nImplement the task editor.\n## Verify\nCreate a task and refresh; the task must remain.";
  assert.deepEqual(checks(context), {
    brief: true,
    context: true,
    next: true,
    verify: true,
  });
  assert.equal(
    checks("Next: build the editor. Verify: refresh the saved task.").next,
    true,
  );
  assert.equal(
    checks("Next: build the editor. Verify: refresh the saved task.").verify,
    true,
  );
  assert.equal(
    checks("next steps are interesting but no instruction follows").next,
    false,
  );
  assert.equal(checks("## Next step\n\n## Verify\nRun the test.").next, false);
  assert.equal(checks("Next step:\nVerify: Run the test.").next, false);
  assert.equal(
    checks("## Next step\nBuild the editor.\n## Verify\n").verify,
    false,
  );
});
test("focus ordering handles overdue, tied dates, undated work and completed work", () => {
  const input = [
    { ...tasks[0], id: "undated", dueDate: null },
    { ...tasks[0], id: "todo", dueDate: "2026-10-20" },
    { ...tasks[0], id: "active", dueDate: "2026-10-20", status: "in-progress" },
    { ...tasks[0], id: "overdue", dueDate: "2026-10-19" },
    { ...tasks[0], id: "done", status: "done", dueDate: "2020-01-01" },
  ];
  const original = JSON.stringify(input);
  assert.deepEqual(
    focusQueue(input, now).map((task) => task.id),
    ["overdue", "active", "todo", "undated"],
  );
  assert.equal(JSON.stringify(input), original);
  assert.match(focusReason(input[3], now), /deadline has passed/);
  assert.deepEqual(focusQueue([], now), []);
});
test("activity describes the most relevant change and validates old context snapshots", () => {
  assert.equal(describeChange(null, tasks[0]), "Created task");
  assert.equal(describeChange(tasks[0], null), "Deleted task");
  assert.equal(
    describeChange(tasks[0], { ...tasks[0], status: "done" }),
    "Moved to Done",
  );
  const entry = {
    id: "event",
    title: "Task",
    taskId: tasks[0].id,
    action: "Updated context",
    at: now.toISOString(),
    previous: tasks[0],
  };
  assert.ok(validActivity([entry]));
  assert.equal(validActivity([entry, entry]), false);
  assert.equal(
    validActivity([{ ...entry, previous: { context: "partial" } }]),
    false,
  );
  assert.equal(validActivity([{ ...entry, at: "invalid" }]), false);
  assert.equal(validActivity(Array(81).fill(entry)), false);
});
test("versioned and original Relay backups roundtrip without altering identity or dates", () => {
  const fresh = parseBackup(
    JSON.stringify(makeBackup(tasks, ANCHORS, [], now)),
  );
  assert.deepEqual(fresh.tasks, tasks);
  assert.deepEqual(fresh.anchors, ANCHORS);
  const legacy = parseBackup(
    JSON.stringify({ exportedAt: now.toISOString(), tasks, anchors: ANCHORS }),
  );
  assert.deepEqual(legacy.tasks, tasks);
  assert.deepEqual(legacy.activity, []);
});
test("invalid imports reject before returning workspace data", () => {
  const valid = makeBackup(tasks, ANCHORS);
  for (const input of [
    "{",
    JSON.stringify({ ...valid, version: 3 }),
    JSON.stringify({ ...valid, format: "something-else" }),
    JSON.stringify({ ...valid, tasks: [tasks[0], tasks[0]] }),
    JSON.stringify({ ...valid, tasks: [{ ...tasks[0], assignee: "Unknown" }] }),
    JSON.stringify({
      ...valid,
      anchors: ANCHORS.map((anchor) => ({
        ...anchor,
        url: "javascript:alert(1)",
      })),
    }),
    JSON.stringify({ ...valid, activity: [{ previous: "bad" }] }),
    " ".repeat(2_000_001),
  ])
    assert.throws(() => parseBackup(input));
});
test("import strips unexpected properties and restores canonical anchor labels", () => {
  const parsed = parseBackup(
    JSON.stringify({
      tasks: [{ ...tasks[0], extra: "untrusted" }],
      anchors: ANCHORS.map((anchor) => ({
        ...anchor,
        label: "Changed label",
        extra: "ignore",
      })),
    }),
  );
  assert.equal("extra" in parsed.tasks[0], false);
  assert.deepEqual(parsed.anchors, ANCHORS);
});
test("merge never overwrites existing IDs or populated deliverable links", () => {
  const currentAnchors = ANCHORS.map((anchor) => ({
    ...anchor,
    url: anchor.id === "demo" ? "https://existing.example/" : null,
  }));
  const incoming = {
    tasks: [{ ...tasks[0], title: "Conflicting change" }, tasks[1]],
    anchors: ANCHORS.map((anchor) => ({
      ...anchor,
      url: "https://incoming.example/",
    })),
  };
  const merged = mergeBackup([tasks[0]], currentAnchors, incoming);
  assert.deepEqual(merged.tasks, [tasks[0], tasks[1]]);
  assert.equal(
    merged.anchors.find((anchor) => anchor.id === "demo").url,
    "https://existing.example/",
  );
  assert.equal(
    merged.anchors.find((anchor) => anchor.id === "report").url,
    "https://incoming.example/",
  );
});
