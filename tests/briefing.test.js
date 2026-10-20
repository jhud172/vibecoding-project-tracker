import test from "node:test";
import assert from "node:assert/strict";
import {
  briefingSections,
  conciseBrief,
  lineChanges,
  updateSection,
  validTemplates,
} from "../src/briefing.js";
test("concise exports recognise existing colon-form next actions", () => {
  const result = conciseBrief({
    title: "Legacy",
    assignee: "James",
    status: "todo",
    context:
      "A decision. Next: Inspect the board. Verify: Reload successfully.",
  });
  assert.match(result, /## Next step\nInspect the board/);
  assert.match(result, /## Verify\nReload successfully/);
});
test("section editing preserves free text and unknown sections", () => {
  const raw =
    "An introduction\n\n## Custom notes\nKeep this verbatim.\n\n## Next step\nOld action\n\n## Verify\nA check\n";
  const result = updateSection(raw, "Next step", "New action");
  assert.ok(
    result.startsWith(
      "An introduction\n\n## Custom notes\nKeep this verbatim.\n\n",
    ),
  );
  assert.ok(result.endsWith("## Verify\nA check\n"));
  assert.equal(
    briefingSections(result).find((s) => s.heading === "Next step").body,
    "New action",
  );
  assert.ok(updateSection(raw, "Risks", "A risk").startsWith(raw));
});
test("concise handoff includes ownership, next action and honest missing-section fallback", () => {
  const result = conciseBrief({
    title: "Task",
    assignee: "James",
    status: "todo",
    context: "## Next step\nInspect the result",
  });
  assert.match(result, /Owner: James/);
  assert.match(result, /Inspect the result/);
  assert.match(result, /Not captured/);
});
test("line comparisons show removed and added prose", () =>
  assert.deepEqual(lineChanges("Keep\nOld", "Keep\nNew"), {
    removed: ["Old"],
    added: ["New"],
  }));
test("reusable templates reject duplicate identities and unbounded text", () => {
  const t = { id: "one", label: "Research", text: "Steps" };
  assert.equal(validTemplates([t]), true);
  assert.equal(validTemplates([t, t]), false);
  assert.equal(validTemplates([{ ...t, text: "a".repeat(100001) }]), false);
});
