import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ReadButton } from "./Accessibility.jsx";
import { Field, buttonClass, fieldClass } from "./ui.jsx";
import {
  ASSET_REASONS, ICON_REASONS, JUSTIFICATIONS, JUSTIFICATION_FIELDS,
  JUSTIFICATION_REFS, PAGE_REASONS,
} from "./designInventory.js";

const relatedIcons = id => ICON_REASONS.filter(group => group.reason === id).flatMap(group => group.names);
const searchText = new Map(JUSTIFICATIONS.map(entry => [entry.id,
  `${JSON.stringify(entry)} ${relatedIcons(entry.id).join(" ")}`.toLowerCase(),
]));

export function JustificationRegister() {
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const term = query.trim().toLowerCase();
  const matches = JUSTIFICATIONS.filter(entry =>
    searchText.get(entry.id).includes(term),
  );
  const showExplanation = (event, id) => {
    event.preventDefault();
    flushSync(() => setQuery(""));
    const target = document.getElementById(`why-${id}`);
    if (!target) return;
    target.open = true;
    target.querySelector("summary")?.focus();
    target.scrollIntoView({ block: "start", behavior: "instant" });
    history.replaceState(null, "", `#why-${id}`);
  };
  return (
    <section id="register" aria-labelledby="register-title" className="scroll-mt-5">
      <h2 id="register-title" className="font-editorial text-3xl">The decision register</h2>
      <p className="my-4 max-w-3xl text-sm leading-relaxed text-text-muted">
        Each entry names the need, implemented choice, intended benefit,
        basis, access implications, trade-offs and actual verification limits.
        Guidance supports a principle; it does not prove an exact colour,
        duration or spacing value is optimal. Expand an entry to read or listen
        to its complete explanation.
      </p>
      <div className="mb-5 rounded-xl border border-line bg-surface-tint p-4">
        <Field label="Find a justification" hint="Search a feature, asset, design choice or accessibility concern.">
          <input ref={input} className={fieldClass} type="search" value={query}
            onChange={event => setQuery(event.target.value)} placeholder="For example: ribbon, colour, privacy…" />
        </Field>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p role="status" className="text-sm">{matches.length} of {JUSTIFICATIONS.length} explanations</p>
          {query && <button type="button" className={buttonClass} onClick={() => {
            setQuery(""); input.current?.focus();
          }}>Clear explanation search</button>}
        </div>
      </div>
      {!matches.length && <p className="rounded-xl border border-dashed border-line p-5 text-sm">
        No explanations match. Try another term or clear the search to browse every entry.
      </p>}
      <div className="space-y-3">
        {matches.map(entry => (
          <details id={`why-${entry.id}`} key={entry.id} className="scroll-mt-5 rounded-xl border border-line bg-surface-card p-4 sm:p-5">
            <summary className="cursor-pointer text-sm font-semibold text-brand-primary">
              {entry.title}
              <span className="mt-1 block text-xs font-normal text-text-muted">{entry.area} · {entry.id}</span>
            </summary>
            <dl className="mt-5 space-y-4">
              {JUSTIFICATION_FIELDS.map(([key, label]) => (
                <div key={key}>
                  <dt className="text-sm font-semibold">{label}</dt>
                  <dd className="mt-1 break-words text-sm leading-relaxed text-text-muted">{entry[key]}</dd>
                </div>
              ))}
              <div>
                <dt className="text-sm font-semibold">Implementation references</dt>
                <dd className="mt-1 break-words font-mono text-xs leading-relaxed text-text-muted">{entry.implementation.join(" · ")}</dd>
              </div>
              {relatedIcons(entry.id).length > 0 && <div>
                <dt className="text-sm font-semibold">Related icon symbols</dt>
                <dd className="mt-1 break-words font-mono text-xs text-text-muted">{relatedIcons(entry.id).join(", ")}</dd>
              </div>}
              <div>
                <dt className="text-sm font-semibold">Supporting guidance</dt>
                <dd className="mt-2 flex flex-wrap gap-3 text-sm">
                  {entry.sources.map(key => <a key={key} href={JUSTIFICATION_REFS[key][1]} className="text-brand-primary underline">{JUSTIFICATION_REFS[key][0]}</a>)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <ReadButton title={entry.title} text={[entry.title, ...JUSTIFICATION_FIELDS.map(([key, label]) => `${label}. ${entry[key]}`)].join(". ")} />
              <a href={`#why-${entry.id}`} className="text-sm text-brand-primary underline">Link to this explanation</a>
            </div>
          </details>
        ))}
      </div>
      <details className="mt-6 rounded-xl border border-line bg-surface-card p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-semibold">Asset, icon and page inventory</summary>
        <p className="my-4 text-sm leading-relaxed text-text-muted">
          This inventory accounts for the shipped media, referenced Lucide
          symbols and three public pages. CSS decorations are explained in the
          hero, spacing, focus and motion entries. The source coverage check
          catches missing entries; it cannot judge the quality of their reasoning
          or replace visual and human evaluation.
        </p>
        <h3 className="mb-3 text-base font-semibold">Shipped image and model files</h3>
        <ul aria-label="Shipped assets" className="space-y-4 text-sm">
          {ASSET_REASONS.map(asset => <li key={asset.file}>
            <p className="break-words font-mono text-xs">{asset.file}</p>
            <p className="my-1 leading-relaxed text-text-muted">{asset.role}</p>
            <a className="text-brand-primary underline" href={`#why-${asset.reason}`} onClick={event => showExplanation(event, asset.reason)}>Reason: {asset.reason}</a>
          </li>)}
        </ul>
        <h3 className="mb-3 mt-6 text-base font-semibold">Every referenced Lucide symbol</h3>
        <ul className="space-y-4 text-sm">
          {ICON_REASONS.map(group => <li key={group.names[0]}>
            <p className="break-words font-mono text-xs">{group.names.join(", ")}</p>
            <p className="my-1 leading-relaxed text-text-muted">{group.why}</p>
            <a className="text-brand-primary underline" href={`#why-${group.reason}`} onClick={event => showExplanation(event, group.reason)}>Reason: {group.reason}</a>
          </li>)}
        </ul>
        <h3 className="mb-3 mt-6 text-base font-semibold">Public pages</h3>
        <ul className="space-y-3 text-sm">
          {PAGE_REASONS.map(page => <li key={page.file}>
            <p className="break-words font-mono text-xs">{page.file} · {page.entry}</p>
            <p className="my-1 leading-relaxed text-text-muted">{page.role}</p>
            <a className="text-brand-primary underline" href={`#why-${page.reason}`} onClick={event => showExplanation(event, page.reason)}>Reason: {page.reason}</a>
          </li>)}
        </ul>
      </details>
    </section>
  );
}
