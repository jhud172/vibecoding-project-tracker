import test from "node:test";
import assert from "node:assert/strict";
import { newData, newProject } from "../src/workspace.js";
import { seedTasks } from "../src/model.js";
import { DEFAULT_ACCESS } from "../src/accessibility.js";
import {
  workspaceBackup,
  parseWorkspaceBackup,
  importConflicts,
  mergeWorkspace,
} from "../src/transfer.js";
test("complete backups preserve templates and opt-in accessibility settings", () => {
  const data = newData(newProject(seedTasks()));
  data.templates = [{ id: "t", label: "Test", text: "Private notes" }];
  const plain = workspaceBackup(data);
  assert.equal(plain.preferences, undefined);
  const imported = parseWorkspaceBackup(
    JSON.stringify(workspaceBackup(data, DEFAULT_ACCESS)),
  );
  assert.deepEqual(imported.data, data);
  assert.deepEqual(imported.preferences, DEFAULT_ACCESS);
  assert.throws(
    () =>
      parseWorkspaceBackup('{"format":"relay-bundle","version":3,"data":{}}'),
    /invalid/,
  );
});
test("merge defaults to current content, while explicit conflict choices replace only selected tasks", () => {
  const data = newData(newProject(seedTasks()));
  const incoming = structuredClone(data);
  incoming.projects[0].tasks[0].context = "Changed in backup";
  const [conflict] = importConflicts(data, incoming);
  assert.ok(conflict);
  assert.equal(
    mergeWorkspace(data, incoming).projects[0].tasks[0].context,
    data.projects[0].tasks[0].context,
  );
  assert.equal(
    mergeWorkspace(data, incoming, { [conflict.key]: "incoming" }).projects[0]
      .tasks[0].context,
    "Changed in backup",
  );
  assert.notEqual(data.projects[0].tasks[0].context, "Changed in backup");
});
