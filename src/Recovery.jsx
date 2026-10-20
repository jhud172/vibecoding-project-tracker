import { useState } from "react";
import { Download, History, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { ANCHORS } from "./model";
import {
  addActivity,
  estimateStorageBytes,
  newData,
  newProject,
} from "./workspace";
import { Modal, buttonClass, primaryClass } from "./ui";
import { rawStorageValues } from "./rawRecovery.js";

export function WelcomePanel({ onChoose }) {
  const [busy, setBusy] = useState(false);
  const choose = async (demo) => {
    setBusy(true);
    try {
      await onChoose(demo);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-labelledby="welcome-title"
      className="mb-7 rounded-2xl border border-strong-line bg-surface-tint p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
        Welcome to Relay
      </p>
      <h2 id="welcome-title" className="mt-2 font-editorial text-2xl">
        Start with your work, or explore an example.
      </h2>
      <p className="my-3 max-w-2xl text-sm leading-relaxed text-text-muted">
        Create a task, leave the decisions and next step in its context, then
        copy the briefing when you return. Everything saves in this browser.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={primaryClass}
          disabled={busy}
          onClick={() => choose(false)}
        >
          Start an empty workspace
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={busy}
          onClick={() => choose(true)}
        >
          Explore labelled sample tasks
        </button>
      </div>
    </section>
  );
}

export function RecoveryPanel({ workspace, onClose, onBackup, onNotify }) {
  const [busy, setBusy] = useState(false);
  const [rawNotice, setRawNotice] = useState("");
  const { state, project } = workspace;
  let bytes = null;
  try {
    bytes = estimateStorageBytes(window.localStorage);
  } catch {
    /* Store warning remains visible. */
  }
  const act = async (callback) => {
    setBusy(true);
    try {
      const result = await callback();
      onNotify(result.ok ? "Recovery change saved." : result.error);
    } finally {
      setBusy(false);
    }
  };
  const downloadRaw = () => {
    let values;
    try {
      values = rawStorageValues(window.localStorage);
      setRawNotice("Raw recovery download requested, including readable workspace versions and unfinished drafts. Keep it private. Use a workspace backup for normal import.");
    } catch {
      values = { inMemoryWorkspace: JSON.stringify(state) };
      setRawNotice("Browser storage could not be read completely. This partial download contains the in-memory workspace and protected original only; unfinished drafts may be missing. Keep this browser profile intact.");
    }
    values.protectedOriginal = workspace.store.rawRecovery();
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(values, null, 2)],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "relay-protected-storage.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Modal
      title="A way back to your work."
      subtitle="Restore a deleted task, undo changes or inspect saved recovery versions."
      onClose={onClose}
      wide
    >
      <div className="space-y-6 p-6">
        {workspace.error && (
          <p
            role="alert"
            className="rounded-xl bg-due-overdue p-4 text-sm text-type-bug"
          >
            {workspace.error}
          </p>
        )}
        <section
          aria-labelledby="recovery-storage"
          className="rounded-xl border border-line bg-surface-tint p-4"
        >
          <h3 id="recovery-storage" className="text-sm font-semibold">
            Your saved workspace
          </h3>
          <p className="my-2 text-sm text-text-muted">
            {bytes === null ? "Storage usage is unavailable because browser storage cannot be read."
              : `Approximately ${(bytes / 1024).toFixed(0)} KB of browser storage, including retained legacy data. This is an estimate, not a capacity guarantee.`}
          </p>
          <p className="mb-3 text-xs text-text-muted">
            Last backup requested:{" "}
            {state.data.lastBackupAt
              ? new Date(state.data.lastBackupAt).toLocaleString("en-GB")
              : "No download recorded"}
            . Check that the file reached your Downloads folder.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryClass} onClick={onBackup}>
              <Download size={16} /> Download workspace backup
            </button>
            <button type="button" className={buttonClass} onClick={downloadRaw}>
              Download protected raw data
            </button>
          </div>
          {rawNotice && <p role="status" className="mt-3 text-sm text-text-muted">{rawNotice}</p>}
        </section>
        <section aria-labelledby="recovery-undo">
          <h3 id="recovery-undo" className="mb-3 text-base font-semibold">
            Undo & redo across reloads
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={buttonClass}
              disabled={busy || workspace.readOnly || !state.undo.length}
              onClick={() => act(workspace.undo)}
            >
              <RotateCcw size={16} /> Undo last change
            </button>
            <button
              className={buttonClass}
              disabled={busy || workspace.readOnly || !state.redo.length}
              onClick={() => act(workspace.redo)}
            >
              <RotateCw size={16} /> Redo change
            </button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Up to twelve recent workspace versions are kept within a storage
            budget. Large workspaces retain fewer versions; a backup provides
            longer-term recovery.
          </p>
        </section>
        <section
          aria-labelledby="recovery-trash"
          className="border-t border-line pt-5"
        >
          <h3
            id="recovery-trash"
            className="mb-3 flex items-center gap-2 text-base font-semibold"
          >
            <Trash2 size={18} /> Deleted tasks · {project.trash.length}
          </h3>
          <p className="mb-3 text-xs text-text-muted">
            The latest fifty deleted tasks in this project. Restoring keeps the
            original task identity, context and dates.
          </p>
          {!project.trash.length && (
            <p className="rounded-lg border border-dashed border-line p-4 text-sm text-text-muted">
              No deleted tasks to recover.
            </p>
          )}
          <div className="space-y-3">
            {project.trash.map((entry) => (
              <div
                key={entry.task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-card p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{entry.task.title}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Deleted {new Date(entry.deletedAt).toLocaleString("en-GB")}
                  </p>
                </div>
                <button
                  aria-label={`Restore task: ${entry.task.title}`}
                  className={buttonClass}
                  disabled={busy || workspace.readOnly}
                  onClick={() =>
                    act(() =>
                      workspace.updateProject((p) => {
                        if (p.tasks.some((task) => task.id === entry.task.id))
                          throw new Error(
                            "A task with this identity already exists. No duplicate was restored.",
                          );
                        p.tasks.push(entry.task);
                        p.trash = p.trash.filter(
                          (item) => item.task.id !== entry.task.id,
                        );
                        return addActivity(
                          p,
                          "Restored deleted task",
                          entry.task.title,
                          entry.task.id,
                        );
                      }, "Restore deleted task"),
                    )
                  }
                >
                  Restore task
                  <span className="sr-only">: {entry.task.title}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
        <section
          aria-labelledby="recovery-versions"
          className="border-t border-line pt-5"
        >
          <h3
            id="recovery-versions"
            className="mb-3 flex items-center gap-2 text-base font-semibold"
          >
            <History size={18} /> Saved recovery versions
          </h3>
          <div className="space-y-3">
            {!state.undo.length && (
              <p className="text-sm text-text-muted">
                Your first saved change will create a recovery version.
              </p>
            )}
            {state.undo.map((entry, index) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"
                key={`${entry.at}-${index}`}
              >
                <div>
                  <p className="text-sm font-semibold">Before: {entry.label}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(entry.at).toLocaleString("en-GB")} ·{" "}
                    {entry.data.projects.reduce(
                      (n, p) => n + p.tasks.length,
                      0,
                    )}{" "}
                    tasks across {entry.data.projects.length} projects
                  </p>
                </div>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={busy || workspace.readOnly}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Restore this saved workspace version? The current version will be available through Undo.",
                      )
                    )
                      act(() =>
                        workspace.mutate(
                          () => entry.data,
                          "Restore recovery version",
                        ),
                      );
                  }}
                >
                  Restore version<span className="sr-only"> {index + 1}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
        {workspace.readOnly && (
          <section className="border-t border-line pt-5">
            <h3 className="text-base font-semibold">Explicit recovery</h3>
            <p className="my-3 text-sm text-text-muted">
              Download protected raw data first. Starting empty replaces the
              damaged current storage value; legacy keys are kept.
            </p>
            <button
              type="button"
              disabled={busy}
              className={buttonClass}
              onClick={() => {
                if (
                  window.confirm(
                    "Have you downloaded the protected raw data? Replace the damaged saved workspace with an empty one?",
                  )
                )
                  act(() =>
                    workspace.recover(newData(newProject([], ANCHORS), false)),
                  );
              }}
            >
              Replace protected storage with an empty workspace
            </button>
          </section>
        )}
      </div>
    </Modal>
  );
}
