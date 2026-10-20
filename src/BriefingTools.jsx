import { useState } from "react";
import {
  BRIEF_SECTIONS,
  briefingSections,
  conciseBrief,
  lineChanges,
  updateSection,
} from "./briefing";
import { safeUrl, taskPrompt } from "./model";
import { ReadButton } from "./Accessibility.jsx";
import { Field, buttonClass, fieldClass } from "./ui";

// A deliberately small Markdown subset rendered as React text, never raw HTML.
function Inline({ text }) {
  return text
    .split(/(\[[^\]]+\]\([^\s)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((part, index) => {
      if (part.startsWith("`"))
        return (
          <code
            key={index}
            className="rounded bg-surface-subtle px-1 font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      if (part.startsWith("**"))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && safeUrl(link[2]))
        return (
          <a
            key={index}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary underline"
          >
            {link[1]}
            <span className="sr-only"> (opens a new tab)</span>
          </a>
        );
      return part;
    });
}
export function MarkdownPreview({ text }) {
  return (
    <div
      className="space-y-2 break-words text-sm leading-relaxed"
      aria-label="Briefing preview"
    >
      {(text || "No context captured yet.").split("\n").map((line, index) => {
        const heading = line.match(/^#{1,3}\s+(.+)/);
        if (heading)
          return (
            <p
              role="heading"
              aria-level="4"
              key={index}
              className="pt-3 font-semibold"
            >
              <Inline text={heading[1]} />
            </p>
          );
        return (
          <p key={index} className="whitespace-pre-wrap">
            <Inline text={line || " "} />
          </p>
        );
      })}
    </div>
  );
}
export function BriefingTools({
  task,
  onChange,
  templates = [],
  onSaveTemplate,
  onDeleteTemplate,
  onCopy,
}) {
  const [mode, setMode] = useState("raw");
  const [templateName, setTemplateName] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("concise");
  const sections = briefingSections(task.context);
  const handoff = detail === "concise" ? conciseBrief(task) : taskPrompt(task);
  return (
    <div className="mb-4 space-y-4">
      <div
        role="group"
        aria-label="Briefing tools"
        className="flex flex-wrap gap-2"
      >
        {[
          ["raw", "Free text"],
          ["structured", "Section editor"],
          ["preview", "Markdown preview"],
          ["handoff", "Handoff preview"],
          ["wrap", "Wrap up session"],
        ].map(([id, label]) => (
          <button
            type="button"
            key={id}
            aria-pressed={mode === id}
            className={buttonClass}
            onClick={() => setMode(mode === id ? "raw" : id)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "structured" && (
        <section
          aria-label="Structured briefing"
          className="space-y-3 rounded-xl border border-line bg-surface-card p-4"
        >
          <p className="text-xs text-text-muted">
            Edit standard Markdown sections. Free text and other headings are
            preserved. The complete context stays available below.
          </p>
          {BRIEF_SECTIONS.map((heading) => (
            <div key={heading}>
              <Field label={`${heading} section`}>
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={
                    sections.find(
                      (s) => s.heading.toLowerCase() === heading.toLowerCase(),
                    )?.body || ""
                  }
                  onChange={(event) =>
                    onChange(
                      updateSection(
                        task.context || "",
                        heading,
                        event.target.value,
                      ),
                    )
                  }
                />
              </Field>
              <div className="mt-2">
                <ReadButton
                  text={
                    sections.find(
                      (s) => s.heading.toLowerCase() === heading.toLowerCase(),
                    )?.body || `${heading} has not been captured.`
                  }
                  title={`${heading} section`}
                />
              </div>
            </div>
          ))}
        </section>
      )}
      {mode === "preview" && (
        <section className="rounded-xl border border-line bg-surface-card p-4">
          <p className="mb-3 text-xs text-text-muted">
            Preview supports headings, bold, code and HTTP(S) links. HTML and
            other Markdown stay visible as text.
          </p>
          <MarkdownPreview text={task.context} />
        </section>
      )}
      {mode === "handoff" && (
        <section
          aria-label="Handoff preview"
          className="rounded-xl border border-line bg-surface-card p-4"
        >
          <Field label="Briefing detail">
            <select
              className={fieldClass}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            >
              <option value="concise">
                Concise: owner, next action and verification
              </option>
              <option value="detailed">
                Detailed: complete task and context
              </option>
            </select>
          </Field>
          <pre className="my-4 max-h-72 overflow-auto whitespace-pre-wrap break-words font-sans text-sm">
            {handoff}
          </pre>
          <button
            type="button"
            className={buttonClass}
            onClick={() => onCopy(handoff)}
          >
            Copy previewed handoff
          </button>
        </section>
      )}
      {mode === "wrap" && (
        <section
          aria-label="Session wrap-up"
          className="space-y-3 rounded-xl border border-line bg-surface-card p-4"
        >
          <h4 className="font-semibold">
            Leave your next session a starting point.
          </h4>
          <p className="text-xs text-text-muted">
            Record what changed, one next action, a check and any risk. These
            update the draft; use Save changes to commit the session.
          </p>
          {["What works", "Next step", "Verify", "Risks"].map((heading) => (
            <Field key={heading} label={`Wrap-up: ${heading}`}>
              <textarea
                rows={2}
                className={fieldClass}
                value={
                  sections.find(
                    (s) => s.heading.toLowerCase() === heading.toLowerCase(),
                  )?.body || ""
                }
                onChange={(e) =>
                  onChange(
                    updateSection(task.context || "", heading, e.target.value),
                  )
                }
              />
            </Field>
          ))}
        </section>
      )}
      <details className="rounded-xl border border-line p-3">
        <summary className="cursor-pointer text-sm font-medium">
          My reusable templates ({templates.length})
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-text-muted">
            A template saves the current context text for this workspace. Remove
            private details before reusing it.
          </p>
          <Field label="Template name">
            <input
              className={fieldClass}
              value={templateName}
              maxLength={80}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </Field>
          <button
            type="button"
            className={buttonClass}
            disabled={
              !templateName.trim() ||
              !task.context?.trim() ||
              templates.length >= 50
            }
            onClick={async () => {
              const result = await onSaveTemplate({
                id: crypto.randomUUID(),
                label: templateName.trim(),
                text: task.context,
              });
              setMessage(result.ok ? "Template saved." : result.error);
              if (result.ok) setTemplateName("");
            }}
          >
            Save context as template
          </button>
          {message && (
            <p role="status" className="text-sm">
              {message}
            </p>
          )}
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                className={buttonClass}
                onClick={() =>
                  onChange(
                    `${task.context || ""}${task.context ? "\n\n" : ""}${template.text}`,
                  )
                }
              >
                Append {template.label}
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={async () => {
                  const result = await onDeleteTemplate(template.id);
                  setMessage(result.ok ? "Template removed." : result.error);
                }}
              >
                Remove
                <span className="sr-only"> template {template.label}</span>
              </button>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
export function ContextComparison({ before, current, onAppend }) {
  const diff = lineChanges(before, current);
  return (
    <details className="my-3">
      <summary className="cursor-pointer text-xs font-medium">
        Compare with current draft · {diff.removed.length} removed,{" "}
        {diff.added.length} added lines
      </summary>
      <p className="my-2 text-xs text-text-muted">
        Compares line presence; reordered and repeated lines are not marked as
        edits. Append a paragraph to recover only that passage.
      </p>
      <div className="space-y-2">
        {diff.removed.map((line, index) => (
          <p
            key={`old-${index}`}
            className="border-l-2 border-type-bug pl-2 text-xs"
          >
            Removed: {line}
          </p>
        ))}
        {diff.added.map((line, index) => (
          <p
            key={`new-${index}`}
            className="border-l-2 border-brand-primary pl-2 text-xs"
          >
            Added: {line}
          </p>
        ))}
      </div>
      {before
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((passage, index) => (
          <div key={index} className="my-3 rounded border border-line p-3">
            <p className="whitespace-pre-wrap text-xs">{passage}</p>
            <button
              type="button"
              className={`${buttonClass} mt-2`}
              onClick={() => onAppend(passage)}
            >
              Append passage {index + 1} to draft
            </button>
          </div>
        ))}
    </details>
  );
}
