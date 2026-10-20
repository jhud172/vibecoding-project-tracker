import {
  ANCHORS,
  STAGES,
  daysUntil,
  safeUrl,
  validAnchors,
  validTasks,
} from "./model.js";

export const CONTEXT_TEMPLATES = {
  build: {
    label: "Build a feature",
    text: "## Decisions\n[Record the approach and constraints]\n\n## What works\n[Summarise the current implementation]\n\n## Next step\n[Describe one concrete action]\n\n## Verify\n[Describe how to check the result]",
  },
  debug: {
    label: "Investigate a bug",
    text: "## Decisions\n[Record what you have ruled out]\n\n## Reproduce\n[Steps, expected result and actual result]\n\n## Next step\n[The next hypothesis to test]\n\n## Verify\n[The regression check that proves the fix]",
  },
  handoff: {
    label: "Hand off work",
    text: "## Decisions\n[Explain the choices worth preserving]\n\n## What works\n[What is finished and where to find it]\n\n## Next step\n[What the next person should do first]\n\n## Verify\n[Acceptance criteria and remaining risks]",
  },
};

// Presence checks are explainable hints, not an AI assessment of correctness.
export function contextChecklist(task) {
  const text = (task.context || "").replace(/\[[^\]]*\]/g, "");
  const hasSection = (pattern) => {
    const lines = text.split(/\n|\.\s+/);
    return lines.some((line, index) => {
      const match = line
        .trim()
        .match(
          new RegExp(
            `^(?:#{1,3}\\s*)?(?:${pattern})(?:\\s*:\\s*|\\s*$)(.*)$`,
            "i",
          ),
        );
      if (!match) return false;
      if (/[a-z0-9]/i.test(match[1])) return true;
      for (const following of lines.slice(index + 1)) {
        if (!following.trim()) continue;
        return (
          !/^#|^(?:decisions|what works|reproduce|next step|next action|next|verify|verification|acceptance criteria|done when|test)\s*:/i.test(
            following.trim(),
          ) && /[a-z0-9]/i.test(following)
        );
      }
      return false;
    });
  };
  const prose = text.replace(/^#{1,3}.*$/gm, "").trim();
  return [
    {
      id: "brief",
      label: "A clear task brief",
      done: (task.description || "").trim().length >= 20,
      hint: "Add at least a sentence describing the outcome.",
    },
    {
      id: "context",
      label: "Useful saved context",
      done: prose.length >= 60,
      hint: "Capture decisions, progress or constraints in your own words.",
    },
    {
      id: "next",
      label: "A concrete next step",
      done: hasSection("next step|next action|next"),
      hint: "Add “Next step:” followed by an action.",
    },
    {
      id: "verify",
      label: "A way to verify it",
      done: hasSection(
        "verify|verification|acceptance criteria|done when|test",
      ),
      hint: "Add “Verify:” followed by an observable check.",
    },
  ];
}

export function focusQueue(tasks, now = new Date()) {
  const stageOrder = { "in-progress": 0, review: 1, todo: 2 };
  return tasks
    .filter((task) => task.status !== "done")
    .slice()
    .sort((a, b) => {
      const aDays = daysUntil(a.dueDate, now) ?? Infinity;
      const bDays = daysUntil(b.dueDate, now) ?? Infinity;
      return (
        aDays - bDays ||
        stageOrder[a.status] - stageOrder[b.status] ||
        a.createdDate.localeCompare(b.createdDate) ||
        a.id.localeCompare(b.id)
      );
    });
}

export function focusReason(task, now = new Date()) {
  const days = daysUntil(task.dueDate, now);
  if (days !== null && days < 0)
    return "Its deadline has passed. Resolve it or agree a new date.";
  if (days === 0)
    return "Due today. Make this the next thing you move forward.";
  if (days !== null)
    return "The earliest upcoming deadline in your unfinished work.";
  if (task.status === "in-progress")
    return "Already in progress. Finish an open loop before starting another.";
  if (task.status === "review")
    return "Ready for a second look. Review it and close the loop.";
  return "No deadline set. This is the oldest task waiting for its next move.";
}

export function describeChange(previous, next) {
  if (!previous) return "Created task";
  if (!next) return "Deleted task";
  if (
    previous.context !== next.context ||
    previous.contextTool !== next.contextTool
  )
    return "Updated context";
  if (previous.status !== next.status)
    return `Moved to ${STAGES.find((stage) => stage.id === next.status)?.label}`;
  if (previous.assignee !== next.assignee)
    return `Handed off to ${next.assignee}`;
  return "Edited task";
}

export function validActivity(value) {
  return (
    Array.isArray(value) &&
    value.length <= 80 &&
    new Set(value.map((entry) => entry?.id)).size === value.length &&
    value.every(
      (entry) =>
        entry &&
        typeof entry.id === "string" &&
        entry.id.length > 0 &&
        typeof entry.title === "string" &&
        typeof entry.action === "string" &&
        typeof entry.taskId === "string" &&
        typeof entry.at === "string" &&
        Number.isFinite(Date.parse(entry.at)) &&
        (entry.previous === null || validTasks([entry.previous])),
    )
  );
}

export function makeBackup(tasks, anchors, activity = [], now = new Date()) {
  return {
    format: "relay",
    version: 2,
    exportedAt: now.toISOString(),
    tasks,
    anchors,
    activity,
  };
}

export function parseBackup(text) {
  if (typeof text !== "string" || text.length > 2_000_000)
    throw new Error("Choose a JSON backup smaller than 2 MB.");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (
    !data ||
    typeof data !== "object" ||
    (data.version != null && data.version !== 2) ||
    (data.format != null && data.format !== "relay")
  )
    throw new Error("This backup format is not supported.");
  if (
    !validTasks(data.tasks) ||
    data.tasks.length > 1000 ||
    !validAnchors(data.anchors)
  )
    throw new Error(
      "The backup contains invalid tasks or deliverable links. Nothing was changed.",
    );
  if (
    data.tasks.some(
      (task) =>
        task.description.length > 100_000 ||
        (task.context || "").length > 100_000,
    )
  )
    throw new Error("A task exceeds the 100,000-character import limit.");
  if (data.activity != null && !validActivity(data.activity))
    throw new Error("The backup contains invalid activity history.");
  // Select the locked fields explicitly; never spread arbitrary imported properties.
  const cleanTask = (task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    status: task.status,
    assignee: task.assignee,
    dueDate: task.dueDate || null,
    createdDate: task.createdDate,
    context: task.context || "",
    contextTool: task.contextTool || null,
    contextUpdatedAt: task.contextUpdatedAt || null,
  });
  return {
    tasks: data.tasks.map(cleanTask),
    anchors: ANCHORS.map((anchor) => ({
      ...anchor,
      url: safeUrl(data.anchors.find((item) => item.id === anchor.id).url),
    })),
    activity: (data.activity || []).map((entry) => ({
      id: entry.id,
      taskId: entry.taskId,
      title: entry.title,
      action: entry.action,
      at: entry.at,
      previous: entry.previous ? cleanTask(entry.previous) : null,
    })),
  };
}

export function mergeBackup(currentTasks, currentAnchors, incoming) {
  const ids = new Set(currentTasks.map((task) => task.id));
  return {
    tasks: [
      ...currentTasks,
      ...incoming.tasks.filter((task) => !ids.has(task.id)),
    ],
    anchors: currentAnchors.map((anchor) => ({
      ...anchor,
      url:
        anchor.url ||
        incoming.anchors.find((item) => item.id === anchor.id)?.url ||
        null,
    })),
  };
}
