import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Workflow } from "lucide-react";
import {
  AccessibilityPanel,
  AccessibilityProvider,
  AccessButton,
  ReadButton,
  ReadingDock,
} from "./Accessibility.jsx";
import {
  PRINCIPLES,
  DECISIONS,
  ICONS,
  SOURCES,
  GUIDE_TEXT,
} from "./designRationale";
import { buttonClass } from "./ui";
import { JustificationRegister } from "./JustificationRegister.jsx";
import { IDENTITY_NOTE, IMAGERY_NOTE } from "./designInventory.js";
import "./index.css";

function DesignGuide() {
  const [settings, setSettings] = useState(false);
  return (
    <>
      <a href="#workspace" className="skip-link">
        Skip to design explanation
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-9">
        <a href="/" className={`${buttonClass} text-brand-primary`}>
          <ArrowLeft aria-hidden="true" size={18} /> Back to Relay
        </a>
        <AccessButton onClick={() => setSettings(true)} />
      </header>
      <ReadingDock hidden={settings} />
      <main
        id="workspace"
        tabIndex={-1}
        className="mx-auto max-w-5xl space-y-10 px-5 py-10 sm:px-9"
      >
        <div>
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-primary">
            <Workflow aria-hidden="true" /> Relay / Design with a reason
          </p>
          <h1 className="max-w-3xl font-editorial text-4xl leading-tight sm:text-5xl">
            Every choice should help you continue.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-text-muted">
            Here is why Relay looks and behaves this way: the user need, the
            design response and its limits. Accessibility guidance informs the
            implementation. Aesthetic preferences and intended cognitive
            benefits remain design judgments until tested with people.
          </p>
          <div className="mt-5">
            <ReadButton text={GUIDE_TEXT} title="Design rationale" />
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">
              Whole-guide audio is limited to the first 12,000 characters.
              Each decision-register entry has its own complete reading control.
            </p>
          </div>
        </div>
        <nav
          aria-label="Design guide contents"
          className="flex flex-wrap gap-3 text-sm text-brand-primary"
        >
          {[
            ["principles", "Principles"],
            ["register", "Decision register"],
            ["decisions", "Interface decisions"],
            ["icons", "Logo & icons"],
            ["evidence", "Evidence & testing"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded border border-line px-3 py-2 underline"
            >
              {label}
            </a>
          ))}
        </nav>
        <JustificationRegister />
        <section id="principles" aria-labelledby="principles-title">
          <h2 id="principles-title" className="mb-4 font-editorial text-3xl">
            The principles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map(([title, body]) => (
              <article
                key={title}
                className="rounded-2xl border border-line bg-surface-card p-5"
              >
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section id="decisions" aria-labelledby="decisions-title">
          <h2 id="decisions-title" className="mb-4 font-editorial text-3xl">
            The interface, explained
          </h2>
          <div className="space-y-5">
            {DECISIONS.map((group) => (
              <section
                key={group.title}
                className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6"
              >
                <h3 className="mb-4 text-lg font-semibold">{group.title}</h3>
                <dl className="divide-y divide-line">
                  {group.items.map(([title, body]) => (
                    <div key={title} className="py-4 first:pt-0 last:pb-0">
                      <dt className="text-sm font-semibold text-brand-primary">
                        {title}
                      </dt>
                      <dd className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">
                        {body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </section>
        <section id="icons" aria-labelledby="icons-title">
          <h2 id="icons-title" className="font-editorial text-3xl">
            Logo, imagery & icons
          </h2>
          <div className="my-5 flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-surface-tint p-5">
            <img
              src="/relay.svg"
              width="64"
              height="64"
              alt="Relay logo: two square nodes joined by a bent connector."
            />
            <p className="max-w-2xl text-sm leading-relaxed">
              {IDENTITY_NOTE}
            </p>
          </div>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-text-muted">
            Relay uses Lucide outline icons for a consistent stroke and familiar
            vocabulary. Icons reinforce labels, not replace them. {IMAGERY_NOTE}
          </p>
          <dl className="space-y-4">
            {ICONS.map(([name, use, reason]) => (
              <div
                key={name}
                className="rounded-xl border border-line bg-surface-card p-4"
              >
                <dt className="text-sm font-semibold">
                  {name}
                  <span className="mt-1 block font-normal text-brand-primary">
                    {use}
                  </span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-text-muted">
                  {reason}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          id="evidence"
          aria-labelledby="evidence-title"
          className="rounded-2xl border border-line bg-surface-subtle p-5 sm:p-6"
        >
          <h2 id="evidence-title" className="mb-4 font-editorial text-3xl">
            Evidence & validation
          </h2>
          <p className="mb-4 text-sm leading-relaxed">
            WCAG guidance supports the colour, sizing, labels and keyboard
            decisions. It does not establish that green calms everyone, serif
            fonts improve understanding, or this interface improves
            productivity. No user study or blanket accessibility certification
            is claimed.
          </p>
          <ul className="space-y-4 text-sm">
            {SOURCES.map(([label, url, reason]) => (
              <li key={url}>
                <a
                  className="font-semibold text-brand-primary underline"
                  href={url}
                >
                  {label}
                </a>
                <p className="mt-1 leading-relaxed text-text-muted">{reason}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed">
            Verification covers automated palette-pair contrast and preference
            validation, speech queue lifecycle, rendered text scaling, theme
            changes and keyboard flows. Tests do not replace evaluation with
            NVDA, VoiceOver, braille, magnification, or people with different
            access needs. Browser/device speech engines can be unavailable. The
            repository’s accessibility report records the actual checks and
            remaining limits.
          </p>
        </section>
        <a href="/" className={`${buttonClass} text-brand-primary`}>
          <ArrowLeft size={18} aria-hidden="true" /> Return to your workspace
        </a>
      </main>
      {settings && (
        <AccessibilityPanel
          tasks={[]}
          briefing={GUIDE_TEXT}
          briefingLabel="Design rationale"
          onClose={() => setSettings(false)}
        />
      )}
    </>
  );
}
const designRoot = createRoot(document.getElementById("root"));
designRoot.render(
  <React.StrictMode>
    <AccessibilityProvider>
      <DesignGuide />
    </AccessibilityProvider>
  </React.StrictMode>,
);
if (import.meta.hot) import.meta.hot.dispose(() => designRoot.unmount());
