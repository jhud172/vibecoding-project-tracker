import test from "node:test";
import assert from "node:assert/strict";
import { ANCHORS, seedTasks } from "../src/model.js";
import {
  WORKSPACE_KEY,
  createWorkspaceStore,
  newData,
  newProject,
  validWorkspace,
} from "../src/workspace.js";

function memory(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    writes: 0,
    limit: Infinity,
    fail: false,
    getItem: (key) => map.get(key) ?? null,
    setItem(key, value) {
      if (this.fail) throw new Error("Storage unavailable");
      if (value.length > this.limit) {
        const error = new Error("Full");
        error.name = "QuotaExceededError";
        throw error;
      }
      this.writes++;
      map.set(key, value);
    },
    removeItem: (key) => map.delete(key),
    key: (n) => [...map.keys()][n],
    get length() {
      return map.size;
    },
  };
}
let count = 0;
const options = () => ({
  id: () => `revision-${++count}`,
  now: () => "2026-10-20T12:00:00.000Z",
});
const addTitle = (title) => (data) => {
  data.projects[0].name = title;
  return data;
};

test("legacy tasks, links and history migrate as one value without deleting old keys", () => {
  const tasks = seedTasks();
  const original = JSON.stringify(tasks);
  const storage = memory({
    "vibetracker.tasks": original,
    "vibetracker.anchors": JSON.stringify(ANCHORS),
  });
  const store = createWorkspaceStore(storage, options());
  assert.equal(storage.writes, 0);
  store.initialize();
  assert.equal(storage.writes, 1);
  assert.equal(storage.getItem("vibetracker.tasks"), original);
  assert.deepEqual(store.getSnapshot().state.data.projects[0].tasks, tasks);
  assert.ok(validWorkspace(JSON.parse(storage.getItem(WORKSPACE_KEY))));
  assert.equal(store.getSnapshot().state.data.welcome, false);
});
test("empty saved work stays empty and first-use choice starts without invented tasks", () => {
  const old = createWorkspaceStore(
    memory({ "vibetracker.tasks": "[]" }),
    options(),
  );
  assert.equal(old.getSnapshot().state.data.projects[0].tasks.length, 0);
  assert.equal(old.getSnapshot().state.data.welcome, false);
  const fresh = createWorkspaceStore(memory(), options());
  assert.equal(fresh.getSnapshot().state.data.welcome, true);
  assert.equal(fresh.getSnapshot().state.data.projects[0].tasks.length, 0);
});
test("persistent undo/redo survives reloading and a new mutation clears redo", () => {
  const storage = memory();
  let store = createWorkspaceStore(storage, options());
  store.initialize();
  store.commit(addTitle("First"), "Rename");
  store.commit(addTitle("Second"), "Rename");
  store = createWorkspaceStore(storage, options());
  store.travel("undo");
  assert.equal(store.getSnapshot().state.data.projects[0].name, "First");
  store = createWorkspaceStore(storage, options());
  store.travel("redo");
  assert.equal(store.getSnapshot().state.data.projects[0].name, "Second");
  store.travel("undo");
  store.commit(addTitle("Third"), "Rename");
  assert.equal(store.getSnapshot().state.redo.length, 0);
});
test("stale tab changes are rejected and latest saved state is loaded", () => {
  const storage = memory();
  const a = createWorkspaceStore(storage, options());
  a.initialize();
  const b = createWorkspaceStore(storage, options());
  a.commit(addTitle("New in tab A"), "Rename");
  assert.throws(
    () => b.commit(addTitle("Stale in B"), "Rename"),
    /Another tab/,
  );
  assert.equal(b.getSnapshot().state.data.projects[0].name, "New in tab A");
  assert.equal(
    JSON.parse(storage.getItem(WORKSPACE_KEY)).data.projects[0].name,
    "New in tab A",
  );
  b.commit(addTitle("Reviewed in B"), "Rename");
  a.acceptExternal(storage.getItem(WORKSPACE_KEY));
  assert.equal(a.getSnapshot().state.data.projects[0].name, "Reviewed in B");
});
test("a failed write leaves the previous complete workspace and history intact", () => {
  const storage = memory();
  const store = createWorkspaceStore(storage, options());
  store.initialize();
  store.commit(addTitle("Saved"), "Rename");
  const before = storage.getItem(WORKSPACE_KEY);
  const history = JSON.stringify(store.getSnapshot().state.undo);
  storage.fail = true;
  assert.throws(
    () =>
      store.commit((data) => {
        data.projects[0].name = "Unsaved";
        data.projects[0].anchors[0].url = "https://example.com";
        return data;
      }, "Two fields"),
    /unavailable/,
  );
  assert.equal(storage.getItem(WORKSPACE_KEY), before);
  assert.equal(store.getSnapshot().state.data.projects[0].name, "Saved");
  assert.equal(JSON.stringify(store.getSnapshot().state.undo), history);
});
test("corrupt saved values are protected until explicit validated recovery", () => {
  const raw = '{"broken":';
  const storage = memory({ [WORKSPACE_KEY]: raw });
  const store = createWorkspaceStore(storage, options());
  store.initialize();
  assert.equal(storage.writes, 0);
  assert.equal(store.rawRecovery(), raw);
  assert.equal(store.getSnapshot().readOnly, true);
  assert.throws(() => store.commit(addTitle("Bad"), "Rename"), /protected/);
  store.recover(newData(newProject(), false));
  assert.equal(store.getSnapshot().readOnly, false);
  assert.ok(validWorkspace(JSON.parse(storage.getItem(WORKSPACE_KEY))));
  assert.equal(store.rawRecovery(), raw);
});
test("quota recovery prunes only optional history and reports the loss of older snapshots", () => {
  const storage = memory();
  const store = createWorkspaceStore(storage, options());
  store.initialize();
  store.commit(addTitle("One"), "Rename");
  store.commit(addTitle("Two"), "Rename");
  const state = store.getSnapshot().state;
  storage.limit = JSON.stringify({ ...state, undo: [], redo: [] }).length + 200;
  store.commit(addTitle("Three"), "Rename");
  assert.equal(store.getSnapshot().state.data.projects[0].name, "Three");
  assert.match(store.getSnapshot().notice, /trimmed/);
  const before = storage.getItem(WORKSPACE_KEY);
  storage.limit = 1;
  assert.throws(
    () => store.commit(addTitle("Four"), "Rename"),
    /previous saved workspace is intact/,
  );
  assert.equal(storage.getItem(WORKSPACE_KEY), before);
});
test("one transaction updates related collections together and recovers deleted tasks", () => {
  const storage = memory({ "vibetracker.tasks": JSON.stringify(seedTasks()) });
  const store = createWorkspaceStore(storage, options());
  store.initialize();
  const writes = storage.writes;
  const task = store.getSnapshot().state.data.projects[0].tasks[0];
  store.commit((data) => {
    const p = data.projects[0];
    p.tasks = p.tasks.filter((t) => t.id !== task.id);
    p.trash.unshift({ task, deletedAt: "2026-10-20T12:00:00.000Z" });
    p.anchors[0].url = "https://example.com/";
    return data;
  }, "Delete and link");
  assert.equal(storage.writes, writes + 1);
  const loaded = createWorkspaceStore(storage, options()).getSnapshot().state
    .data.projects[0];
  assert.equal(loaded.tasks.length, 3);
  assert.equal(loaded.trash[0].task.id, task.id);
  assert.equal(loaded.anchors[0].url, "https://example.com/");
  store.travel("undo");
  assert.equal(store.getSnapshot().state.data.projects[0].tasks.length, 4);
});
