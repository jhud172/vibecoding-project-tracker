import { validData, newData, newProject } from "./workspace.js";
import { parseBackup } from "./competition.js";
import { validAccess } from "./accessibility.js";
import { addCapsule } from "./capsules.js";
const clone = (value) => JSON.parse(JSON.stringify(value));
export function workspaceBackup(data, preferences, now = new Date()) {
  return {
    format: "relay-bundle",
    version: 3,
    exportedAt: now.toISOString(),
    data: clone(data),
    ...(preferences ? { preferences: clone(preferences) } : {}),
  };
}
export function parseWorkspaceBackup(text) {
  if (
    typeof text !== "string" ||
    new TextEncoder().encode(text).length > 8_000_000
  )
    throw new Error("Choose a JSON backup smaller than 8 MB.");
  let bundle;
  try {
    bundle = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON. Nothing was changed.");
  }
  if (bundle?.format !== "relay-bundle") {
    const legacy = parseBackup(text);
    return workspaceBackup(
      newData(newProject(legacy.tasks, legacy.anchors, legacy.activity), false),
    );
  }
  if (
    bundle.version !== 3 ||
    !validData(bundle.data) ||
    (bundle.preferences !== undefined && !validAccess(bundle.preferences))
  )
    throw new Error(
      "The backup contains invalid or unsupported workspace data. Nothing was changed.",
    );
  for (const project of bundle.data.projects) {
    if (
      [
        ...project.tasks,
        ...project.trash.map((e) => e.task),
        ...project.activity.flatMap((e) => (e.previous ? [e.previous] : [])),
      ].some(
        (t) =>
          t.description.length > 100000 || (t.context || "").length > 100000,
      )
    )
      throw new Error("A task exceeds the 100,000-character import limit.");
  }
  return workspaceBackup(bundle.data, bundle.preferences);
}
export function importConflicts(current, incoming) {
  return incoming.projects.flatMap((p) => {
    const present = current.projects.find((item) => item.id === p.id);
    if (!present) return [];
    return [
      ...p.tasks.flatMap((task) => {
        const old = present.tasks.find((item) => item.id === task.id);
        return old && JSON.stringify(old) !== JSON.stringify(task)
          ? [
              {
                key: `${p.id}:task:${task.id}`,
                label: `${p.name}: ${task.title}`,
                before: old.context || old.description,
                after: task.context || task.description,
              },
            ]
          : [];
      }),
      ...p.anchors.flatMap((anchor) => {
        const old = present.anchors.find((a) => a.id === anchor.id);
        return old.url && anchor.url && old.url !== anchor.url
          ? [
              {
                key: `${p.id}:link:${anchor.id}`,
                label: `${p.name}: ${anchor.label}`,
                before: old.url,
                after: anchor.url,
              },
            ]
          : [];
      }),
    ];
  });
}
export function mergeWorkspace(current, incoming, choices = {}) {
  const data = clone(current);
  for (const p of incoming.projects) {
    const present = data.projects.find((item) => item.id === p.id);
    if (!present) {
      data.projects.push(clone(p));
      continue;
    }
    for (const task of p.tasks) {
      const index = present.tasks.findIndex((item) => item.id === task.id);
      if (index < 0) present.tasks.push(clone(task));
      else if (choices[`${p.id}:task:${task.id}`] === "incoming")
        present.tasks[index] = clone(task);
    }
    for (const capsule of p.capsules || []) present.capsules = addCapsule(present.capsules, clone(capsule));
    // Keep the current saved draft during merge; full replacement remains explicit.
    if (!present.capsuleDraft && p.capsuleDraft) present.capsuleDraft = clone(p.capsuleDraft);
    present.anchors = present.anchors.map((anchor) => {
      const next = p.anchors.find((a) => a.id === anchor.id);
      return !anchor.url || choices[`${p.id}:link:${anchor.id}`] === "incoming"
        ? clone(next)
        : anchor;
    });
  }
  for (const template of incoming.templates)
    if (!data.templates.some((t) => t.id === template.id))
      data.templates.push(clone(template));
  if (data.projects.some(p => p.capsules?.length || p.capsuleDraft)) data.welcome = false;
  if (!validData(data))
    throw new Error(
      "The merged workspace exceeds supported limits. Choose fewer projects or tasks before importing.",
    );
  return data;
}
