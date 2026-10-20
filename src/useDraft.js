import { useEffect, useRef, useState } from "react";
import { draftPrefix, findDraft, writeDraft } from "./drafts.js";

export function useDraft(projectId, task, draft, dirty) {
  const [key] = useState(
    () => `${draftPrefix(projectId, task.id)}${crypto.randomUUID()}`,
  );
  const [recovery, setRecovery] = useState(() => {
    try {
      return findDraft(window.localStorage, projectId, task);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const restored = useRef(null);
  const current = useRef({ draft, dirty, recovery });
  current.current = { draft, dirty, recovery };
  const flush = () => {
    const value = current.current;
    if (!value.dirty) return true;
    try {
      setSavedAt(writeDraft(window.localStorage, key, task, value.draft));
      setError("");
      return true;
    } catch {
      setError(
        "The recovery draft could not be saved. Copy your text before leaving this editor.",
      );
      return false;
    }
  };
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(flush, 350);
    return () => clearTimeout(timer);
  }, [draft, dirty, recovery]);
  useEffect(() => {
    const leaving = (event) => {
      if (!flush()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const hiding = () => {
      if (document.hidden) flush();
    };
    window.addEventListener("beforeunload", leaving);
    document.addEventListener("visibilitychange", hiding);
    return () => {
      window.removeEventListener("beforeunload", leaving);
      document.removeEventListener("visibilitychange", hiding);
    };
  }, []);
  return {
    recovery,
    error,
    savedAt,
    flush,
    restore() {
      const value = recovery?.draft;
      restored.current = recovery?.key;
      setRecovery(null);
      return value;
    },
    dismiss() {
      setRecovery(null);
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
        if (restored.current) window.localStorage.removeItem(restored.current);
      } catch {
        /* The saved task is authoritative if draft cleanup is unavailable. */
      }
    },
  };
}
