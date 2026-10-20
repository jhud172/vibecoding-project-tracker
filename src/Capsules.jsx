import { useEffect, useRef, useState } from "react";
import { BookOpen, Clipboard, Download, Plus } from "lucide-react";
import { Field, Modal, buttonClass, fieldClass, primaryClass } from "./ui.jsx";
import { ReadButton } from "./Accessibility.jsx";
import { addActivity } from "./workspace.js";
import { SECTIONS, NOTE_LIMIT, emptyCapsule, saveCapsule, draftFromCapsule, extractSections, freshness, capsulePrompt, capsuleFile, parseCapsule, addCapsule } from "./capsules.js";

const download = (text, filename, type) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const example = () => {
  const sections = {
    goal: "Make the mobile navigation usable with keyboard and touch.",
    decisions: "Keep the existing React components. Use a visible Menu button with a written label. Keep navigation links in a predictable order.",
    rejected: "Hover-only navigation was rejected because touch users cannot rely on hovering. An icon without a label was rejected because its meaning could be unclear.",
    works: "In this fictional demo scenario, the desktop navigation is implemented. Mobile interaction still needs verification.",
    nextStep: "Add the mobile Menu toggle, support Escape to close it, and return focus to the toggle.",
    verify: "At a narrow screen width, use Tab to reach Menu, press Enter to open it, navigate the links, then press Escape. Confirm focus returns to Menu.",
    risks: "Touch behaviour and screen-reader announcements have not been tested. Long service names may wrap.",
  };
  const files = "src/components/MobileMenu.jsx\nsrc/styles/navigation.css\nIllustrative paths for this fictional project; not Relay implementation files.";
  return {
    ...emptyCapsule(), ...sections,
    title: "Campus Companion — mobile menu handoff",
    notes: [
      "FICTIONAL DEMO PROJECT: Campus Companion, a website helping students find university services.",
      ...SECTIONS.map(([key, label]) => `${label}: ${sections[key]}`),
      `Changed files: ${files}`,
    ].join("\n\n"),
    people: "James — solo developer",
    repository: "Campus Companion — fictional demonstration project",
    revision: "demo-revision-1",
    files,
    evidence: [{
      label: "Mobile menu keyboard navigation",
      command: "Manual check: Tab to Menu, press Enter, navigate links, press Escape, and inspect returned focus.",
      status: "not-run",
      result: "Not run during this demonstration. Keyboard, touch and screen-reader checks remain outstanding.",
    }],
  };
};

