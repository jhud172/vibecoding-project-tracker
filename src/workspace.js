import { ANCHORS, validAnchors, validTasks } from "./model.js";
import { validActivity } from "./competition.js";
import { validTemplates } from "./briefing.js";

export const WORKSPACE_KEY = "relay.workspace:v3";
export const MAX_HISTORY = 12;
const HISTORY_BUDGET = 1_200_000;
const copy = (value) => JSON.parse(JSON.stringify(value));
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const date = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

export function newProject(
  tasks = [],
  anchors = ANCHORS,
  activity = [],
  name = "James’s studio",
) {
  return {
    id: "studio",
    name,
    tasks: copy(tasks),
    anchors: copy(anchors),
    activity: copy(activity),
    trash: [],
    taskMeta: {},
  };
}
export function newData(project = newProject(), welcome = true) {
  return {
    projects: [project],
    activeProject: project.id,
    templates: [],
    view: {},
    welcome,
    lastBackupAt: null,
  };
}
export function validProject(p) {
  return (
    object(p) &&
    typeof p.id === "string" &&
    p.id.length > 0 &&
    p.id.length < 100 &&
    typeof p.name === "string" &&
    p.name.length > 0 &&
    p.name.length <= 100 &&
    validTasks(p.tasks) &&
    p.tasks.length <= 1000 &&
    validAnchors(p.anchors) &&
    validActivity(p.activity) &&
    Array.isArray(p.trash) &&
    p.trash.length <= 50 &&
    p.trash.every(
      (entry) =>
        object(entry) && validTasks([entry.task]) && date(entry.deletedAt),
    ) &&
    object(p.taskMeta) &&
    Object.keys(p.taskMeta).length <= 1000 &&
    (p.cloud === undefined ||
      (object(p.cloud) &&
        /^[0-9a-f-]{36}$/i.test(p.cloud.id) &&
        Number.isInteger(p.cloud.version) &&
        p.cloud.version > 0))
  );
}
export function validData(d) {
  return (
    object(d) &&
    Array.isArray(d.projects) &&
    d.projects.length > 0 &&
    d.projects.length <= 30 &&
    d.projects.every(validProject) &&
    new Set(d.projects.map((p) => p.id)).size === d.projects.length &&
    d.projects.some((p) => p.id === d.activeProject) &&
    validTemplates(d.templates) &&
    object(d.view) &&
    typeof d.welcome === "boolean" &&
    (d.lastBackupAt === null || date(d.lastBackupAt))
  );
}
export function validWorkspace(s) {
  const history = (list) =>
    Array.isArray(list) &&
    list.length <= MAX_HISTORY &&
    list.every(
      (entry) =>
        object(entry) &&
        date(entry.at) &&
        typeof entry.label === "string" &&
        validData(entry.data),
    );
  return (
    object(s) &&
    s.format === "relay-workspace" &&
    s.version === 3 &&
    typeof s.revision === "string" &&
    s.revision.length > 0 &&
    typeof s.writer === "string" &&
    date(s.updatedAt) &&
    validData(s.data) &&
    history(s.undo) &&
    history(s.redo)
  );
}
export function readWorkspace(raw) {
  let state;
  try {
    state = JSON.parse(raw);
  } catch {
    throw new Error(
      "Saved workspace is not valid JSON. Download the stored data before choosing a recovery action.",
    );
  }
  if (!validWorkspace(state))
    throw new Error(
      "Saved workspace has an unsupported or damaged structure. It has been left untouched.",
    );
  return state;
}
function trimHistory(entries) {
  let size = 0;
  const result = [];
  for (const entry of entries.slice(0, MAX_HISTORY)) {
    size += JSON.stringify(entry).length;
    if (size > HISTORY_BUDGET) break;
    result.push(entry);
  }
  return result;
}

