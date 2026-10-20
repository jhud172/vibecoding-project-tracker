export const STAGES = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];
export const TEAM = ["James", "Demo Designer", "Demo Reviewer"];
export const TOOLS = [
  "Claude",
  "ChatGPT",
  "Cursor",
  "Lovable",
  "Replit",
  "Other",
];
export const ANCHORS = [
  { id: "presentation", label: "Presentation", url: null },
  { id: "demo", label: "Demo", url: null },
  { id: "report", label: "Report", url: null },
  { id: "documentation", label: "Documentation", url: null },
];

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && localDate(parsed) === value;
}

export function daysUntil(value, now = new Date()) {
  if (!isDate(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  // Calendar-day arithmetic is independent of daylight-saving hour changes.
  return Math.round(
    (Date.UTC(year, month - 1, day) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000,
  );
}

export function deadline(task, now = new Date()) {
  if (task.status === "done") return { tone: "neutral", label: "Completed" };
  const days = daysUntil(task.dueDate, now);
  if (days === null) return { tone: "neutral", label: "No deadline" };
  if (days < 0) return { tone: "overdue", label: `${Math.abs(days)}d overdue` };
  if (days === 0) return { tone: "warning", label: "Due today" };
  if (days === 1) return { tone: "warning", label: "Due tomorrow" };
  if (days === 2) return { tone: "warning", label: "Due in 2 days" };
  return {
    tone: "safe",
    label: new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  };
}

export function safeUrl(value) {
  if (!value || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function validateTask(task) {
  if (!task.title?.trim()) return "Give this task a title.";
  if (task.title.trim().length > 120)
    return "Keep the title to 120 characters.";
  if (!STAGES.some((stage) => stage.id === task.status))
    return "Choose a valid stage.";
  if (!TEAM.includes(task.assignee)) return "Choose a studio member.";
  if (!["feature", "bug"].includes(task.type)) return "Choose feature or bug.";
  if (task.dueDate && !isDate(task.dueDate)) return "Choose a valid due date.";
  if (task.contextTool && !TOOLS.includes(task.contextTool))
    return "Choose a valid context tool.";
  return "";
}

export function saveTask(draft, previous = null, now = new Date(), id = null) {
  const context = (draft.context || "").trim();
  const contextTool = draft.contextTool || null;
  const contextChanged =
    context !== (previous?.context || "") ||
    contextTool !== (previous?.contextTool || null);
  return {
    id: previous?.id || id || crypto.randomUUID(),
    title: draft.title.trim(),
    description: (draft.description || "").trim(),
    type: draft.type,
    status: draft.status,
    assignee: draft.assignee,
    dueDate: draft.dueDate || null,
    createdDate: previous?.createdDate || localDate(now),
    context,
    contextTool,
    contextUpdatedAt: contextChanged
      ? now.toISOString()
      : previous?.contextUpdatedAt || null,
  };
}

export function validTasks(value) {
  return (
    Array.isArray(value) &&
    new Set(value.map((task) => task?.id)).size === value.length &&
    value.every(
      (task) =>
        task &&
        typeof task.id === "string" &&
        task.id.length &&
        typeof task.title === "string" &&
        typeof task.description === "string" &&
        !validateTask(task) &&
        isDate(task.createdDate) &&
        (task.context == null || typeof task.context === "string") &&
        (task.contextUpdatedAt == null ||
          (typeof task.contextUpdatedAt === "string" &&
            !Number.isNaN(Date.parse(task.contextUpdatedAt)))),
    )
  );
}

export function validAnchors(value) {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    ANCHORS.every(
      (anchor) => value.filter((item) => item?.id === anchor.id).length === 1,
    ) &&
    value.every(
      (item) =>
        typeof item.label === "string" &&
        (item.url === null ||
          (typeof item.url === "string" && !!safeUrl(item.url))),
    )
  );
}

export function taskPrompt(task) {
  return [
    `# Task: ${task.title}`,
    "",
    `Type: ${task.type}`,
    `Stage: ${STAGES.find((stage) => stage.id === task.status)?.label || task.status}`,
    `Owner: ${task.assignee}`,
    `Due: ${task.dueDate || "Not set"}`,
    `Created: ${task.createdDate}`,
    "",
    "## Brief",
    task.description || "No description provided.",
    "",
    "## Curated context",
    task.context ||
      "No saved context yet. Ask for missing details before making assumptions.",
    "",
    `Source tool: ${task.contextTool || "Not specified"}`,
    `Context updated: ${task.contextUpdatedAt || "Not recorded"}`,
    "",
    "## Next step",
    "Continue this task using the briefing above. State any assumptions and verify the result.",
  ].join("\n");
}

export function resumePrompt(tasks, anchors, now = new Date()) {
  const unfinished = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const aDays = daysUntil(a.dueDate, now) ?? Infinity;
      const bDays = daysUntil(b.dueDate, now) ?? Infinity;
      return (
        aDays - bDays ||
        a.createdDate.localeCompare(b.createdDate) ||
        a.id.localeCompare(b.id)
      );
    });
  return [
    "# Relay — resume work",
    `Prepared: ${localDate(now)}`,
    "",
    `${unfinished.length} unfinished task${unfinished.length === 1 ? "" : "s"}. Start with the earliest deadline.`,
    "This briefing is a snapshot of one browser, not a live shared board.",
    "",
    "## Deliverables",
    ...anchors.map(
      (anchor) => `- ${anchor.label}: ${anchor.url || "Not linked yet"}`,
    ),
    "",
    ...(unfinished.length
      ? unfinished.map((task) => `${taskPrompt(task)}\n\n---`)
      : [
          "All tasks are done. Review deliverables and prepare the next iteration.",
        ]),
  ].join("\n");
}

export function seedTasks(now = new Date()) {
  const offset = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return localDate(date);
  };
  const rows = [
    [
      "demo-brief",
      "Shape the project story",
      "Turn the idea into a clear problem, a user and a useful first version.",
      "feature",
      "todo",
      TEAM[0],
      3,
      "Demo task. Audience: university students building with AI. Frame the pitch around lost task context. Next: write a one-sentence problem statement and three acceptance criteria.",
    ],
    [
      "demo-context",
      "Make the next prompt better",
      "Bring the decisions, constraints and next steps into one useful briefing.",
      "feature",
      "in-progress",
      TEAM[0],
      0,
      "Demo task. Keep React, Vite and localStorage. A useful context block includes what works, what failed and the next action. Next: test copying this task into an AI chat.",
    ],
    [
      "demo-date",
      "Check the deadline edge cases",
      "Make sure a finished task never looks overdue and dates stay local.",
      "bug",
      "review",
      TEAM[2],
      -1,
      "Demo task. Compare yesterday, today and tomorrow. Done tasks must display Completed. Use local dates, including across daylight-saving changes. Next: verify the boundary cases.",
    ],
    [
      "demo-design",
      "Give the studio a visual voice",
      "Warm paper, forest green and a little room to think.",
      "feature",
      "done",
      TEAM[1],
      -2,
      "Demo task. Design direction: quiet editorial workspace. Colours and component decisions are in DESIGN.md. Next: review contrast and keyboard focus.",
    ],
  ];
  return rows.map(
    ([id, title, description, type, status, assignee, due, context]) => ({
      id,
      title,
      description,
      type,
      status,
      assignee,
      dueDate: offset(due),
      createdDate: offset(-3),
      context,
      contextTool: "ChatGPT",
      contextUpdatedAt: now.toISOString(),
    }),
  );
}
