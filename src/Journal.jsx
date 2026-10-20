import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useAccess } from "./Accessibility.jsx";
import { buttonClass } from "./ui";

export function Journal({ focused, onOpen, onBoard }) {
  const { prefs, systemMotion } = useAccess();
  const reduced = prefs.reduceMotion || systemMotion;
  const host = useRef(null),
    engine = useRef(null);
  const state = useRef({
    open: focused ? 0.96 : 0.025,
    x: 0,
    y: 0,
    visible: false,
    paused: false,
  });
  const [status, setStatus] = useState("poster"),
    [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    state.current.open = focused ? 0.96 : hovered ? 0.36 : 0.025;
    state.current.paused = paused || reduced;
    if (paused || reduced) {
      state.current.x = 0;
      state.current.y = 0;
    }
    engine.current?.update();
  }, [focused, hovered, paused, reduced]);
  useEffect(() => {
    if (
      reduced ||
      navigator.connection?.saveData ||
      matchMedia("(forced-colors: active)").matches
    )
      return;
    let cancelled = false,
      started = false,
      localEngine;
    const element = host.current;
    const observer = new IntersectionObserver(
      async (entries) => {
        state.current.visible = entries[0].isIntersecting;
        if (!state.current.visible) {
          engine.current?.update();
          return;
        }
        if (started) {
          engine.current?.update();
          return;
        }
        started = true;
        setStatus("loading");
        try {
          // Let the first paint and local workspace initialisation finish first.
          await new Promise((resolve) => {
            if (window.requestIdleCallback)
              window.requestIdleCallback(resolve, { timeout: 800 });
            else setTimeout(resolve, 0);
          });
          if (cancelled) return;
          const { mountJournal } = await import("./journalScene.js");
          if (cancelled) return;
          localEngine = await mountJournal(
            element,
            () => state.current,
            () => {
              if (!cancelled) setStatus("ready");
            },
            () => {
              if (!cancelled) setStatus("fallback");
            },
          );
          if (cancelled) localEngine.dispose();
          else engine.current = localEngine;
        } catch {
          if (!cancelled) setStatus("fallback");
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      localEngine?.dispose();
      engine.current = null;
    };
  }, [reduced, retry]);
  const position = (event) => {
    if (paused || reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    state.current.x = Math.max(
      -1,
      Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
    );
    state.current.y = Math.max(
      -1,
      Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
    );
    engine.current?.update();
  };
  const reset = () => {
    setHovered(false);
    state.current.x = 0;
    state.current.y = 0;
    engine.current?.update();
  };
  return (
    <figure
      className="journal"
      data-journal-state={reduced ? "reduced" : status}
      onPointerMove={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={reset}
    >
      <div className="journal-orbit journal-orbit-outer" aria-hidden="true" />
      <div className="journal-orbit journal-orbit-inner" aria-hidden="true" />
      <span className="journal-edition" aria-hidden="true">
        R / 01
      </span>
      <div className="journal-shadow" aria-hidden="true" />
      <img
        src="/models/relay-journal-poster.webp"
        className={`journal-poster ${status === "ready" && !reduced ? "is-hidden" : ""}`}
        alt=""
        width="720"
        height="520"
        decoding="async"
      />
      <div
        ref={host}
        className={`journal-canvas ${status !== "ready" || reduced ? "is-hidden" : ""}`}
        aria-hidden="true"
      />
      <figcaption className="journal-caption">
        <span className="journal-caption-label">
          {focused
            ? "CHAPTER TWO / FIND YOUR FOCUS"
            : "CHAPTER ONE / KEEP THE CONTEXT"}
        </span>
        <button
          type="button"
          className="journal-action"
          onClick={focused ? onBoard : onOpen}
        >
          {focused ? "Back to the bigger picture" : "Open your focus chapter"}
          <ArrowUpRight size={17} />
        </button>
      </figcaption>
      {!reduced && status === "ready" && (
        <button
          type="button"
          className="journal-pause"
          aria-label={paused ? "Resume 3D motion" : "Pause 3D motion"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      )}
      {!reduced && status === "fallback" && (
        <button
          type="button"
          className={`${buttonClass} journal-retry`}
          onClick={() => setRetry(retry + 1)}
        >
          Retry 3D view
        </button>
      )}
    </figure>
  );
}