/** One durable value is the transaction boundary. Old keys are never deleted. */
export function createWorkspaceStore(storage, options = {}) {
  const id = options.id || (() => crypto.randomUUID());
  const now = options.now || (() => new Date().toISOString());
  const writer = id();
  const listeners = new Set();
  let state;
  let error = "";
  let readOnly = false;
  let notice = "";
  let rawRecovery = "";
  let persisted = false;
  let snapshot;
  const publish = () => {
    snapshot = { state, error, notice, readOnly };
    listeners.forEach((listener) => listener());
  };
  const fresh = (data) => ({
    format: "relay-workspace",
    version: 3,
    revision: id(),
    writer,
    updatedAt: now(),
    data,
    undo: [],
    redo: [],
  });
  try {
    const raw = storage.getItem(WORKSPACE_KEY);
    if (raw !== null) {
      rawRecovery = raw;
      state = readWorkspace(raw);
      persisted = true;
    } else {
      const rawTasks = storage.getItem("vibetracker.tasks");
      const rawAnchors = storage.getItem("vibetracker.anchors");
      const rawActivity = storage.getItem("relay.activity:v1");
      rawRecovery = JSON.stringify(
        { tasks: rawTasks, anchors: rawAnchors, activity: rawActivity },
        null,
        2,
      );
      const tasks = rawTasks === null ? [] : JSON.parse(rawTasks);
      const anchors =
        rawAnchors === null ? copy(ANCHORS) : JSON.parse(rawAnchors);
      const activity = rawActivity === null ? [] : JSON.parse(rawActivity);
      const p = newProject(tasks, anchors, activity);
      if (!validProject(p))
        throw new Error(
          "Legacy saved data is damaged. Download its raw contents before resetting.",
        );
      state = fresh(newData(p, rawTasks === null && rawAnchors === null));
    }
  } catch (failure) {
    error = failure.message || "Browser storage is unavailable.";
    state = fresh(newData(newProject(), false));
    readOnly = true;
  }
  publish();
  const fail = (failure) => {
    error = failure.message || "The workspace could not be saved.";
    publish();
    throw failure;
  };
  const checkRevision = (expected) => {
    const raw = storage.getItem(WORKSPACE_KEY);
    if (raw === null) {
      if (persisted)
        throw new Error(
          "Saved workspace was removed in another tab. Download your current data before restoring it.",
        );
      return;
    }
    const latest = readWorkspace(raw);
    if (latest.revision !== expected) {
      state = latest;
      persisted = true;
      throw new Error(
        "Another tab changed this workspace. The latest saved version is loaded; review it and retry your action. Your change was not applied.",
      );
    }
  };
  const write = (next) => {
    next = copy(next);
    if (!validWorkspace(next))
      throw new Error(
        "This operation would create invalid workspace data. Nothing was saved.",
      );
    // A failed setItem leaves the previous complete envelope intact. Never split keys.
    let encoded = JSON.stringify(next);
    if (encoded.length > 4_000_000)
      throw new Error(
        "Workspace and recovery history are too large. Download a backup and reduce retained history before retrying.",
      );
    try {
      storage.setItem(WORKSPACE_KEY, encoded);
    } catch (failure) {
      // Only prune optional recovery snapshots, never active tasks, links, or drafts.
      if (failure.name !== "QuotaExceededError") throw failure;
      while (next.undo.length || next.redo.length) {
        if (next.redo.length) next.redo.pop();
        else next.undo.pop();
        try {
          storage.setItem(WORKSPACE_KEY, JSON.stringify(next));
          notice =
            "Saved. Older recovery snapshots were trimmed to fit browser storage; download a backup.";
          state = next;
          persisted = true;
          error = "";
          publish();
          return;
        } catch (retry) {
          if (retry.name !== "QuotaExceededError") throw retry;
        }
      }
      throw new Error(
        "Browser storage is full. The previous saved workspace is intact. Download a backup; this action was not saved.",
        { cause: failure },
      );
    }
    state = next;
    persisted = true;
    error = "";
    publish();
  };
  const run = (action) => {
    try {
      return action();
    } catch (failure) {
      return fail(failure);
    }
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    rawRecovery: () => rawRecovery,
    initialize() {
      if (readOnly || persisted) return;
      run(() => {
        const existing = storage.getItem(WORKSPACE_KEY);
        if (existing !== null) {
          state = readWorkspace(existing);
          persisted = true;
          publish();
        } else write(state);
      });
    },
    acceptExternal(raw) {
      try {
        if (raw === null)
          throw new Error(
            "Workspace storage was removed in another tab. Download a backup before continuing.",
          );
        const incoming = readWorkspace(raw);
        if (incoming.revision === state.revision) return;
        state = incoming;
        persisted = true;
        readOnly = false;
        error = "";
        notice =
          "Workspace updated from another tab. Review any open draft before saving.";
      } catch (failure) {
        rawRecovery = raw || rawRecovery;
        error = failure.message;
        readOnly = true;
      }
      publish();
    },
    commit(recipe, label, expected = state.revision, history = true) {
      return run(() => {
        if (readOnly)
          throw new Error(
            "Saved data is protected. Download its raw contents, then explicitly restore or reset the workspace.",
          );
        checkRevision(expected);
        const data = recipe(copy(state.data));
        if (JSON.stringify(data) === JSON.stringify(state.data)) return false;
        const undo = history
          ? trimHistory([{ at: now(), label, data: state.data }, ...state.undo])
          : state.undo;
        if (
          history &&
          undo.length < Math.min(state.undo.length + 1, MAX_HISTORY)
        )
          notice =
            "Older recovery snapshots were trimmed to keep local storage bounded.";
        write({
          ...state,
          revision: id(),
          writer,
          updatedAt: now(),
          data,
          undo,
          redo: history ? [] : state.redo,
        });
        return true;
      });
    },
    travel(direction, expected = state.revision) {
      return run(() => {
        if (readOnly)
          throw new Error("Restore protected data before changing it.");
        checkRevision(expected);
        const from = direction === "undo" ? state.undo : state.redo;
        if (!from.length) return false;
        const [entry, ...rest] = from;
        const opposite = trimHistory([
          { at: now(), label: entry.label, data: state.data },
          ...(direction === "undo" ? state.redo : state.undo),
        ]);
        write({
          ...state,
          revision: id(),
          writer,
          updatedAt: now(),
          data: entry.data,
          undo: direction === "undo" ? rest : opposite,
          redo: direction === "undo" ? opposite : rest,
        });
        return true;
      });
    },
    recover(data) {
      return run(() => {
        if (!validData(data))
          throw new Error("The replacement workspace is invalid.");
        // Explicit recovery only: preserve raw damaged text for the download action.
        write(fresh(copy(data)));
        readOnly = false;
        publish();
      });
    },
    clearMessage() {
      error = "";
      notice = "";
      publish();
    },
  };
}

export function addActivity(
  project,
  action,
  title,
  taskId = "",
  previous = null,
) {
  project.activity = [
    {
      id: crypto.randomUUID(),
      action,
      title,
      taskId,
      previous,
      at: new Date().toISOString(),
    },
    ...project.activity,
  ].slice(0, 80);
  return project;
}

export function estimateStorageBytes(storage) {
  let bytes = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    bytes += ((key || "").length + (storage.getItem(key) || "").length) * 2;
  }
  return bytes;
}
