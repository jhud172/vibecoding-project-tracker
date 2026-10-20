import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { Journal } from "./Journal.jsx";
import { CapsuleHome } from "./Capsules.jsx";
import { turnWorkspacePage } from "./motion.js";
import WorkspaceTransfer from "./WorkspaceTransfer.jsx";
import { workspaceBackup } from "./transfer.js";
import { validAccess } from "./accessibility.js";
const CloudPanel = lazy(() => import("./CloudPanel.jsx"));
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  CheckCheck,
  Circle,
  Clipboard,
  Clock3,
  Code2,
  FileText,
  Flag,
  FolderOpen,
  LayoutGrid,
  Link2,
  MoreHorizontal,
  Plus,
  Presentation,
  RotateCcw,
  RotateCw,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Workflow,
  X,
  Target,
  History,
  Command,
  List,
  GripVertical,
} from "lucide-react";
import {
  ANCHORS,
  STAGES,
  TEAM,
  TOOLS,
  deadline,
  localDate,
  resumePrompt,
  safeUrl,
  saveTask,
  seedTasks,
  taskPrompt,
  validateTask,
} from "./model";
import { useLocalStorage } from "./useLocalStorage";
import { useWorkspace } from "./useWorkspace";
import { useDraft } from "./useDraft";
import { addActivity, newData, newProject } from "./workspace";
import { RecoveryPanel, WelcomePanel } from "./Recovery.jsx";
import { BriefingTools, ContextComparison } from "./BriefingTools.jsx";
import {
  AccessButton,
  AccessibilityPanel,
  ReadButton,
  ReadingDock,
  useAccess,
} from "./Accessibility.jsx";
import { spokenTask } from "./accessibility";
import { Field, Modal, buttonClass, fieldClass, primaryClass } from "./ui";
import { contextChecklist, describeChange } from "./competition";
import {
  ActivityPanel,
  CommandMenu,
  ContextCoach,
  FocusDesk,
  TaskList,
  WorkspacePulse,
} from "./Studio";

export { STAGES, TEAM, useLocalStorage };
const toneClasses = {
  neutral: "bg-due-neutral text-text-muted",
  safe: "bg-due-safe text-type-feature",
  warning: "bg-due-warning text-warning",
  overdue: "bg-due-overdue text-type-bug",
};
const cardTints = {
  neutral: "bg-surface-card",
  safe: "bg-surface-card",
  warning: "bg-due-warning",
  overdue: "bg-due-overdue",
};
const stageColours = [
  "bg-text-muted",
  "bg-warning",
  "bg-brand-primary",
  "bg-brand-primary",
];
const anchorIcons = {
  presentation: Presentation,
  demo: Code2,
  report: FileText,
  documentation: BookOpen,
};
const anchorHints = {
  presentation: "The story behind the work",
  demo: "A working proof of the idea",
  report: "What you learned along the way",
  documentation: "Everything the next person needs",
};

