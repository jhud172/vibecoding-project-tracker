import test from "node:test";
import assert from "node:assert/strict";
import { emptyCapsule, saveCapsule, draftFromCapsule, extractSections, freshness, capsulePrompt, capsuleFile, parseCapsule, addCapsule, validCapsuleDraft, validCapsules } from "../src/capsules.js";
import { newData, newProject, validData, createWorkspaceStore, WORKSPACE_KEY } from "../src/workspace.js";
import { workspaceBackup, parseWorkspaceBackup, mergeWorkspace } from "../src/transfer.js";
const draft = () => ({ ...emptyCapsule(), title: "Menu handoff", notes: "Private original team notes", goal: "Keyboard access", nextStep: "Test Escape", revision: "abc123", evidence: [{ label: "Keyboard", command: "Manual Tab test", result: "Focus visible", status: "pass" }] });
const capsule = (id = "capsule-1") => saveCapsule(draft(), id, "2026-10-20T12:00:00.000Z");

test("capsules require an actionable goal and next step, and never infer passing evidence", () => {
  assert.throws(() => saveCapsule(emptyCapsule()), /title/);
  assert.throws(() => saveCapsule({ ...draft(), goal: " " }), /goal/);
  assert.throws(() => saveCapsule({ ...draft(), nextStep: " " }), /next step/);
  assert.throws(() => saveCapsule({ ...draft(), evidence: [{ label: "Test", command: "npm test", result: "", status: "pass" }] }), /actual|result/);
  const c = saveCapsule({ ...draft(), evidence: [] });
  assert.match(capsulePrompt(c), /No check results recorded/);
});
test("continuation drafts preserve the source snapshot and provenance", () => {
  const c = capsule(), next = draftFromCapsule(c);
  assert.equal(next.evidence[0].status, "not-run"); assert.equal(next.evidence[0].result, "");
  next.nextStep = "Recheck touch"; next.evidence[0].result = "New result";
  assert.equal(c.nextStep, "Test Escape"); assert.equal(c.evidence[0].result, "Focus visible");
  assert.equal(next.parentId, c.id); assert.equal(next.id, undefined);
});
test("notes heading extraction keeps repeated decisions, stops at unknown headings and never mutates raw notes", () => {
  const notes = "Meeting text\n## Goal\nShip it\nDecisions: Keep React\nDecisions: Keep Vite\n## Unrelated\nNot a decision\nNext step: Test\nVerify: Open the menu";
  const result = extractSections(notes);
  assert.equal(result.goal, "Ship it"); assert.equal(result.decisions, "Keep React\nKeep Vite");
  assert.equal(result.nextStep, "Test"); assert.equal(result.verify, "Open the menu");
  assert.equal(extractSections("unstructured notes").goal, undefined);
});
test("freshness is an honest revision comparison with unknown, differing and matching states", () => {
  const c = capsule();
  assert.equal(freshness(c, "").state, "unknown");
  assert.equal(freshness(c, "other").state, "changed");
  assert.equal(freshness(c, " abc123 ").state, "same");
  assert.equal(freshness(c, "ABC123").state, "changed");
  assert.match(freshness(c, "abc123").note, /not repository inspection/);
  assert.equal(freshness({ ...c, revision: "" }, "abc").state, "unknown");
});
test("curated export excludes raw notes by default, includes honest evidence and exports complete text", () => {
  const c = capsule(), prompt = capsulePrompt(c, "new-revision");
  assert.ok(!prompt.includes(c.notes)); assert.match(prompt, /recheck evidence/);
  assert.match(prompt, /user-reported, not executed by Relay/); assert.match(prompt, /Test Escape/);
  assert.ok(capsulePrompt(c, "", true).includes(c.notes));
});
test("capsule files roundtrip while damaged, executable and unsupported inputs reject", () => {
  const c = capsule();
  assert.deepEqual(parseCapsule(JSON.stringify(capsuleFile(c))), c);
  for (const value of ["{broken", "<script>alert(1)</script>", JSON.stringify({ format: "relay-capsule", version: 2, capsule: c }), JSON.stringify(capsuleFile({ ...c, evidence: [{}] }))]) assert.throws(() => parseCapsule(value));
  assert.throws(() => parseCapsule(" ".repeat(500001)), /500 KB/);
});
test("text limits, evidence outcomes, duplicate IDs and collection bounds are enforced", () => {
  assert.equal(validCapsuleDraft({ ...draft(), notes: "x".repeat(40001) }), false);
  assert.equal(validCapsuleDraft({ ...draft(), evidence: [{ label: "x", command: "", result: "", status: "certified" }] }), false);
  assert.equal(validCapsules([capsule(), capsule()]), false);
  const full = Array.from({ length: 40 }, (_, i) => capsule(`c-${i}`));
  assert.throws(() => addCapsule(full, capsule("new")), /40 capsules/);
});
test("identical capsule import is idempotent while changed identity collisions reject", () => {
  const c = capsule(), list = [c];
  assert.equal(addCapsule(list, structuredClone(c)), list);
  assert.throws(() => addCapsule(list, { ...c, nextStep: "Overwrite" }), /different capsule/);
});
test("old workspaces still validate and complete backups preserve capsules and saved drafts", () => {
  const old = newData(newProject()); assert.equal(validData(old), true);
  const data = structuredClone(old); data.projects[0].capsules = [capsule()]; data.projects[0].capsuleDraft = draft();
  assert.equal(validData(data), true);
  assert.deepEqual(parseWorkspaceBackup(JSON.stringify(workspaceBackup(data))).data, data);
  const merged = mergeWorkspace(old, data); assert.deepEqual(merged.projects[0].capsules, data.projects[0].capsules);
  assert.equal(merged.welcome, false);
  assert.deepEqual(merged.projects[0].capsuleDraft, draft());
  const bad = structuredClone(data); bad.projects[0].capsules[0].nextStep = "";
  assert.throws(() => parseWorkspaceBackup(JSON.stringify(workspaceBackup(bad))), /invalid/);
});
test("workspace merge never overwrites different capsules or current saved drafts", () => {
  const a = newData(newProject()); a.projects[0].capsules = [capsule()]; a.projects[0].capsuleDraft = draft();
  const b = structuredClone(a); b.projects[0].capsuleDraft.title = "Another draft";
  assert.equal(mergeWorkspace(a, b).projects[0].capsuleDraft.title, draft().title);
  b.projects[0].capsules[0].nextStep = "Changed";
  assert.throws(() => mergeWorkspace(a, b), /different capsule/);
  assert.equal(a.projects[0].capsules[0].nextStep, "Test Escape");
});
test("atomic capsule save supports Undo and a failed storage write preserves the complete prior value", () => {
  const values = new Map(); let fail = false;
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => { if (fail) throw new Error("Full"); values.set(k, v); } };
  const store = createWorkspaceStore(storage); store.initialize();
  const before = values.get(WORKSPACE_KEY);
  const recipe = d => { d.projects[0].capsules = [capsule()]; return d; };
  fail = true; assert.throws(() => store.commit(recipe, "Capsule", store.getSnapshot().state.revision), /Full/);
  assert.equal(values.get(WORKSPACE_KEY), before);
  fail = false; store.commit(recipe, "Capsule", store.getSnapshot().state.revision);
  assert.equal(store.getSnapshot().state.data.projects[0].capsules.length, 1);
  store.travel("undo", store.getSnapshot().state.revision);
  assert.equal(store.getSnapshot().state.data.projects[0].capsules, undefined);
});