export function CapsuleEditor({ workspace, initial, onClose, onSaved, onNotify }) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedValue, setSavedValue] = useState(JSON.stringify(initial));
  const draftBase = useRef(JSON.stringify(workspace.project.capsuleDraft || null));
  const heading = useRef(null);
  const errorRef = useRef(null);
  const dirty = JSON.stringify(draft) !== savedValue;
  const change = (key, value) => { setDraft(d => ({ ...d, [key]: value })); setMessage(""); };
  useEffect(() => {
    const leave = e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const close = () => {
    if (!dirty || window.confirm("Leave this editor without saving the latest changes? Use Save draft to keep them.")) onClose();
  };
  const move = n => { setError(""); setStep(n); requestAnimationFrame(() => heading.current?.focus()); };
  const persist = async final => {
    setError(""); setBusy(true);
    try {
      const capsule = final ? saveCapsule(draft) : null;
      const result = await workspace.mutate(data => {
        const p = data.projects.find(item => item.id === data.activeProject);
        if (JSON.stringify(p.capsuleDraft || null) !== draftBase.current)
          throw new Error("The saved capsule draft changed elsewhere. Your text is still here. Copy it before closing, then reopen the latest draft.");
        if (final) { p.capsules = addCapsule(p.capsules, capsule); p.capsuleDraft = null; }
        else p.capsuleDraft = structuredClone(draft);
        addActivity(p, final ? "Saved Resume Capsule" : "Saved capsule draft", draft.title || "Untitled capsule");
        data.welcome = false;
        return data;
      }, final ? "Save Resume Capsule" : "Save capsule draft");
      if (!result.ok) throw new Error(result.error);
      draftBase.current = JSON.stringify(final ? null : draft);
      setSavedValue(JSON.stringify(draft));
      if (final) { onNotify("Capsule saved. Review it, then copy the handoff to your next session."); onSaved(capsule); }
      else setMessage("Draft saved in this browser and included in complete workspace backups.");
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const importNotes = async file => {
    if (!file) return;
    setError("");
    try {
      if (file.size > 160000 || !/\.(txt|md|markdown)$/i.test(file.name)) throw new Error("Choose a .txt or .md notes file smaller than 160 KB.");
      const notes = await file.text();
      if (notes.length > NOTE_LIMIT || notes.includes("\u0000")) throw new Error(`Notes must be plain text with at most ${NOTE_LIMIT.toLocaleString()} characters.`);
      if (draft.notes && !window.confirm("Replace the notes in this draft with the selected file? Other sections stay unchanged.")) return;
      change("notes", notes); setMessage("Notes loaded locally. Review them before shaping the handoff.");
    } catch (failure) { setError(failure.message); }
  };
  const preview = capsulePrompt({ ...draft, createdAt: "Set when saved" });
  return <Modal title="Create a Resume Capsule" subtitle="Keep the stopping point. Give the next session a clear starting point." onClose={close} wide>
    <div className="space-y-5 p-6">
      <ol aria-label="Capsule steps" className="capsule-steps">
        {["Add team notes", "Shape the handoff", "Review & save"].map((label, i) => <li key={label}>
          <button type="button" aria-current={step === i ? "step" : undefined} className={`${buttonClass} w-full ${step === i ? "!border-brand-primary !bg-surface-tint" : ""}`} onClick={() => move(i)}>{i + 1}. {label}</button>
        </li>)}
      </ol>
      <p className="text-xs leading-relaxed text-text-muted">Local workspace · no account or AI API needed. Notes are not uploaded. Save draft before leaving; typing alone does not save this editor.</p>
      {draft.parentId && <p className="rounded-lg border border-line bg-surface-tint p-3 text-sm">Continuing an earlier capsule. Its notes and check names are carried forward; results start as Not run. Earlier results remain in the original snapshot. Update the working state, revision and next step for this session.</p>}
      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg border border-strong-line bg-due-overdue p-3 text-sm">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-surface-tint p-3 text-sm">{message}</p>}
      <h3 ref={heading} tabIndex={-1} className="font-editorial text-2xl">{["1. Bring the team's thinking", "2. Decide where to take off", "3. Review what the next session will receive"][step]}</h3>
      {step === 0 && <div className="space-y-4">
        <p className="text-sm leading-relaxed text-text-muted">Paste meeting notes, an AI-session summary or your own progress notes. Name contributors if useful. You choose what becomes part of the handoff.</p>
        <Field label="Capsule title" hint="A recognisable stopping point, for example: Mobile menu — ready for keyboard testing."><input data-autofocus className={fieldClass} value={draft.title} maxLength={120} onChange={e => change("title", e.target.value)} /></Field>
        <Field label="Team / session notes" hint="Drop one .txt/.md file here or paste text. Original notes stay separate from your curated sections. Do not include passwords or API keys.">
          <textarea className={fieldClass} rows={9} maxLength={NOTE_LIMIT} value={draft.notes} onChange={e => change("notes", e.target.value)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) importNotes(e.dataTransfer.files[0]); else change("notes", `${draft.notes}${e.dataTransfer.getData("text/plain")}`.slice(0, NOTE_LIMIT)); }} />
        </Field>
        <Field label="Load notes file"><input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" className={fieldClass} onChange={e => { importNotes(e.target.files[0]); e.target.value = ""; }} /></Field>
        <Field label="Contributors (optional)" hint="Names are context only; adding a name does not invite or notify anyone."><input className={fieldClass} value={draft.people} maxLength={300} onChange={e => change("people", e.target.value)} /></Field>
        <button type="button" className={buttonClass} disabled={!draft.notes.trim()} onClick={() => {
          const sections = extractSections(draft.notes);
          setDraft(d => { const next = { ...d }; for (const [k, v] of Object.entries(sections)) if (!d[k].trim() && v.trim()) next[k] = v; return next; });
          setMessage(Object.keys(sections).length ? "Recognised headings copied into empty sections. Existing sections and original notes were kept. Review them in step 2." : "No recognised headings found. Your notes are kept; fill the sections in step 2.");
        }}>Use headings from notes</button>
        <p className="text-xs text-text-muted">Recognises headings such as Goal:, Decisions:, What works:, Next step: and Verify:. This is text extraction, not AI interpretation.</p>
      </div>}
      {step === 1 && <div className="space-y-4">
        <p className="text-sm text-text-muted">Goal and Next step are required to save a capsule. Other sections can honestly remain unknown. Nothing here claims that work has been tested.</p>
        {SECTIONS.map(([key, label, hint]) => <Field key={key} label={`${label}${["goal", "nextStep"].includes(key) ? " (required)" : ""}`} hint={hint}><textarea className={fieldClass} rows={3} maxLength={10000} value={draft[key]} onChange={e => change(key, e.target.value)} /></Field>)}
        <Field label="Link to a task (optional)" hint="Connect this stopping point to an existing task; saving the capsule does not change that task."><select className={fieldClass} value={draft.taskId} onChange={e => change("taskId", e.target.value)}><option value="">Whole project / no task</option>{draft.taskId && !workspace.project.tasks.some(t => t.id === draft.taskId) && <option value={draft.taskId}>Previously linked task (unavailable)</option>}{workspace.project.tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
      </div>}
      {step === 2 && <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Repository / project reference" hint="A label or URL; Relay does not open it or inspect the repository."><input className={fieldClass} maxLength={300} value={draft.repository} onChange={e => change("repository", e.target.value)} /></Field>
          <Field label="Recorded revision" hint="Paste the full commit SHA or a revision label you can compare later."><input className={fieldClass} maxLength={100} value={draft.revision} onChange={e => change("revision", e.target.value)} /></Field>
        </div>
        <Field label="Relevant / changed files" hint="User-supplied file names. Relay has not verified these changes."><textarea className={fieldClass} rows={3} maxLength={10000} value={draft.files} onChange={e => change("files", e.target.value)} /></Field>
        <div className="rounded-xl border border-line bg-surface-tint p-4">
          <h4 className="font-semibold">Evidence, with honest limits</h4>
          <p className="my-2 text-sm text-text-muted">All results are user-reported. Relay does not execute commands. Record the command/source and actual result; leave unrun checks as Not run.</p>
          {draft.evidence.map((item, i) => <fieldset key={i} className="my-4 space-y-3 rounded-lg border border-strong-line p-3"><legend className="px-1 text-sm font-semibold">Evidence {i + 1}</legend>
            {[["label", "Check name", 160], ["command", "Command / evidence source", 1000], ["result", "Actual result / blocker", 4000]].map(([key, label, max]) => <Field key={key} label={`${label} ${i + 1}`}><textarea rows={key === "result" ? 3 : 2} maxLength={max} className={fieldClass} value={item[key]} onChange={e => change("evidence", draft.evidence.map((x, j) => j === i ? { ...x, [key]: e.target.value } : x))} /></Field>)}
            <Field label={`Reported outcome ${i + 1}`}><select className={fieldClass} value={item.status} onChange={e => change("evidence", draft.evidence.map((x, j) => j === i ? { ...x, status: e.target.value } : x))}><option value="not-run">Not run</option><option value="pass">Reported pass</option><option value="fail">Reported failure</option><option value="blocked">Blocked</option></select></Field>
            <button type="button" className={buttonClass} onClick={() => change("evidence", draft.evidence.filter((_, j) => i !== j))}>Remove evidence {i + 1}</button>
          </fieldset>)}
          <button type="button" className={buttonClass} disabled={draft.evidence.length >= 12} onClick={() => change("evidence", [...draft.evidence, { label: "", command: "", result: "", status: "not-run" }])}>Add evidence item</button>
        </div>
        <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Preview the curated handoff</summary><pre className="capsule-preview mt-3">{preview}</pre></details>
        <p className="text-sm text-text-muted">Save creates a fixed snapshot. Resuming it later creates a new draft and keeps the original. Original notes are stored locally; including them in a copied briefing is optional.</p>
      </div>}
      <div className="flex flex-wrap gap-3 border-t border-line pt-4">
        {step > 0 && <button type="button" className={buttonClass} onClick={() => move(step - 1)}>Back</button>}
        <button type="button" className={buttonClass} disabled={busy || workspace.readOnly} onClick={() => persist(false)}>Save draft</button>
        {step < 2 ? <button type="button" className={primaryClass} onClick={() => move(step + 1)}>Continue to {step === 0 ? "handoff sections" : "review"}</button> : <button type="button" className={primaryClass} disabled={busy || workspace.readOnly} onClick={() => persist(true)}>Save capsule</button>}
      </div>
    </div>
  </Modal>;
}

export function CapsuleDetail({ capsule, currentRevision, onClose, onCopy, onResume, onRemove, onTask }) {
  const [includeNotes, setIncludeNotes] = useState(false);
  const [current, setCurrent] = useState(currentRevision);
  const status = freshness(capsule, current);
  const prompt = capsulePrompt(capsule, current, includeNotes);
  return <Modal title={capsule.title} subtitle={`Saved ${new Date(capsule.createdAt).toLocaleString("en-GB")} · fixed snapshot`} onClose={onClose} wide>
    <div className="space-y-5 p-6">
      <p className="text-sm leading-relaxed">Start with the next step below. Copy the reviewed briefing into your preferred AI tool or begin a new session draft here. The original capsule will stay unchanged.</p>
      <div className="rounded-xl border border-strong-line bg-surface-tint p-4"><p className="text-xs font-semibold uppercase tracking-widest">Take off here</p><p className="mt-2 text-base font-semibold">{capsule.nextStep}</p><p className="mt-2 text-sm text-text-muted">Goal: {capsule.goal}</p></div>
      <Field label="Current revision to compare" hint="Enter a revision from the same repository. This compares text only; it never checks code or runs tests."><input className={fieldClass} maxLength={100} value={current} onChange={e => setCurrent(e.target.value)} /></Field>
      <div role="status" className="rounded-lg border border-line p-3 text-sm"><strong>{status.label}</strong><p className="mt-1 text-text-muted">{status.note}</p><p className="mt-1 text-text-muted">Recorded: {capsule.revision || "Not recorded"} · {capsule.repository || "Repository not recorded"}</p></div>
      <dl className="space-y-4">{SECTIONS.filter(([key]) => !["nextStep", "goal"].includes(key)).map(([key, label]) => <div key={key}><dt className="text-sm font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{capsule[key] || "Not recorded"}</dd></div>)}</dl>
      <p className="text-sm"><strong>Evidence:</strong> {capsule.evidence.length ? capsule.evidence.map(e => `${e.label}: ${e.status} (user-reported)`).join(" · ") : "No check results recorded. Do not assume checks passed."}</p>
      {capsule.parentId && <p className="text-xs text-text-muted">Continues capsule {capsule.parentId}. The earlier capsule may have been removed or may belong to another workspace.</p>}
      <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">Original team notes</summary><p className="mt-3 whitespace-pre-wrap text-sm">{capsule.notes || "No original notes recorded."}</p></details>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={includeNotes} onChange={e => setIncludeNotes(e.target.checked)} />Include original notes in the copied / Markdown handoff</label>
      <Field label="Review the handoff before sharing" hint="Copied text goes to your clipboard. You decide where to paste it. Check names, context and evidence for private information."><textarea readOnly className={`${fieldClass} h-64 font-mono text-xs`} value={prompt} /></Field>
      <ReadButton title={`Capsule: ${capsule.title}`} text={prompt} />
      <p className="text-xs text-text-muted">Read-aloud covers the first 12,000 characters. The complete text remains available above and in the Markdown download.</p>
      <div className="flex flex-wrap gap-3">
        <button className={primaryClass} type="button" onClick={() => onCopy(prompt)}><Clipboard size={16} aria-hidden="true" />Copy capsule handoff</button>
        <button className={buttonClass} type="button" onClick={() => onResume(capsule)}>Start next session from this capsule</button>
        {capsule.taskId && <button className={buttonClass} type="button" onClick={() => onTask(capsule.taskId)}>Open linked task</button>}
        <button className={buttonClass} type="button" onClick={() => download(prompt, "relay-handoff.md", "text/markdown;charset=utf-8")}>Download handoff Markdown</button>
        <button className={buttonClass} type="button" onClick={() => download(JSON.stringify(capsuleFile(capsule), null, 2), "relay-capsule.json", "application/json")}><Download size={16} aria-hidden="true" />Download full capsule (includes notes)</button>
        <button className={buttonClass} type="button" onClick={() => onRemove(capsule)}>Remove capsule</button>
      </div>
    </div>
  </Modal>;
}

export function CapsuleHome({ workspace, startRequest = 0, onCopy, onNotify, onTask, onBoard, onFocus }) {
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [currentRevision, setCurrentRevision] = useState("");
  const [failure, setFailure] = useState("");
  const capsules = workspace.project.capsules || [];
  const shown = capsules.filter(c => `${c.title} ${c.goal} ${c.nextStep} ${c.people}`.toLowerCase().includes(query.trim().toLowerCase()));
  const open = draft => {
    if (workspace.project.capsuleDraft && JSON.stringify(draft) !== JSON.stringify(workspace.project.capsuleDraft)
      && !window.confirm("A saved capsule draft already exists. Starting another draft will replace it only if you choose Save draft or Save capsule. Continue?")) return;
    setEditor(draft);
  };
  useEffect(() => { if (startRequest) open(emptyCapsule()); }, [startRequest]);
  const importFile = async file => {
    if (!file) return;
    setFailure("");
    try {
      if (file.size > 500000) throw new Error("Choose a capsule JSON file smaller than 500 KB.");
      const capsule = parseCapsule(await file.text());
      // Preview before committing imported notes and reported evidence.
      setSelected({ ...capsule, pendingImport: true });
    } catch (error) { setFailure(error.message); }
  };
  const confirmImport = async () => {
    try {
      const capsule = { ...selected }; delete capsule.pendingImport;
      const result = await workspace.mutate(data => {
        const p = data.projects.find(item => item.id === data.activeProject);
        p.capsules = addCapsule(p.capsules, capsule); data.welcome = false; return data;
      }, "Import reviewed capsule");
      if (!result.ok) throw new Error(result.error);
      setSelected(null); onNotify("Reviewed capsule imported. Its evidence remains user-reported.");
    } catch (error) { setFailure(error.message); setSelected(null); }
  };
  return <section id="capsules" aria-labelledby="capsules-title" className="mb-10 scroll-mt-5">
    <div className="capsule-intro rounded-2xl border border-line bg-surface-card p-5 sm:p-7">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary">Your starting point</p>
      <h2 id="capsules-title" className="font-editorial text-3xl">Team notes in. A clear next session out.</h2>
      <p className="my-4 max-w-3xl text-sm leading-relaxed text-text-muted">A Resume Capsule saves a stopping point: the team's notes, decisions, what works, evidence and exactly where to take off. Use it yourself tomorrow or copy a briefing into a fresh AI conversation. No account required.</p>
      <ol className="capsule-steps mb-5 text-sm">
        <li><strong>01 · Add notes</strong><p className="mt-1 text-text-muted">Paste your session summary or drop a text file.</p></li>
        <li><strong>02 · Shape the handoff</strong><p className="mt-1 text-text-muted">Keep the decisions and choose one next step.</p></li>
        <li><strong>03 · Save & resume</strong><p className="mt-1 text-text-muted">Review evidence, save a snapshot, then copy it when you return.</p></li>
      </ol>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={primaryClass} disabled={workspace.readOnly} onClick={() => open(emptyCapsule())}><Plus size={16} aria-hidden="true" />Create capsule</button>
        {workspace.project.capsuleDraft && <button type="button" className={buttonClass} onClick={() => open(workspace.project.capsuleDraft)}>Continue saved capsule draft</button>}
        <button type="button" className={buttonClass} onClick={() => open(example())}>Try an example draft</button>
      </div>
      <p className="mt-3 text-xs text-text-muted">The fictional example has notes, handoff sections, revision and an unrun check already filled in. Walk through all three steps without typing.</p>
      <details className="mt-5 border-t border-line pt-4"><summary className="cursor-pointer text-sm font-semibold">New here? How Relay fits your work</summary>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-text-muted"><p>Before leaving a meeting or coding session, create a capsule. Keep rough notes in step 1, clarify the next action in step 2 and record real check results in step 3. Save draft if you are not ready.</p><p>When you return, open a capsule, compare the current revision if you know it, review the briefing and copy it into your preferred tool. Relay does not read your chats, execute code or update your tasks automatically.</p><p>Use the task board below for ongoing work and Focus desk for deadline-based ordering. Deliverable links keep your final outputs together. Named contributors are notes, not invited accounts. Download backups from workspace settings; clearing site data removes local work.</p><div className="flex flex-wrap gap-3"><button className={buttonClass} type="button" onClick={onBoard}>Go to task board</button><button className={buttonClass} type="button" onClick={onFocus}>Open Focus desk</button><a href="/design.html#why-capsules" className="self-center text-brand-primary underline">Why capsules work this way</a></div></div>
      </details>
    </div>
    <div className="my-5 flex flex-wrap items-end justify-between gap-4"><div><h3 className="font-editorial text-2xl">Your saved stopping points</h3><p className="mt-1 text-xs text-text-muted">{capsules.length}/40 capsules · original snapshots stay unchanged when resumed</p></div>
      {!!capsules.length && <Field label="Find a capsule"><input type="search" className={fieldClass} value={query} onChange={e => setQuery(e.target.value)} /></Field>}
    </div>
    {!!capsules.length && <div className="mb-5 max-w-xl"><Field label="Current revision (optional)" hint="Paste a full SHA or revision label from the same repository to compare saved capsules. This is a text comparison, not a live GitHub connection."><input className={fieldClass} maxLength={100} value={currentRevision} onChange={e => setCurrentRevision(e.target.value)} /></Field></div>}
    {failure && <p role="alert" className="mb-4 rounded-lg border border-strong-line bg-due-overdue p-3 text-sm">{failure}</p>}
    <p role="status" className="mb-3 text-xs text-text-muted">{shown.length} saved {shown.length === 1 ? "capsule" : "capsules"} shown</p>
    {!shown.length && <div className="rounded-xl border border-dashed border-strong-line p-6"><BookOpen size={22} aria-hidden="true" /><p className="mt-3 font-semibold">{capsules.length ? "No capsules match your search." : "Your next session starts with the notes you keep today."}</p><p className="mt-2 text-sm text-text-muted">{capsules.length ? "Try a title, goal, contributor or next step." : "Create your first capsule, or try the fictional example before adding your own work."}</p>{query && <button type="button" className={`${buttonClass} mt-3`} onClick={() => setQuery("")}>Clear capsule search</button>}</div>}
    <div className="grid gap-4 md:grid-cols-2">{shown.map(c => <article key={c.id} className="min-w-0 rounded-xl border border-line bg-surface-card p-5"><p className="text-xs text-text-muted">{new Date(c.createdAt).toLocaleString("en-GB")}</p><h4 className="mt-2 text-lg font-semibold">{c.title}</h4><p className="my-3 text-sm"><strong>Next:</strong> {c.nextStep}</p><p className="text-xs text-text-muted">{freshness(c, currentRevision).label}</p><p className="mt-2 text-xs text-text-muted">{c.evidence.length} user-reported evidence {c.evidence.length === 1 ? "item" : "items"}</p><button type="button" className={`${buttonClass} mt-4`} onClick={() => setSelected(c)}>Open capsule: {c.title}</button></article>)}</div>
    <div className="mt-6 max-w-xl rounded-xl border border-line p-4"><Field label="Import a Resume Capsule" hint="Choose a Relay capsule .json file (up to 500 KB). Review it before saving; imported evidence is not independently verified."><input type="file" className={fieldClass} accept=".json,application/json" onChange={e => { importFile(e.target.files[0]); e.target.value = ""; }} /></Field></div>
    {editor && <CapsuleEditor key={workspace.project.id} workspace={workspace} initial={editor} onClose={() => setEditor(null)} onNotify={onNotify} onSaved={c => { setEditor(null); setSelected(c); }} />}
    {selected?.pendingImport ? <Modal title="Review capsule import" subtitle="No saved work has changed." onClose={() => setSelected(null)} wide><div className="space-y-4 p-6"><p className="text-sm">{selected.title} · includes original notes and user-reported evidence. Import adds a snapshot without overwriting existing capsules.</p><pre className="capsule-preview max-h-80 overflow-y-auto">{capsulePrompt(selected, "", true)}</pre><button type="button" className={primaryClass} disabled={workspace.readOnly} onClick={confirmImport}>Import reviewed capsule</button></div></Modal> : selected && <CapsuleDetail capsule={selected} currentRevision={currentRevision} onClose={() => setSelected(null)} onCopy={onCopy} onResume={c => { setSelected(null); open(draftFromCapsule(c)); }} onTask={id => { const t = workspace.project.tasks.find(t => t.id === id); if (t) { setSelected(null); onTask(t); } else onNotify("The linked task is unavailable. The capsule snapshot is still intact."); }} onRemove={async c => {
      if (!window.confirm("Remove this capsule? Undo or a saved workspace recovery version can restore it. Download it first for a separate copy.")) return;
      const result = await workspace.updateProject(p => ({ ...p, capsules: (p.capsules || []).filter(x => x.id !== c.id) }), "Remove capsule");
      if (result.ok) { setSelected(null); onNotify("Capsule removed. Undo is available."); } else onNotify(result.error);
    }} />}
  </section>;
}
