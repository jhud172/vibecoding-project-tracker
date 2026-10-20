export const BRIEF_SECTIONS = [
  "Decisions",
  "What works",
  "Next step",
  "Verify",
  "Risks",
];

/** Preserve every byte outside the edited section, including unknown headings. */
export function briefingSections(text = "") {
  const starts = [...text.matchAll(/^#{1,3}\s+([^\n]+)\n?/gm)];
  return starts.map((match, i) => ({
    heading: match[1].trim(),
    start: match.index,
    bodyStart: match.index + match[0].length,
    end: starts[i + 1]?.index ?? text.length,
    body: text
      .slice(match.index + match[0].length, starts[i + 1]?.index ?? text.length)
      .trimEnd(),
  }));
}
export function updateSection(text, heading, value) {
  const section = briefingSections(text).find(
    (item) => item.heading.toLowerCase() === heading.toLowerCase(),
  );
  if (!section)
    return `${text}${text && !text.endsWith("\n\n") ? "\n\n" : ""}## ${heading}\n${value}\n`;
  return (
    text.slice(0, section.bodyStart) + value + "\n\n" + text.slice(section.end)
  );
}
export function lineChanges(before = "", after = "") {
  const oldLines = before.split("\n"),
    newLines = after.split("\n");
  const oldSet = new Set(oldLines),
    newSet = new Set(newLines);
  return {
    removed: oldLines.filter((line) => line && !newSet.has(line)),
    added: newLines.filter((line) => line && !oldSet.has(line)),
  };
}
export function conciseBrief(task) {
  const sections = briefingSections(task.context);
  const pick = (heading) => {
    const section = sections.find(
      (item) => item.heading.toLowerCase() === heading.toLowerCase(),
    )?.body;
    const pattern =
      heading === "Next step"
        ? "next step|next action|next"
        : "verify|verification|acceptance criteria|done when|test";
    const prose = (task.context || "")
      .split(/\n|\.\s+/)
      .map((line) =>
        line.trim().match(new RegExp(`^(?:${pattern}):\\s*(.+)$`, "i")),
      )
      .find(Boolean)?.[1];
    return section || prose || "Not captured; review the full context.";
  };
  return `# ${task.title || "Untitled task"}\nOwner: ${task.assignee}\nStage: ${task.status}\nDue: ${task.dueDate || "No date"}\n\n## Next step\n${pick("Next step")}\n\n## Verify\n${pick("Verify")}`;
}
export function validTemplates(templates) {
  return (
    Array.isArray(templates) &&
    templates.length <= 50 &&
    templates.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        t.id.length <= 100 &&
        typeof t.label === "string" &&
        t.label.trim().length > 0 &&
        t.label.length <= 80 &&
        typeof t.text === "string" &&
        t.text.length <= 100_000,
    ) &&
    new Set(templates.map((t) => t.id)).size === templates.length
  );
}