function TaskEditor({
  task,
  projectId,
  onClose,
  onSave,
  onDelete,
  onCopy,
  activity,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}) {
  const [draft, setDraft] = useState(task);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invalidField, setInvalidField] = useState("");
  const versions = activity
    .filter(
      (entry) =>
        entry.taskId === task.id &&
        entry.action === "Updated context" &&
        entry.previous,
    )
    .slice(0, 8);
  const change = (key, value) => {
    if (key === invalidField) { setInvalidField(""); setError(""); }
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(task);
  const recovery = useDraft(projectId, task, draft, dirty);
  const close = () => {
    if (!dirty) {
      onClose();
      return;
    }
    const saved = recovery.flush();
    if (
      window.confirm(
        saved
          ? "Close this editor? A recovery draft will be kept so you can continue later."
          : "The recovery draft could not be saved. Have you copied your text before closing?",
      )
    )
      onClose();
  };
  return (
    <Modal
      title={task.id ? "A little more context." : "Make your next move."}
      subtitle={
        task.id
          ? "Edit the task. Leave a useful trail for what comes next."
          : "A clear task is a good place to start."
      }
      onClose={close}
      wide
    >
      <form
        className="space-y-5 p-6"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const message = validateTask(draft);
          setError(message);
          if (message) {
            const field = /title/.test(message) ? "title"
              : /stage/.test(message) ? "status"
              : /member/.test(message) ? "assignee"
              : /feature or bug/.test(message) ? "type"
              : /due date/.test(message) ? "dueDate" : "contextTool";
            setInvalidField(field);
            event.currentTarget.elements.namedItem(field)?.focus();
            return;
          }
          setInvalidField("");
          setSaving(true);
          const result = await onSave(draft);
          if (result) {
            setError(result);
            setSaving(false);
          } else recovery.clear();
        }}
      >
        {recovery.recovery && (
          <div
            role="status"
            className="rounded-xl border border-line bg-surface-tint p-4"
          >
            <p className="text-sm font-semibold">
              An unfinished draft is available.
            </p>
            <p className="my-2 text-xs text-text-muted">
              Saved {new Date(recovery.recovery.at).toLocaleString("en-GB")}.
              Loading it changes this draft only; saving still checks the latest
              task version.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClass}
                onClick={() => {
                  if (
                    dirty &&
                    !window.confirm(
                      "Replace your current editor text with the recovered draft? Copy any text you want to keep first.",
                    )
                  )
                    return;
                  const saved = recovery.restore();
                  if (saved) setDraft({ ...task, ...saved });
                }}
              >
                Continue recovered draft
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={recovery.dismiss}
              >
                Keep editing current task
              </button>
            </div>
          </div>
        )}
        {recovery.error && (
          <p role="alert" className="text-sm text-type-bug">
            {recovery.error}
          </p>
        )}
        {recovery.savedAt && dirty && (
          <p className="text-xs text-text-muted">
            Recovery draft saved{" "}
            {new Date(recovery.savedAt).toLocaleTimeString("en-GB")}
          </p>
        )}
        <Field label="Task title" error={invalidField === "title" ? error : undefined}>
          <input
            name="title"
            data-autofocus
            className={fieldClass}
            value={draft.title}
            onChange={(event) => change("title", event.target.value)}
            maxLength={120}
            required
            placeholder="What needs to happen?"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={fieldClass}
            value={draft.description}
            onChange={(event) => change("description", event.target.value)}
            rows={2}
            placeholder="The outcome, constraints and what done looks like."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Task type" error={invalidField === "type" ? error : undefined}>
            <select
              name="type"
              className={fieldClass}
              value={draft.type}
              onChange={(event) => change("type", event.target.value)}
            >
              <option value="feature">Feature</option>
              <option value="bug">Bug</option>
            </select>
          </Field>
          <Field label="Stage" error={invalidField === "status" ? error : undefined}>
            <select
              name="status"
              className={fieldClass}
              value={draft.status}
              onChange={(event) => change("status", event.target.value)}
            >
              {STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee" error={invalidField === "assignee" ? error : undefined}>
            <select
              name="assignee"
              className={fieldClass}
              value={draft.assignee}
              onChange={(event) => change("assignee", event.target.value)}
            >
              {TEAM.map((member) => (
                <option key={member}>{member}</option>
              ))}
            </select>
          </Field>
          <Field label="Due date" error={invalidField === "dueDate" ? error : undefined}>
            <input
              name="dueDate"
              className={fieldClass}
              type="date"
              min="1900-01-01"
              max="9999-12-31"
              value={draft.dueDate || ""}
              onInput={(event) => change("dueDate", event.currentTarget.value)}
              onChange={(event) => change("dueDate", event.target.value)}
            />
          </Field>
        </div>
        <section className="rounded-xl border border-line bg-surface-tint p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-brand-primary">
            <Sparkles size={17} />
            <h3 className="font-semibold">
              Leave the next prompt a head start.
            </h3>
          </div>
          <div className="mb-3">
            <ReadButton
              text={spokenTask(draft)}
              title={draft.title || "Task draft"}
            />
          </div>
          <BriefingTools
            task={draft}
            onChange={(text) => change("context", text)}
            templates={templates}
            onSaveTemplate={onSaveTemplate}
            onDeleteTemplate={onDeleteTemplate}
            onCopy={onCopy}
          />
          <Field
            label="Curated context"
            hint="Capture decisions, what worked, what failed, and the next step. Avoid passwords or API keys."
          >
            <textarea
              className={fieldClass}
              rows={5}
              value={draft.context || ""}
              onChange={(event) => change("context", event.target.value)}
              placeholder="We decided to…\nWhat works so far…\nThe next step is…"
            />
          </Field>
          <div className="mt-3">
            <Field label="Context tool" error={invalidField === "contextTool" ? error : undefined}>
              <select
                name="contextTool"
                className={fieldClass}
                value={draft.contextTool || ""}
                onChange={(event) =>
                  change("contextTool", event.target.value || null)
                }
              >
                <option value="">Not specified</option>
                {TOOLS.map((tool) => (
                  <option key={tool}>{tool}</option>
                ))}
              </select>
            </Field>
          </div>
          {task.contextUpdatedAt && (
            <p className="mt-2 text-xs text-text-muted">
              Last context update:{" "}
              {new Date(task.contextUpdatedAt).toLocaleString("en-GB")}
            </p>
          )}
          <div className="mt-4">
            <ContextCoach
              task={draft}
              onTemplate={(text) =>
                change(
                  "context",
                  draft.context?.trim()
                    ? `${draft.context.trim()}\n\n${text}`
                    : text,
                )
              }
            />
          </div>
          {versions.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <button
                type="button"
                aria-expanded={historyOpen}
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex items-center gap-2 text-xs font-medium text-brand-primary"
              >
                <History size={14} /> Earlier context ({versions.length})
              </button>
              {historyOpen && (
                <div className="mt-3 space-y-3">
                  {versions.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-line bg-surface-card p-3"
                    >
                      <p className="text-[0.75rem] text-text-muted">
                        Before {new Date(entry.at).toLocaleString("en-GB")} ·{" "}
                        {entry.previous.contextTool || "No tool set"}
                      </p>
                      <p className="my-2 max-h-28 overflow-auto whitespace-pre-wrap text-xs text-text-muted">
                        {entry.previous.context || "Empty context"}
                      </p>
                      <ContextComparison
                        before={entry.previous.context || ""}
                        current={draft.context || ""}
                        onAppend={(passage) =>
                          change(
                            "context",
                            `${draft.context || ""}${draft.context ? "\n\n" : ""}${passage}`,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-xs font-medium text-brand-primary underline"
                        onClick={() => {
                          if (
                            dirty &&
                            !window.confirm(
                              "Replace your draft context with this earlier version? Other draft fields will stay unchanged.",
                            )
                          )
                            return;
                          setDraft((current) => ({
                            ...current,
                            context: entry.previous.context || "",
                            contextTool: entry.previous.contextTool || null,
                          }));
                          setHistoryOpen(false);
                        }}
                      >
                        Use this version in the draft
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
        {task.id && (
          <p className="text-xs text-text-muted">
            Created {task.createdDate} · ID {task.id}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-type-bug">
            {error}
          </p>
        )}
        {deleting ? (
          <div className="rounded-xl border border-line bg-due-overdue p-4">
            <p className="text-sm font-medium">
              Move this task to Recovery? You can restore it there or use Undo.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`${buttonClass} !border-type-bug !text-type-bug`}
                onClick={async () => {
                  setSaving(true);
                  const result = await onDelete(task.id);
                  if (result) {
                    setError(result);
                    setSaving(false);
                  } else recovery.clear();
                }}
                disabled={saving}
              >
                Yes, delete task
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() => setDeleting(false)}
              >
                Keep task
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <div className="flex gap-2">
              {task.id && (
                <button
                  type="button"
                  aria-label="Delete task"
                  className={`${buttonClass} !px-2.5 !text-type-bug`}
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 size={17} />
                </button>
              )}
              {task.id && (
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => onCopy(taskPrompt(saveTask(draft, task)))}
                >
                  <Clipboard size={16} />
                  Copy as Prompt Context
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" className={buttonClass} onClick={close}>
                Cancel
              </button>
              <button className={primaryClass} type="submit" disabled={saving}>
                {saving ? "Saving…" : task.id ? "Save changes" : "Create task"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

function AnchorEditor({ anchor, onClose, onSave }) {
  const [url, setUrl] = useState(anchor.url || "");
  const [error, setError] = useState("");
  return (
    <Modal
      title={`Link your ${anchor.label.toLowerCase()}`}
      subtitle="Keep the final destination close to the work."
      onClose={onClose}
    >
      <form
        className="space-y-5 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = safeUrl(url);
          if (url.trim() && !parsed) {
            setError(
              "Use a complete http:// or https:// URL without login credentials.",
            );
            event.currentTarget.querySelector("input")?.focus();
            return;
          }
          setError("");
          const failure = await onSave(parsed);
          if (failure) setError(failure);
        }}
      >
        <Field
          label={`${anchor.label} URL`}
          hint="Paste a full link, or leave blank to remove it."
          error={error || undefined}
        >
          <input
            data-autofocus
            onInvalid={(event) => event.currentTarget.focus()}
            className={fieldClass}
            value={url}
            onChange={(event) => { setUrl(event.target.value); setError(""); }}
            placeholder="https://"
          />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-type-bug">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonClass} onClick={onClose}>
            Cancel
          </button>
          <button className={primaryClass} type="submit">
            Save link
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TaskCard({
  task,
  now,
  onEdit,
  onUpdate,
  onCopy,
  onDragStart,
  onDragEnd,
}) {
  const due = deadline(task, now);
  const TypeIcon = task.type === "bug" ? Bug : Sparkles;
  const contextCount = contextChecklist(task).filter(
    (item) => item.done,
  ).length;
  return (
    <article
      data-testid="task-card"
      onClick={() => onEdit(task)}
      className={`motion-card group cursor-pointer overflow-hidden rounded-xl border border-line border-l-[3px] ${cardTints[due.tone]} shadow-[0_2px_3px_0_#252B2705] transition hover:shadow-md motion-reduce:transition-none ${task.type === "bug" ? "border-l-type-bug" : "border-l-type-feature"}`}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            draggable
            onClick={(event) => event.stopPropagation()}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", task.id);
              event.dataTransfer.effectAllowed = "move";
              onDragStart(task.id);
            }}
            onDragEnd={onDragEnd}
            title="Drag to another stage, or use the stage dropdown"
            aria-hidden="true"
            className="cursor-grab text-text-muted active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-wider ${task.type === "bug" ? "text-type-bug" : "text-type-feature"}`}
          >
            <TypeIcon size={13} />
            {task.type}
          </span>
          <button
            type="button"
            className="rounded p-1 text-text-muted hover:bg-surface-subtle focus-visible:outline-brand-primary"
            aria-label={`Edit ${task.title}`}
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <button
            type="button"
            className="text-left focus-visible:rounded focus-visible:outline-brand-primary"
          >
            {task.title}
          </button>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-text-muted">
          {task.description || "Add a brief so the next step is clear."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.75rem] font-medium ${toneClasses[due.tone]}`}
          >
            {task.status === "done" ? (
              <CheckCheck size={12} />
            ) : (
              <Clock3 size={12} />
            )}
            {due.label}
          </span>
          {task.id.startsWith("demo-") && (
            <span className="text-[0.75rem] uppercase tracking-wider text-text-muted">
              Demo
            </span>
          )}
        </div>
        <div
          className="mt-4 flex items-center gap-2 border-t border-line pt-3"
          onClick={(event) => event.stopPropagation()}
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent text-[0.75rem] font-semibold text-brand-primary"
          >
            {task.assignee === "James"
              ? "JH"
              : task.assignee === "Demo Designer"
                ? "DD"
                : "DR"}
          </span>
          <select
            aria-label={`Hand off ${task.title} to`}
            value={task.assignee}
            onChange={(event) =>
              onUpdate(task, { assignee: event.target.value })
            }
            className="min-w-0 flex-1 rounded bg-transparent py-1 text-xs text-text-muted focus-visible:outline-brand-primary"
          >
            {TEAM.map((member) => (
              <option key={member}>{member}</option>
            ))}
          </select>
        </div>
        <div
          className="mt-3 flex items-center justify-between gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <select
            aria-label={`Stage for ${task.title}`}
            value={task.status}
            onChange={(event) => onUpdate(task, { status: event.target.value })}
            className="min-w-0 rounded-md border border-line bg-surface-subtle p-1.5 text-[0.75rem] focus-visible:outline-brand-primary"
          >
            {STAGES.map((stage) => (
              <option value={stage.id} key={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md p-1.5 text-[0.75rem] font-medium text-brand-primary hover:bg-due-safe focus-visible:outline-brand-primary"
            aria-label={`Copy as Prompt Context: ${task.title}`}
            title="Copy as Prompt Context"
            onClick={() => onCopy(taskPrompt(task))}
          >
            <Clipboard size={13} />
            Context
          </button>
        </div>
      </div>
      <div
        className={`flex items-center gap-1.5 px-4 py-2 text-[0.75rem] ${task.context?.trim() ? "bg-due-safe text-type-feature" : "bg-surface-subtle text-text-muted"}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${task.context?.trim() ? "bg-type-feature" : "bg-text-muted"}`}
        />
        {contextCount === 4
          ? "Handoff essentials present"
          : `${contextCount}/4 handoff essentials · refine context`}
      </div>
    </article>
  );
}

export default function App() {
  const { prefs } = useAccess();
  const workspace = useWorkspace();
  const { project, updateProject } = workspace;
  const { tasks, anchors, activity } = project;
  const taskError = workspace.error;
  const anchorError = "";
  const activityError = "";
  const [editing, setEditing] = useState(null);
  const undo = workspace.state.undo.length > 0;
  const [view, setView] = useState("capsules");
  const [capsuleRequest, setCapsuleRequest] = useState(0);
  const [chosenLayout, setLayout] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches ? "list" : "board",
  );
  const layout = prefs.textSize >= 150 ? "list" : chosenLayout;
  const [contextFilter, setContextFilter] = useState("all");
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const searchRef = useRef(null);
  const [editingAnchor, setEditingAnchor] = useState(null);
  const [panel, setPanel] = useState(null);
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const [kind, setKind] = useState("all");
  const [toast, setToast] = useState(null);
  const [clipboardFallback, setClipboardFallback] = useState(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);
  const notify = (message) => setToast({ message });
  const undoChange = async () => {
    const result = await workspace.undo();
    notify(result.ok ? "Change undone. Redo is available." : result.error);
  };
  const redoChange = async () => {
    const result = await workspace.redo();
    notify(result.ok ? "Change reapplied." : result.error);
  };
  const showBoard = () => {
    turnWorkspacePage(() => {
      setView("board");
      setContextFilter("all");
    });
  };
  const showFocus = () => {
    turnWorkspacePage(() => setView("focus"));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const showCapsules = () => {
    setCapsuleRequest(0);
    turnWorkspacePage(() => setView("capsules"));
    requestAnimationFrame(() => document.getElementById("capsules")?.scrollIntoView({ behavior: "instant" }));
  };
  const addTask = (status = "todo") =>
    setEditing({
      title: "",
      description: "",
      type: "feature",
      status,
      assignee: TEAM[0],
      dueDate: null,
      context: "",
      contextTool: null,
    });
  const updateTask = async (task, updates) => {
    if (Object.entries(updates).every(([key, value]) => task[key] === value))
      return;
    const result = await updateProject((p) => {
      const current = p.tasks.find((item) => item.id === task.id);
      if (!current || JSON.stringify(current) !== JSON.stringify(task))
        throw new Error(
          "This task changed elsewhere. Review its latest version before retrying.",
        );
      p.tasks = p.tasks.map((item) =>
        item.id === task.id ? { ...item, ...updates } : item,
      );
      return addActivity(
        p,
        describeChange(task, { ...task, ...updates }),
        task.title,
        task.id,
      );
    }, "Change task stage or owner");
    if (!result.ok) {
      notify(result.error);
      return;
    }
    notify(
      updates.assignee
        ? `Handed off to ${updates.assignee}.`
        : `Moved to ${STAGES.find((stage) => stage.id === updates.status).label}.`,
    );
  };
  const copy = async (text) => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      notify("Copied. Pick up where you left off.");
    } catch {
      setClipboardFallback(text);
    }
  };
  const downloadBackup = async (preferences) => {
    const blob = new Blob(
      [
        JSON.stringify(
          workspaceBackup(
            workspace.state.data,
            validAccess(preferences) ? preferences : undefined,
          ),
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relay-backup-${localDate()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    await workspace.mutate(
      (data) => ({ ...data, lastBackupAt: new Date().toISOString() }),
      "Record backup download",
      false,
    );
  };
  const filtered = tasks.filter(
    (task) =>
      (owner === "all" || task.assignee === owner) &&
      (kind === "all" || task.type === kind) &&
      (contextFilter === "all" ||
        (task.status !== "done" &&
          (contextFilter === "ready"
            ? contextChecklist(task).every((item) => item.done)
            : !contextChecklist(task).every((item) => item.done)))) &&
      `${task.title} ${task.description} ${task.context || ""}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter(
    (task) => deadline(task, now).tone === "overdue",
  ).length;
  const linked = anchors.filter((anchor) => anchor.url).length;
  const briefing = resumePrompt(tasks, anchors, now);
  useEffect(() => {
    const handleKey = (event) => {
      if (
        editing ||
        editingAnchor ||
        panel ||
        clipboardFallback ||
        document.querySelector("dialog[open]") ||
        event.isComposing
      )
        return;
      const typing = event.target.closest?.(
        "input, textarea, select, [contenteditable='true']",
      );
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPanel("commands");
        return;
      }
      if (
        typing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        !prefs.shortcuts
      )
        return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        addTask();
      }
      if (event.key === "/") {
        event.preventDefault();
        setView("board");
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        showFocus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editing, editingAnchor, panel, clipboardFallback, prefs.shortcuts]);
  return (
    <div className="min-h-screen bg-surface-page text-text-primary selection:bg-brand-accent">
      <a href="#workspace" className="skip-link">
        Skip to workspace
      </a>
      <aside className="workspace-sidebar fixed inset-y-0 left-0 z-10 hidden w-52 flex-col overflow-y-auto border-r border-line bg-surface-subtle p-6 xl:flex">
        <a
          href="#board"
          onClick={showBoard}
          aria-label="Relay task board"
          className="flex items-center gap-2.5 text-brand-primary"
        >
          <Workflow size={25} strokeWidth={1.6} />
          <span className="font-editorial text-4xl tracking-tight">
            relay<span className="text-type-feature">.</span>
          </span>
        </a>
        <p className="mt-8 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-text-muted">
          Your workspace
        </p>
        <nav aria-label="Workspace" className="mt-3 space-y-1 text-sm">
          <button type="button" onClick={showCapsules} aria-pressed={view === "capsules"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium text-brand-primary ${view === "capsules" ? "bg-brand-accent" : "hover:bg-surface-card/60"}`}>
            <BookOpen size={16} /> Resume Capsules
          </button>
          <button
            type="button"
            onClick={showBoard}
            aria-pressed={view === "board"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium text-brand-primary ${view === "board" ? "bg-brand-accent" : "hover:bg-surface-card/60"}`}
          >
            <LayoutGrid size={16} />
            Task board<span className="ml-auto text-xs">{tasks.length}</span>
          </button>
          <button
            type="button"
            onClick={showFocus}
            aria-pressed={view === "focus"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium text-brand-primary ${view === "focus" ? "bg-brand-accent" : "hover:bg-surface-card/60"}`}
          >
            <Target size={16} />
            Focus desk
            {prefs.shortcuts && (
              <span className="ml-auto rounded border border-line px-1.5 text-[0.75rem]">
                F
              </span>
            )}
          </button>
          <a
            href="#deliverables"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-text-muted hover:bg-surface-card/60"
          >
            <FolderOpen size={16} />
            Deliverables
          </a>
          <button
            type="button"
            onClick={() => setPanel("resume")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-text-muted hover:bg-surface-card/60"
          >
            <Sparkles size={16} />
            Resume work
          </button>
          <button
            type="button"
            onClick={() => setPanel("activity")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-text-muted hover:bg-surface-card/60"
          >
            <History size={16} />
            Activity
          </button>
          <button
            type="button"
            onClick={() => setPanel("commands")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-text-muted hover:bg-surface-card/60"
          >
            <Command size={16} />
            Quick actions
          </button>
        </nav>
        <div className="mt-auto">
          <div className="mb-6 rounded-xl border border-line bg-surface-tint p-3.5">
            <Workflow size={20} className="text-brand-primary" />
            <p className="mt-3 font-editorial text-lg leading-snug">
              Good work has
              <br />a good handoff.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Leave a little context.
              <br />
              Your future self will thank you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanel("settings")}
            className="flex w-full items-center gap-2.5 rounded-lg text-left focus-visible:outline-brand-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action text-xs text-action-ink">
              JH
            </span>
            <span className="flex-1 text-xs font-semibold">
              James's studio
              <span className="block font-normal text-text-muted">
                Solo workspace
              </span>
            </span>
            <Settings2 size={15} className="text-text-muted" />
          </button>
        </div>
      </aside>
      <div className="workspace-shell xl:ml-52">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-9">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Workflow size={18} className="text-brand-primary xl:hidden" />
            <span>James's studio</span>
            <span className="text-text-muted">/</span>
            <span className="font-medium text-text-primary">
              Vibecoding project
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AccessButton onClick={() => setPanel("accessibility")} />
            <button
              type="button"
              className={`${buttonClass} !text-xs !py-2`}
              onClick={() => setPanel("recovery")}
            >
              <History size={16} /> Recovery
            </button>
            {undo && (
              <button
                type="button"
                onClick={undoChange}
                className="flex items-center gap-1.5 rounded text-xs text-brand-primary"
              >
                <RotateCcw size={13} />
                Undo
              </button>
            )}
            {workspace.state.redo.length > 0 && (
              <button
                type="button"
                onClick={redoChange}
                className="flex items-center gap-1.5 rounded text-xs text-brand-primary"
              >
                <RotateCw size={14} /> Redo
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanel("commands")}
              aria-label="Open quick actions"
              className="flex items-center gap-2 rounded-lg border border-line bg-surface-card px-2.5 py-1.5 text-text-muted"
            >
              <Search size={14} />
              <span className="hidden text-xs sm:inline">Quick actions</span>
              <kbd className="hidden rounded border border-line px-1 text-[0.75rem] sm:inline">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPanel("settings")}
              className="inline-flex items-center gap-2 rounded-md text-xs text-text-muted focus-visible:outline-brand-primary"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${taskError || anchorError || activityError ? "bg-type-bug" : "bg-type-feature"}`}
              />
              {taskError || anchorError || activityError
                ? "Storage needs attention"
                : "Saved in this browser"}
              <Settings2 size={14} />
            </button>
          </div>
        </header>
        <ReadingDock
          hidden={!!(panel || editing || editingAnchor || clipboardFallback)}
        />
        <main
          id="workspace"
          data-workspace-focus
          tabIndex={-1}
          className="mx-auto max-w-[1700px] px-5 pb-10 pt-8 sm:px-9"
        >
          {workspace.state.data.welcome && !workspace.readOnly && (
            <WelcomePanel
              onChoose={async (demo) => {
                const result = await workspace.mutate(
                  (data) => ({
                    ...data,
                    welcome: false,
                    projects: [newProject(demo ? seedTasks() : [])],
                    activeProject: "studio",
                  }),
                  demo ? "Choose sample workspace" : "Choose empty workspace",
                );
                if (!result.ok) notify(result.error);
              }}
            />
          )}
          {workspace.notice && (
            <div
              role="status"
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-tint p-4 text-sm"
            >
              <p>{workspace.notice}</p>
              <button
                type="button"
                className="underline"
                onClick={() => workspace.store.clearMessage()}
              >
                Dismiss update
              </button>
            </div>
          )}
          <div className="studio-hero" data-chapter={view}>
            <div className="studio-hero-copy">
              <p className="mb-3 flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.22em] text-type-feature">
                <span className="h-1.5 w-1.5 rounded-full bg-type-feature" />{" "}
                Notes → decisions → your next session
              </p>
              <h1 className="studio-hero-title font-editorial tracking-tight">
                {view === "capsules" ? "Pick up exactly where you left off." : view === "focus"
                  ? "Less noise. Your next move."
                  : "Good work deserves a clear next step."}
              </h1>
              <p className="studio-hero-description text-text-muted">
                {view === "capsules" ? "Turn team notes into a clear, portable handoff. Keep the decisions, record the evidence and know where to take off next." : view === "focus"
                  ? "Pick up the thinking, not just the task."
                  : "Plan it. Build it. Leave the context for what comes next."}
              </p>
              <button
                type="button"
                className={`${primaryClass} studio-resume`}
                onClick={() => { setView("capsules"); setCapsuleRequest(value => value + 1); }}
              >
                <Sparkles size={16} />
                Create a Resume Capsule
                <ArrowUpRight size={16} />
              </button>
              <p className="studio-hero-footnote">
                <span aria-hidden="true" /> Your ideas. Your decisions. Ready
                for the next chapter.
              </p>
            </div>
            <Journal
              focused={view === "focus"}
              onOpen={showFocus}
              onBoard={showBoard}
            />
          </div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex max-w-full flex-wrap rounded-xl border border-line bg-surface-subtle p-1">
              <button type="button" aria-pressed={view === "capsules"} onClick={showCapsules}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium ${view === "capsules" ? "bg-surface-card text-brand-primary shadow-sm" : "text-text-muted"}`}>
                <BookOpen size={14} /> Capsules
              </button>
              <button
                type="button"
                aria-pressed={view === "board"}
                onClick={showBoard}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium ${view === "board" ? "bg-surface-card text-brand-primary shadow-sm" : "text-text-muted"}`}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                type="button"
                aria-pressed={view === "focus"}
                onClick={showFocus}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium ${view === "focus" ? "bg-surface-card text-brand-primary shadow-sm" : "text-text-muted"}`}
              >
                <Target size={14} /> Focus desk
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPanel("activity")}
              aria-label="Activity"
              className="flex items-center gap-1.5 text-xs text-text-muted"
            >
              <History size={14} />
              <span className="hidden sm:inline">Activity</span>
            </button>
          </div>
          {view === "capsules" && <CapsuleHome workspace={workspace} startRequest={capsuleRequest} onCopy={copy} onNotify={notify} onTask={setEditing} onBoard={showBoard} onFocus={showFocus} />}
          <WorkspacePulse
            tasks={tasks}
            anchors={anchors}
            now={now}
            onFocus={showFocus}
            onBoard={showBoard}
            onContext={() => {
              setView("board");
              setContextFilter("missing");
              requestAnimationFrame(() =>
                document
                  .getElementById("board")
                  ?.scrollIntoView({ behavior: "instant" }),
              );
            }}
          />
          {(taskError || anchorError || activityError) && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-line bg-due-overdue p-4 text-sm text-type-bug"
            >
              <p>{taskError || anchorError || activityError}</p>
              <button
                type="button"
                onClick={downloadBackup}
                className="mt-2 underline"
              >
                Download the current workspace backup
              </button>
              <p className="mt-2 text-xs">
                Open Recovery to download protected raw data or choose an
                explicit recovery action.
              </p>
              <button
                type="button"
                className="mt-2 underline"
                onClick={() => setPanel("recovery")}
              >
                Open recovery tools
              </button>
            </div>
          )}
          {view === "focus" && (
            <FocusDesk
              tasks={tasks}
              now={now}
              onEdit={setEditing}
              onUpdate={updateTask}
              onCopy={copy}
              onAdd={() => addTask()}
              onBoard={showBoard}
            />
          )}
          <section
            id="deliverables"
            aria-labelledby="deliverables-title"
            className="scroll-mt-5 rounded-2xl border border-line bg-surface-subtle p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="deliverables-title"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Flag size={15} className="text-brand-primary" />
                The finish line
              </h2>
              <span className="font-mono text-[0.75rem] uppercase tracking-wider text-text-muted">
                {linked}/4 deliverables linked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {anchors.map((anchor) => {
                const Icon = anchorIcons[anchor.id];
                return (
                  <div
                    key={anchor.id}
                    className="deliverable-card min-w-0 rounded-xl border border-line bg-surface-card/75 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        size={19}
                        strokeWidth={1.6}
                        className="text-brand-primary"
                      />
                      {anchor.url ? (
                        <a
                          href={safeUrl(anchor.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${anchor.label} (opens a new tab)`}
                          className="rounded p-1 text-brand-primary hover:bg-due-safe"
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <span className="text-[0.75rem] text-text-muted">
                          Not linked
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">
                      {anchor.label}
                    </h3>
                    <p className="mt-1 truncate text-[0.75rem] text-text-muted">
                      {anchorHints[anchor.id]}
                    </p>
                    <button
                      type="button"
                      aria-label={`Edit ${anchor.label} link`}
                      onClick={() => setEditingAnchor(anchor)}
                      className="mt-3 flex max-w-full items-center gap-1.5 rounded text-xs font-medium text-brand-primary hover:underline focus-visible:outline-brand-primary"
                    >
                      <Link2 size={12} className="shrink-0" />
                      <span className="truncate">
                        {anchor.url
                          ? new URL(anchor.url).hostname
                          : "Add a link"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
          {view !== "focus" && (
            <section
              id="board"
              aria-labelledby="board-title"
              className="mt-8 scroll-mt-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 id="board-title" className="font-editorial text-2xl">
                    The work in motion
                  </h2>
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs text-text-muted">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-line bg-surface-card p-1">
                    <button
                      type="button"
                      aria-label="Board layout"
                      disabled={prefs.textSize >= 150}
                      aria-pressed={layout === "board"}
                      onClick={() => setLayout("board")}
                      className={`rounded p-1.5 ${layout === "board" ? "bg-brand-accent text-brand-primary" : "text-text-muted"}`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="List layout"
                      aria-pressed={layout === "list"}
                      onClick={() => setLayout("list")}
                      className={`rounded p-1.5 ${layout === "list" ? "bg-brand-accent text-brand-primary" : "text-text-muted"}`}
                    >
                      <List size={15} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => addTask()}
                    className={`${primaryClass} !py-2`}
                  >
                    <Plus size={16} />
                    New task
                  </button>
                </div>
              </div>
              {prefs.textSize >= 150 && (
                <p className="mt-3 text-sm text-text-muted">
                  List layout keeps enlarged text readable without horizontal
                  board scrolling. Reduce text size below 150% to use the board.
                </p>
              )}
              <div className="my-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                  <label className="relative min-w-0 max-w-full">
                    <span className="sr-only">Search tasks</span>
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-2.5 text-text-muted"
                    />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Find a task or context…"
                      className={`${fieldClass} !w-56 !py-2 !pl-9 !text-xs`}
                    />
                  </label>
                  <select
                    aria-label="Filter by owner"
                    value={owner}
                    onChange={(event) => setOwner(event.target.value)}
                    className={`${fieldClass} !w-auto !py-2 !text-xs`}
                  >
                    <option value="all">All owners</option>
                    {TEAM.map((member) => (
                      <option key={member}>{member}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter by type"
                    value={kind}
                    onChange={(event) => setKind(event.target.value)}
                    className={`${fieldClass} !w-auto !py-2 !text-xs`}
                  >
                    <option value="all">All types</option>
                    <option value="feature">Features</option>
                    <option value="bug">Bugs</option>
                  </select>
                  <select
                    aria-label="Filter by handoff readiness"
                    value={contextFilter}
                    onChange={(event) => setContextFilter(event.target.value)}
                    className={`${fieldClass} !w-auto !py-2 !text-xs`}
                  >
                    <option value="all">All context</option>
                    <option value="missing">Open: needs essentials</option>
                    <option value="ready">Open: essentials present</option>
                  </select>
                  {(search ||
                    owner !== "all" ||
                    kind !== "all" ||
                    contextFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setOwner("all");
                        setKind("all");
                        setContextFilter("all");
                        searchRef.current?.focus();
                      }}
                      className="rounded px-2 py-1 text-xs text-brand-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  {overdue > 0 && (
                    <span className="flex items-center gap-1 text-type-bug">
                      <Clock3 size={13} />
                      {overdue} overdue
                    </span>
                  )}
                  <span>
                    {doneCount} of {tasks.length} done
                  </span>
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full bg-brand-primary"
                      style={{
                        width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </span>
                </div>
              </div>
              {layout === "list" ? (
                <TaskList
                  tasks={filtered}
                  hasTasks={tasks.length > 0}
                  now={now}
                  onEdit={setEditing}
                  onUpdate={updateTask}
                  onCopy={copy}
                />
              ) : (
                <div
                  className="overflow-x-auto pb-4"
                  role="region"
                  aria-label="Kanban board, scroll horizontally on smaller screens"
                  tabIndex={0}
                >
                  <div className="grid min-w-[980px] grid-cols-4 gap-4">
                    {STAGES.map((stage, index) => {
                      const columnTasks = filtered.filter(
                        (task) => task.status === stage.id,
                      );
                      return (
                        <section
                          key={stage.id}
                          onDragOver={(event) => {
                            if (!dragging) return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                            setDragOver(stage.id);
                          }}
                          onDragLeave={(event) => {
                            if (
                              !event.currentTarget.contains(event.relatedTarget)
                            )
                              setDragOver(null);
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const task = tasks.find(
                              (item) =>
                                item.id === dragging &&
                                item.id ===
                                  event.dataTransfer.getData("text/plain"),
                            );
                            if (task) updateTask(task, { status: stage.id });
                            setDragging(null);
                            setDragOver(null);
                          }}
                          aria-labelledby={`stage-${stage.id}`}
                          className={`min-h-[370px] rounded-xl border p-2.5 transition-colors motion-reduce:transition-none ${dragOver === stage.id ? "border-brand-primary bg-brand-accent/60" : "border-transparent bg-surface-subtle/70"}`}
                        >
                          <div className="mb-3 flex items-center gap-2 px-1.5 py-2">
                            <span
                              className={`h-2 w-2 rounded-full ${stageColours[index]}`}
                            />
                            <h3
                              id={`stage-${stage.id}`}
                              className="text-xs font-semibold"
                            >
                              {stage.label}
                            </h3>
                            <span className="text-[0.75rem] text-text-muted">
                              {columnTasks.length}
                            </span>
                            <button
                              type="button"
                              aria-label={`Add task to ${stage.label}`}
                              className="ml-auto rounded p-1 text-text-muted hover:bg-surface-card focus-visible:outline-brand-primary"
                              onClick={() => addTask(stage.id)}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                          <div className="space-y-3">
                            {columnTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                now={now}
                                onEdit={setEditing}
                                onUpdate={updateTask}
                                onCopy={copy}
                                onDragStart={setDragging}
                                onDragEnd={() => {
                                  setDragging(null);
                                  setDragOver(null);
                                }}
                              />
                            ))}
                            {!columnTasks.length && (
                              <div className="rounded-xl border border-dashed border-line px-4 py-9 text-center">
                                <Circle
                                  size={20}
                                  strokeWidth={1}
                                  className="mx-auto text-text-muted"
                                />
                                <p className="mt-3 text-xs text-text-muted">
                                  {search ||
                                  owner !== "all" ||
                                  kind !== "all" ||
                                  contextFilter !== "all"
                                    ? "No tasks match these filters."
                                    : "Room for your next move."}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => addTask(stage.id)}
                                  className="mt-3 text-xs font-medium text-brand-primary hover:underline"
                                >
                                  Add a task
                                </button>
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[0.75rem] text-text-muted">
                <p className="flex items-center gap-1.5">
                  <Clipboard size={13} />
                  {layout === "board"
                    ? "Drag the grip to move a card, or use its stage menu."
                    : "Earliest deadlines first. Completed work follows."}
                </p>
                <p>Solo studio · Demo teammates are sample identities</p>
              </div>
            </section>
          )}
        </main>
        <footer className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-5 text-xs text-text-muted sm:px-9">
          <button
            type="button"
            className="underline"
            onClick={() => setPanel("accessibility")}
          >
            Accessibility & reading preferences
          </button>
          <a
            href="/design.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Why this design?<span className="sr-only"> (opens a new tab)</span>
          </a>
          <span>
            Every state has a text label. Every task can be moved without
            dragging.
          </span>
        </footer>
      </div>
      {panel === "recovery" && (
        <RecoveryPanel
          workspace={workspace}
          onClose={() => setPanel(null)}
          onBackup={downloadBackup}
          onNotify={notify}
        />
      )}
      {panel === "cloud" && (
        <ErrorBoundary onClose={() => setPanel(null)}>
          <Suspense
            fallback={
              <Modal
                title="Opening cloud controls…"
                onClose={() => setPanel(null)}
              >
                <p role="status" className="p-6 text-sm">
                  Loading account and sharing tools.
                </p>
              </Modal>
            }
          >
            <CloudPanel workspace={workspace} onClose={() => setPanel(null)} />
          </Suspense>
        </ErrorBoundary>
      )}
      {panel === "accessibility" && (
        <AccessibilityPanel
          tasks={tasks}
          briefing={briefing}
          onClose={() => setPanel(null)}
        />
      )}
      {editing && (
        <TaskEditor
          key={editing.id || "new"}
          task={editing}
          projectId={project.id}
          activity={activity}
          templates={workspace.state.data.templates}
          onSaveTemplate={(template) =>
            workspace.mutate((data) => {
              data.templates.push(template);
              return data;
            }, "Save reusable template")
          }
          onDeleteTemplate={(id) =>
            workspace.mutate((data) => {
              data.templates = data.templates.filter(
                (template) => template.id !== id,
              );
              return data;
            }, "Remove reusable template")
          }
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            const saved = saveTask(draft, editing.id ? editing : null);
            const result = await updateProject(
              (p) => {
                if (
                  editing.id &&
                  JSON.stringify(p.tasks.find((t) => t.id === editing.id)) !==
                    JSON.stringify(editing)
                )
                  throw new Error(
                    "This task changed in another tab. Your draft is kept. Copy its text, close the editor, and reopen the latest task before merging your changes.",
                  );
                p.tasks = editing.id
                  ? p.tasks.map((task) => (task.id === saved.id ? saved : task))
                  : [...p.tasks, saved];
                return addActivity(
                  p,
                  describeChange(editing.id ? editing : null, saved),
                  saved.title,
                  saved.id,
                  editing.id &&
                    (editing.context !== saved.context ||
                      editing.contextTool !== saved.contextTool)
                    ? editing
                    : null,
                );
              },
              editing.id ? "Save task changes" : "Create task",
            );
            if (!result.ok) return result.error;
            setEditing(null);
            notify(
              editing.id
                ? "Task updated. Keep moving."
                : "One clear next step. Task created.",
            );
          }}
          onDelete={async (id) => {
            const result = await updateProject((p) => {
              const task = p.tasks.find((t) => t.id === id);
              if (!task)
                throw new Error("This task is no longer on the board.");
              if (JSON.stringify(task) !== JSON.stringify(editing))
                throw new Error(
                  "This task changed in another tab. Review its latest version before deleting it. Your draft is kept.",
                );
              p.tasks = p.tasks.filter((t) => t.id !== id);
              p.trash = [
                { task, deletedAt: new Date().toISOString() },
                ...p.trash.filter((entry) => entry.task.id !== id),
              ].slice(0, 50);
              return addActivity(p, "Deleted task", task.title, id);
            }, "Move task to recovery");
            if (!result.ok) return result.error;
            setEditing(null);
            notify("Task moved to Recovery. Restore it there or use Undo.");
          }}
          onCopy={copy}
        />
      )}
      {editingAnchor && (
        <AnchorEditor
          anchor={editingAnchor}
          onClose={() => setEditingAnchor(null)}
          onSave={async (url) => {
            const result = await updateProject((p) => {
              if (
                JSON.stringify(
                  p.anchors.find((a) => a.id === editingAnchor.id),
                ) !== JSON.stringify(editingAnchor)
              )
                throw new Error(
                  "This link changed in another tab. Reopen it to review the saved value.",
                );
              p.anchors = p.anchors.map((anchor) =>
                anchor.id === editingAnchor.id ? { ...anchor, url } : anchor,
              );
              return addActivity(
                p,
                url ? "Linked deliverable" : "Removed deliverable link",
                editingAnchor.label,
              );
            }, "Update deliverable");
            if (!result.ok) return result.error;
            setEditingAnchor(null);
            notify(url ? "Deliverable linked." : "Link removed.");
          }}
        />
      )}
      {panel === "commands" && (
        <CommandMenu
          tasks={tasks}
          onClose={() => setPanel(null)}
          onEdit={setEditing}
          actions={[
            { label: "Open Resume Capsules", run: showCapsules },
            { label: "Create a Resume Capsule", run: () => { setView("capsules"); setCapsuleRequest(value => value + 1); } },
            { label: "Create a task", key: "N", run: () => addTask() },
            { label: "Open focus desk", key: "F", run: showFocus },
            { label: "Open task board", run: showBoard },
            { label: "Copy workspace briefing", run: () => setPanel("resume") },
            { label: "View activity history", run: () => setPanel("activity") },
            {
              label: "Recovery, deleted tasks and saved snapshots",
              run: () => setPanel("recovery"),
            },
            {
              label: "Accessibility and reading preferences",
              run: () => setPanel("accessibility"),
            },
            {
              label: "Backup and workspace settings",
              run: () => setPanel("settings"),
            },
            ...(undo ? [{ label: "Undo last change", run: undoChange }] : []),
            ...(workspace.state.redo.length
              ? [{ label: "Redo last change", run: redoChange }]
              : []),
          ]}
        />
      )}
      {panel === "activity" && (
        <ActivityPanel
          activity={activity}
          tasks={tasks}
          onClose={() => setPanel(null)}
          onEdit={setEditing}
        />
      )}
      {panel === "resume" && (
        <Modal
          title="Pick up where you left off."
          subtitle="One briefing. Every unfinished task. Ready for your next AI session."
          onClose={() => setPanel(null)}
          wide
        >
          <div className="p-6">
            <p className="mb-4 text-sm text-text-muted">
              Earliest deadlines come first. Completed tasks stay out of the
              briefing. Review the context before sharing it.
            </p>
            <label className="block text-sm font-medium">
              Resume briefing
              <textarea
                data-autofocus
                readOnly
                value={briefing}
                className={`${fieldClass} mt-2 h-72 font-mono text-xs leading-relaxed`}
              />
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <ReadButton text={briefing} title="Workspace briefing" />
              <button
                type="button"
                className={primaryClass}
                onClick={() => copy(briefing)}
              >
                <Clipboard size={16} />
                Copy resume briefing
              </button>
            </div>
          </div>
        </Modal>
      )}
      {panel === "settings" && (
        <Modal
          title="Your studio, your browser."
          subtitle="A small workspace that stays close to the work."
          onClose={() => setPanel(null)}
        >
          <div className="space-y-5 p-6">
            <p className="text-sm leading-relaxed text-text-muted">
              Relay saves tasks and deliverable links in this browser. Data does
              not leave this browser until you open cloud controls and choose to
              upload. Clearing browser data removes local work. James is the
              solo owner; Demo Designer and Demo Reviewer are sample identities
              for trying handoffs.
            </p>
            <button
              type="button"
              className={primaryClass}
              onClick={() => setPanel("cloud")}
            >
              Accounts, cloud sync & collaboration
            </button>
            <p className="text-xs text-text-muted">
              Cloud preview: email delivery and real-account cross-device checks
              are still pending. Local tasks and backups need no account.
            </p>
            <button
              type="button"
              className={buttonClass}
              onClick={downloadBackup}
            >
              <ArrowDownToLine size={16} />
              Download workspace backup
            </button>
            <p className="text-[0.75rem] text-text-muted">
              Includes all projects, templates, metadata and recovery entries.
              Keep it somewhere safe; it contains your saved context.
            </p>
            <WorkspaceTransfer
              workspace={workspace}
              onBackup={downloadBackup}
              onNotify={notify}
            />
            <div className="rounded-xl bg-surface-tint p-4">
              <h3 className="mb-2 text-sm font-semibold">A few shortcuts</h3>
              <p className="text-xs leading-6 text-text-muted">
                <kbd>Ctrl / ⌘ K</kbd> Quick actions · <kbd>N</kbd> New task
                <br />
                <kbd>F</kbd> Focus desk · <kbd>/</kbd> Search tasks ·{" "}
                <kbd>Esc</kbd> Close dialog
              </p>
              <button
                type="button"
                className="mt-3 text-sm underline"
                onClick={() => setPanel("accessibility")}
              >
                Accessibility, themes & shortcut preferences
              </button>
            </div>
            <div className="border-t border-line pt-5">
              <h3 className="text-sm font-semibold">A fresh demo</h3>
              <p className="my-2 text-xs leading-relaxed text-text-muted">
                Restore four sample tasks with dates relative to today. This
                replaces your current tasks and resets deliverable links.
              </p>
              <button
                type="button"
                className={`${buttonClass} !text-type-bug`}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Replace all current tasks and deliverable links with demo data? Download a backup first if you need to keep them.",
                    )
                  )
                    return;
                  const replacement = newProject(seedTasks());
                  const result = workspace.readOnly
                    ? await workspace.recover(newData(replacement, false))
                    : await updateProject(
                        (p) => ({ ...replacement, id: p.id, name: p.name }),
                        "Before sample workspace reset",
                      );
                  if (!result.ok) {
                    notify(result.error);
                    return;
                  }
                  setSearch("");
                  setOwner("all");
                  setKind("all");
                  setContextFilter("all");
                  setPanel(null);
                  notify("Demo workspace restored.");
                }}
              >
                <RotateCcw size={16} />
                Restore demo workspace
              </button>
            </div>
          </div>
        </Modal>
      )}
      {clipboardFallback && (
        <Modal
          title="Copy your briefing manually"
          subtitle="The browser could not access the clipboard. Select the text below and copy it."
          onClose={() => setClipboardFallback(null)}
          wide
        >
          <div className="p-6">
            <textarea
              data-autofocus
              aria-label="Manual copy text"
              readOnly
              onFocus={(event) => event.target.select()}
              value={clipboardFallback}
              className={`${fieldClass} h-72 font-mono text-xs`}
            />
            <button
              type="button"
              className={`${buttonClass} mt-4`}
              onClick={() => setClipboardFallback(null)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-xl bg-action px-5 py-3.5 text-sm text-action-ink shadow-lg"
        >
          <Check size={17} className="shrink-0" />
          {toast.message}
          {undo && (
            <button
              type="button"
              onClick={undoChange}
              className="rounded border border-white/40 px-2 py-1 text-xs hover:bg-surface-card/10"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="ml-2 rounded p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
