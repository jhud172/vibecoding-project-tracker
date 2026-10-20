import { useState } from "react";
import { useAccess } from "./Accessibility.jsx";
import { Field, buttonClass, fieldClass, primaryClass } from "./ui";
import {
  importConflicts,
  mergeWorkspace,
  parseWorkspaceBackup,
} from "./transfer";
export default function WorkspaceTransfer({ workspace, onBackup, onNotify }) {
  const { prefs, restore } = useAccess();
  const [candidate, setCandidate] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [choices, setChoices] = useState({});
  const [includePrefs, setIncludePrefs] = useState(false),
    [importPrefs, setImportPrefs] = useState(false);
  const conflicts = candidate
    ? importConflicts(workspace.state.data, candidate.data)
    : [];
  const read = async (event) => {
    const file = event.target.files?.[0];
    setCandidate(null);
    setError("");
    setChoices({});
    setImportPrefs(false);
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 8000000)
        throw new Error("Choose a backup smaller than 8 MB.");
      setCandidate(parseWorkspaceBackup(await file.text()));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  const apply = async (mode) => {
    if (
      mode === "replace" &&
      !window.confirm(
        "Replace every local project, template and view preference with this backup? The current workspace will be stored as a recovery version first.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const result = await workspace.mutate(
        (data) =>
          mode === "replace"
            ? candidate.data
            : mergeWorkspace(data, candidate.data, choices),
        `Before workspace ${mode}`,
      );
      if (!result.ok) throw new Error(result.error);
      if (importPrefs && candidate.preferences) {
        const saved = restore(candidate.preferences);
        if (saved === false)
          throw new Error(
            "Workspace imported, but accessibility preferences could not be saved. Review the accessibility storage warning.",
          );
      }
      setCandidate(null);
      onNotify(
        "Backup imported. A recovery version is available through Undo.",
      );
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="space-y-3 border-t border-line pt-5"
      aria-label="Workspace backup and import"
    >
      <h3 className="font-semibold">Bring your complete workspace with you.</h3>
      <p className="text-xs text-text-muted">
        Backups include all projects, templates, task metadata, activity and
        deleted-task recovery. Undo stacks and unfinished drafts stay in this
        browser; use the protected raw download to preserve those too. Keep
        downloaded context private.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includePrefs}
          onChange={(e) => setIncludePrefs(e.target.checked)}
        />
        Include accessibility preferences in download
      </label>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onBackup(includePrefs ? prefs : undefined)}
      >
        Download complete workspace backup
      </button>
      <input
        type="file"
        aria-label="Import complete workspace backup"
        accept=".json,application/json"
        disabled={busy}
        onChange={read}
        className={fieldClass}
      />
      {error && (
        <p role="alert" className="text-sm text-type-bug">
          {error}
        </p>
      )}
      {busy && (
        <p role="status" className="text-sm">
          Processing backup…
        </p>
      )}
      {candidate && (
        <div className="space-y-3 rounded-xl border border-line p-4">
          <h4 className="font-semibold">Preview before importing</h4>
          <p className="text-sm">
            {candidate.data.projects.length} projects ·{" "}
            {candidate.data.projects.reduce((n, p) => n + p.tasks.length, 0)}{" "}
            tasks · {candidate.data.templates.length} templates ·{" "}
            {conflicts.length} changed task/link conflicts.
          </p>
          <p className="text-xs text-text-muted">
            Merge keeps existing project names, metadata, history and deleted
            tasks. New projects are imported completely; new tasks and templates
            are added. For matching task IDs, choose which text to keep.
            Replacement uses the complete backup.
          </p>
          {conflicts.map((conflict) => (
            <details
              key={conflict.key}
              className="rounded-lg border border-line p-3"
            >
              <summary className="cursor-pointer text-sm">
                {conflict.label}
              </summary>
              <div className="my-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold">Current</h5>
                  <p className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {conflict.before || "No context"}
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-semibold">Backup</h5>
                  <p className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs">
                    {conflict.after || "No context"}
                  </p>
                </div>
              </div>
              <Field label={`Resolve ${conflict.label}`}>
                <select
                  className={fieldClass}
                  value={choices[conflict.key] || "current"}
                  onChange={(e) =>
                    setChoices({ ...choices, [conflict.key]: e.target.value })
                  }
                >
                  <option value="current">Keep current task/link</option>
                  <option value="incoming">Use backup task/link</option>
                </select>
              </Field>
            </details>
          ))}
          {candidate.preferences && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={importPrefs}
                onChange={(e) => setImportPrefs(e.target.checked)}
              />
              Also restore validated accessibility preferences
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={primaryClass}
              disabled={busy || workspace.readOnly}
              onClick={() => apply("merge")}
            >
              Merge reviewed backup
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={busy || workspace.readOnly}
              onClick={() => apply("replace")}
            >
              Replace all local projects
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
