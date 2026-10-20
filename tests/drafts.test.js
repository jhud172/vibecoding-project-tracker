import test from "node:test";
import assert from "node:assert/strict";
import { seedTasks } from "../src/model.js";
import { draftPrefix, findDraft, writeDraft } from "../src/drafts.js";

function storage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i],
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
  };
}
test("draft recovery is scoped to project/task and selects the latest valid record", () => {
  const s = storage();
  const task = seedTasks()[0];
  writeDraft(
    s,
    `${draftPrefix("one", task.id)}a`,
    task,
    { ...task, title: "First draft" },
    "2026-10-20T10:00:00Z",
  );
  writeDraft(
    s,
    `${draftPrefix("one", task.id)}b`,
    task,
    { ...task, title: "Newer draft" },
    "2026-10-20T11:00:00Z",
  );
  writeDraft(
    s,
    `${draftPrefix("two", task.id)}c`,
    task,
    { ...task, title: "Other project" },
    "2026-10-20T12:00:00Z",
  );
  assert.equal(findDraft(s, "one", task).draft.title, "Newer draft");
  assert.equal(findDraft(s, "two", task).draft.title, "Other project");
  assert.equal(findDraft(s, "missing", task), null);
});
test("damaged or oversized drafts are not restored and empty titles remain recoverable", () => {
  const s = storage();
  const task = seedTasks()[0];
  const prefix = draftPrefix("one", task.id);
  s.setItem(`${prefix}bad`, "not json");
  assert.equal(findDraft(s, "one", task), null);
  assert.throws(
    () =>
      writeDraft(s, `${prefix}large`, task, {
        ...task,
        context: "x".repeat(100001),
      }),
    /cannot be saved/,
  );
  writeDraft(s, `${prefix}valid`, task, {
    ...task,
    title: "",
    context: "Unfinished thinking",
  });
  assert.equal(findDraft(s, "one", task).draft.context, "Unfinished thinking");
});
