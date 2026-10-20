import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Volume2 } from "lucide-react";
import {
  AccessButton,
  AccessibilityPanel,
  AccessibilityProvider,
  ReadingDock,
  useAccess,
} from "./Accessibility.jsx";
import { buttonClass } from "./ui";
import "./index.css";

function PresentationAccess() {
  const [settings, setSettings] = useState(false);
  const { read, supported, stop } = useAccess();
  useEffect(() => {
    window.addEventListener("relay:slide-change", stop);
    return () => window.removeEventListener("relay:slide-change", stop);
  }, [stop]);
  useEffect(() => {
    const controls = document.querySelector(".presentation-controls");
    const observer = new ResizeObserver(() =>
      document.documentElement.style.setProperty(
        "--pitch-nav-height",
        `${controls.offsetHeight}px`,
      ),
    );
    observer.observe(controls);
    return () => observer.disconnect();
  }, []);
  const slideText = () =>
    document.querySelector(".slide:not([hidden])")?.innerText ||
    "No slide selected.";
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 sm:px-9">
        <a href="#slides" className="skip-link">
          Skip to presentation
        </a>
        <a href="/design.html" className="text-sm text-brand-primary underline">
          Why this design?
        </a>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${buttonClass} !text-xs`}
            disabled={!supported}
            onClick={() => read(slideText(), "Current slide")}
          >
            <Volume2 size={17} aria-hidden="true" /> Read this slide
          </button>
          <AccessButton onClick={() => setSettings(true)} />
        </div>
      </div>
      <ReadingDock hidden={settings} />
      {settings && (
        <AccessibilityPanel
          tasks={[]}
          briefing={slideText()}
          briefingLabel="Current slide"
          onClose={() => setSettings(false)}
        />
      )}
    </>
  );
}
const presentationRoot = createRoot(
  document.getElementById("presentation-access"),
);
presentationRoot.render(
  <React.StrictMode>
    <AccessibilityProvider>
      <PresentationAccess />
    </AccessibilityProvider>
  </React.StrictMode>,
);
if (import.meta.hot) import.meta.hot.dispose(() => presentationRoot.unmount());
