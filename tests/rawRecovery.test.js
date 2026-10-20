import test from "node:test";
import assert from "node:assert/strict";
import { rawStorageValues } from "../src/rawRecovery.js";

test("raw recovery preserves exact current and damaged strings, drafts and legacy data without exporting account tokens", () => {
  const entries = [
    ["relay.workspace:v3", " { damaged current JSON"],
    ["relay.draft:v1:editor", '{"context":"unfinished"}'],
    ["vibetracker.tasks", "[legacy original]"],
    ["relay.accessibility:v1", '{"theme":"dark"}'],
    ["sb-test-auth-token", "do not export"],
    ["unrelated", "do not export"],
  ];
  const storage = { length: entries.length, key: i => entries[i][0], getItem: key => entries.find(e => e[0] === key)[1] };
  assert.deepEqual(rawStorageValues(storage), Object.fromEntries(entries.slice(0, 4)));
  assert.equal(storage.length, 6);
  assert.throws(() => rawStorageValues({ get length() { throw new Error("Storage denied"); } }), /Storage denied/);
});
