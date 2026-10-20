import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Circle,
  Clipboard,
  Clock3,
  Command,
  Download,
  History,
  Plus,
  Search,
  Sparkles,
  Target,
  Upload,
  X,
} from "lucide-react";
import { STAGES, deadline, taskPrompt } from "./model";
import {
  CONTEXT_TEMPLATES,
  contextChecklist,
  focusQueue,
  focusReason,
  parseBackup,
} from "./competition";
import { Modal, buttonClass, fieldClass, primaryClass } from "./ui";

export function ContextCoach({ task, onTemplate, compact = false }) {
  const checks = contextChecklist(task);
  const complete = checks.filter((item) => item.done).length;
  return (
    <div
      className={
        compact ? "" : "rounded-xl border border-[#CED8C7] bg-white/60 p-4"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Handoff checklist</h3>
        <span className="rounded-full bg-brand-accent px-2 py-1 font-mono text-[10px] text-brand-primary">
          {complete}/4 present
        </span>
      </div>
      <div className={`mt-3 grid gap-2 ${compact ? "sm:grid-cols-2" : ""}`}>
        {checks.map((item) => (
          <div
            key={item.id}
            title={item.done ? item.label : item.hint}
            className={`flex items-center gap-2 text-xs ${item.done ? "text-brand-primary" : "text-text-muted"}`}
          >
            {item.done ? (
              <Check size={14} className="shrink-0" />
            ) : (
              <Circle size={13} className="shrink-0 text-stone-400" />
            )}
            <span className="sr-only">
              {item.done ? "Present: " : "Missing: "}
            </span>
            {item.label}
          </div>
        ))}
      </div>
      {!compact && (
        <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
          {checks.find((item) => !item.done)?.hint ||
            "The essentials are present. Read them once more before sharing."}
        </p>
      )}
      <p className="mt-3 text-[10px] text-text-muted">
        Presence checks only. You judge the quality.
      </p>
      {onTemplate && (
        <div className="mt-4 border-t border-stone-200 pt-3">
          <p className="mb-2 text-xs font-medium">
            Start with a briefing structure
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONTEXT_TEMPLATES).map(([id, template]) => (
              <button
                key={id}
                type="button"
                className="rounded-full border border-[#CCD8C3] bg-white px-3 py-1.5 text-[11px] text-brand-primary hover:bg-brand-accent focus-visible:outline-brand-primary"
                onClick={() => onTemplate(template.text)}
              >
                + {template.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            Adds a template after your existing context. Replace the prompts in
            brackets.
          </p>
        </div>
      )}
    </div>
  );
}

export function WorkspacePulse({
  tasks,
  anchors,
  now,
  onFocus,
  onBoard,
  onContext,
}) {
  const open = tasks.filter((task) => task.status !== "done");
  const overdue = open.filter(
    (task) => deadline(task, now).tone === "overdue",
  ).length;
  const ready = open.filter((task) =>
    contextChecklist(task).every((item) => item.done),
  ).length;
  const done = tasks.length - open.length;
  const stats = [
    {
      label: "Work completed",
      value: `${done}/${tasks.length}`,
      detail: "Every closed loop counts",
      action: onBoard,
      icon: CheckCheck,
    },
    {
      label: "Needs attention",
      value: String(overdue),
      detail: overdue
        ? "Past deadline · open focus desk"
        : "No overdue work. Keep going.",
      action: onFocus,
      icon: Clock3,
    },
    {
      label: "Handoff essentials",
      value: `${ready}/${open.length}`,
      detail: "Open tasks with all four checks",
      action: onContext,
      icon: Sparkles,
    },
    {
      label: "Deliverables linked",
      value: `${anchors.filter((anchor) => anchor.url).length}/4`,
      detail: "Your finish line, in one place",
      href: "#deliverables",
      icon: ArrowUpRight,
    },
  ];
  return (
    <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, detail, action, href, icon: Icon }) => {
        const Tag = href ? "a" : "button";
        return (
          <Tag
            key={label}
            href={href}
            type={href ? undefined : "button"}
            onClick={action}
            className="group rounded-2xl border border-stone-200 bg-white/70 p-4 text-left transition hover:border-[#99AF91] hover:bg-white focus-visible:outline-brand-primary motion-reduce:transition-none"
          >
            <span className="flex items-center justify-between text-[11px] font-medium text-text-muted">
              {label}
              <Icon size={15} className="text-type-feature" />
            </span>
            <span className="mt-3 block font-editorial text-3xl tracking-tight text-brand-primary">
              {value}
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-text-muted">
              {detail}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}

export function FocusDesk({
  tasks,
  now,
  onEdit,
  onUpdate,
  onCopy,
  onAdd,
  onBoard,
}) {
  const queue = focusQueue(tasks, now);
  const [selectedId, setSelectedId] = useState(null);
  const task = queue.find((item) => item.id === selectedId) || queue[0];
  return (
    <section
      aria-labelledby="focus-title"
      className="mb-8 scroll-mt-6"
      id="focus"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="focus-title" className="font-editorial text-2xl">
            Your focus desk
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            One open loop. A clear next move.
          </p>
        </div>
        <button
          type="button"
          className={`${buttonClass} !py-2 !text-xs`}
          onClick={onBoard}
        >
          Back to board <ArrowRight size={14} />
        </button>
      </div>
      {!task ? (
        <div className="rounded-2xl border border-[#CCD8C3] bg-[#EAF0E2] p-10 text-center">
          <CheckCheck size={32} className="mx-auto text-brand-primary" />
          <h3 className="mt-4 font-editorial text-3xl">
            A clean slate. Nicely done.
          </h3>
          <p className="my-4 text-sm text-text-muted">
            No unfinished tasks. Review your deliverables, or make your next
            move.
          </p>
          <button className={primaryClass} onClick={onAdd}>
            <Plus size={16} /> Create a task
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(240px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#CCD8C3] bg-white">
            <div className="relative overflow-hidden bg-[#203E31] p-6 text-[#F4F4E8] sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[38px] border-white/[0.035]"
              />
              <div className="relative">
                <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-medium uppercase tracking-[.16em] text-[#CBDEB4]">
                  <Target size={15} />
                  {task.id === queue[0].id
                    ? "Suggested next move"
                    : "Your selected focus"}
                  <span className="ml-auto rounded-full border border-white/20 px-2.5 py-1 tracking-normal text-[#E1E9D7]">
                    {deadline(task, now).label}
                  </span>
                </div>
                <h3 className="max-w-xl font-editorial text-3xl leading-tight sm:text-4xl">
                  {task.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#D5DFD2]">
                  {task.description || "Add a brief to make the outcome clear."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    className={`${buttonClass} !border-[#DCE8C7] !bg-[#DCE8C7] !text-[#203E31] hover:!bg-white`}
                    onClick={() => onCopy(taskPrompt(task))}
                  >
                    <Clipboard size={15} /> Copy task briefing
                  </button>
                  <button
                    className={`${buttonClass} !border-white/25 !bg-transparent !text-white hover:!bg-white/10`}
                    onClick={() => onEdit(task)}
                  >
                    Refine context <ArrowUpRight size={15} />
                  </button>
                </div>
                <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-[#BCD0B3]">
                  <Sparkles size={13} className="mt-0.5 shrink-0" />
                  {task.id === queue[0].id
                    ? focusReason(task, now)
                    : "You selected this task. Your focus stays here until it is complete or you choose another."}
                </p>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted">
                  Owner / stage
                </p>
                <p className="mt-1 text-sm font-medium">
                  {task.assignee} <span className="px-1 text-stone-300">/</span>{" "}
                  {STAGES.find((stage) => stage.id === task.status).label}
                </p>
              </div>
              <button
                className={`${buttonClass} !text-xs`}
                onClick={() =>
                  onUpdate(task, {
                    status:
                      task.status === "todo"
                        ? "in-progress"
                        : task.status === "in-progress"
                          ? "review"
                          : "done",
                  })
                }
              >
                {task.status === "todo"
                  ? "Start this task"
                  : task.status === "in-progress"
                    ? "Send to review"
                    : "Mark complete"}{" "}
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="border-t border-stone-100 p-5">
              <ContextCoach task={task} compact />
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#EEEFE6] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Up next</h3>
              <span className="text-xs text-text-muted">
                {queue.length} open
              </span>
            </div>
            <p className="mb-4 mt-1 text-[11px] leading-relaxed text-text-muted">
              Earliest deadline first. Work in progress breaks ties.
            </p>
            <div className="max-h-[430px] space-y-2 overflow-y-auto">
              {queue.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={item.id === task.id}
                  className={`flex w-full gap-3 rounded-xl border p-3.5 text-left transition focus-visible:outline-brand-primary motion-reduce:transition-none ${item.id === task.id ? "border-[#93AA83] bg-white shadow-sm" : "border-transparent hover:bg-white/70"}`}
                >
                  <span className="pt-0.5 font-mono text-[10px] text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold leading-relaxed">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[10px] text-text-muted">
                      {deadline(item, now).label} · {item.assignee}
                    </span>
                  </span>
                  {item.id === task.id && (
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-type-feature"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function CommandMenu({ tasks, onClose, onEdit, actions }) {
  const [query, setQuery] = useState("");
  const matches = tasks
    .filter((task) =>
      `${task.title} ${task.context || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 8);
  const commands = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Modal
      title="Where next?"
      subtitle="Find a task or jump straight to an action."
      onClose={onClose}
    >
      <div className="p-5">
        <label className="relative block">
          <Search size={18} className="absolute left-3 top-3 text-text-muted" />
          <input
            data-autofocus
            aria-label="Search commands and tasks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your studio…"
            className={`${fieldClass} !pl-10`}
          />
        </label>
        <div className="mt-4 max-h-[45vh] space-y-1 overflow-y-auto">
          {commands.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-brand-accent focus-visible:bg-brand-accent focus-visible:outline-brand-primary"
              onClick={() => {
                onClose();
                action.run();
              }}
            >
              <Command size={14} />
              {action.label}
              <kbd className="ml-auto text-xs text-text-muted">
                {action.key}
              </kbd>
            </button>
          ))}
          {matches.length > 0 && (
            <p className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-widest text-text-muted">
              Tasks
            </p>
          )}
          {matches.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-brand-accent focus-visible:bg-brand-accent focus-visible:outline-brand-primary"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${task.status === "done" ? "bg-type-feature" : "bg-[#BD8A39]"}`}
              />
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              <span className="text-[10px] text-text-muted">
                {STAGES.find((stage) => stage.id === task.status).label}
              </span>
            </button>
          ))}
          {!commands.length && !matches.length && (
            <p className="p-6 text-center text-sm text-text-muted">
              No matching tasks or actions.
            </p>
          )}
        </div>
        <p className="mt-4 border-t border-stone-200 pt-3 text-[11px] text-text-muted">
          Tab to navigate · Enter to choose · Esc to close
        </p>
      </div>
    </Modal>
  );
}

export function ActivityPanel({ activity, tasks, onClose, onEdit }) {
  return (
    <Modal
      title="A trail worth keeping."
      subtitle="Your latest 80 changes, saved in this browser."
      onClose={onClose}
    >
      <div className="max-h-[65vh] overflow-y-auto p-6">
        {!activity.length && (
          <div className="py-10 text-center">
            <History size={28} className="mx-auto text-type-feature" />
            <h3 className="mt-4 font-editorial text-2xl">
              Your story starts here.
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Edits, handoffs and stage changes will appear here.
            </p>
          </div>
        )}
        <ol className="space-y-5">
          {activity.map((entry) => {
            const task = tasks.find((item) => item.id === entry.taskId);
            return (
              <li key={entry.id} className="flex gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6EDDE] text-brand-primary">
                  <History size={13} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{entry.action}</p>
                  {task ? (
                    <button
                      className="mt-1 text-left text-sm text-brand-primary underline decoration-[#BCCCAF] underline-offset-4"
                      onClick={() => {
                        onClose();
                        onEdit(task);
                      }}
                    >
                      {entry.title}
                    </button>
                  ) : (
                    <p className="mt-1 text-sm text-text-muted">
                      {entry.title}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-text-muted">
                    {new Date(entry.at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Modal>
  );
}

export function ImportBackup({ tasks, onImport }) {
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const duplicates =
    candidate?.tasks.filter((task) =>
      tasks.some((current) => current.id === task.id),
    ).length || 0;
  async function readFile(event) {
    const file = event.target.files?.[0];
    setCandidate(null);
    setError("");
    if (!file) return;
    setReading(true);
    try {
      if (file.size > 2_000_000)
        throw new Error("Choose a JSON backup smaller than 2 MB.");
      setCandidate(parseBackup(await file.text()));
    } catch (problem) {
      setError(problem.message);
    } finally {
      setReading(false);
    }
  }
  return (
    <div className="border-t border-stone-200 pt-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Upload size={15} /> Bring your workspace with you
      </h3>
      <p className="my-2 text-xs leading-relaxed text-text-muted">
        Import a Relay JSON backup. Preview it first, then merge safely or
        replace this workspace.
      </p>
      <input
        type="file"
        accept=".json,application/json"
        aria-label="Import workspace backup"
        onChange={readFile}
        disabled={reading}
        className="block w-full rounded-lg border border-stone-300 bg-white p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#E6EDDE] file:px-3 file:py-2 file:text-brand-primary"
      />
      {reading && (
        <p role="status" className="mt-2 text-xs">
          Reading backup…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-type-bug">
          {error}
        </p>
      )}
      {candidate && (
        <div className="mt-3 rounded-xl bg-[#EAF0E2] p-4">
          <p className="text-sm font-semibold">Ready to import</p>
          <p className="my-2 text-xs leading-relaxed text-text-muted">
            {candidate.tasks.length} tasks ·{" "}
            {candidate.anchors.filter((anchor) => anchor.url).length} links ·{" "}
            {candidate.activity.length} history entries.
            <br />
            {duplicates} matching task IDs will be kept as they are when
            merging.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className={`${primaryClass} !text-xs`}
              onClick={() => onImport(candidate, "merge")}
            >
              Merge new tasks
            </button>
            <button
              className={`${buttonClass} !text-xs`}
              onClick={() => {
                if (
                  window.confirm(
                    "Replace all tasks, deliverable links and activity with this backup? You can undo until your next change.",
                  )
                )
                  onImport(candidate, "replace");
              }}
            >
              Replace workspace
            </button>
          </div>
          <p className="mt-2 text-[10px] text-text-muted">
            Merge keeps existing task IDs, history and links; fills empty
            deliverable slots.
          </p>
        </div>
      )}
    </div>
  );
}

export function TaskList({ tasks, now, onEdit, onUpdate, onCopy }) {
  const ordered = [
    ...focusQueue(tasks, now),
    ...tasks.filter((task) => task.status === "done"),
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {!ordered.length && (
        <p className="p-10 text-center text-sm text-text-muted">
          No tasks match. Clear your filters or create a task.
        </p>
      )}
      {ordered.map((task) => (
        <div
          key={task.id}
          data-testid="task-list-row"
          className="flex flex-wrap items-center gap-3 border-b border-stone-100 p-4 last:border-0 sm:gap-5"
        >
          <span
            className={`h-2 w-2 rounded-full ${task.type === "bug" ? "bg-type-bug" : "bg-type-feature"}`}
          />
          <button
            className="min-w-[120px] flex-1 text-left focus-visible:outline-brand-primary"
            onClick={() => onEdit(task)}
          >
            <span className="block text-sm font-semibold">{task.title}</span>
            <span className="mt-1 block text-[11px] text-text-muted">
              {task.assignee} · {task.type} ·{" "}
              {contextChecklist(task).filter((item) => item.done).length}/4
              handoff checks
            </span>
          </button>
          <span
            className={`rounded-md px-2 py-1 text-[11px] ${deadline(task, now).tone === "overdue" ? "bg-due-overdue text-type-bug" : "bg-[#EEF1E7] text-text-muted"}`}
          >
            {deadline(task, now).label}
          </span>
          <select
            aria-label={`List stage for ${task.title}`}
            value={task.status}
            onChange={(event) => onUpdate(task, { status: event.target.value })}
            className={`${fieldClass} !w-auto !py-2 !text-xs`}
          >
            {STAGES.map((stage) => (
              <option value={stage.id} key={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
          <button
            aria-label={`Copy briefing for ${task.title}`}
            className={`${buttonClass} !p-2`}
            onClick={() => onCopy(taskPrompt(task))}
          >
            <Clipboard size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
