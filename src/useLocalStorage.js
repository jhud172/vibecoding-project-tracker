import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue, validate) {
  const [initial] = useState(() => {
    const fallback = () =>
      typeof initialValue === "function" ? initialValue() : initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return { value: fallback(), error: "" };
      const value = JSON.parse(raw);
      if (!validate(value)) throw new Error("Unexpected data");
      return { value, error: "" };
    } catch {
      return {
        value: fallback(),
        error: `Could not read ${key}. Existing saved data has been left untouched.`,
      };
    }
  });
  const [value, setValue] = useState(initial.value);
  const [error, setError] = useState(initial.error);
  const [blocked, setBlocked] = useState(!!initial.error);

  useEffect(() => {
    if (blocked) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setError("");
    } catch {
      setError(
        "Browser storage is unavailable or full. Changes are only held in memory; download a backup before leaving.",
      );
    }
  }, [key, value, blocked]);

  function replace(nextValue) {
    // Import/reset callers need the actual persistence result before claiming success.
    // Keep current preferences if a replacement cannot be stored.
    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {
      setError(
        "Browser storage is unavailable or full. Preferences were not replaced; keep a backup and retry with storage enabled.",
      );
      return false;
    }
    setBlocked(false);
    setError("");
    setValue(nextValue);
    return true;
  }
  return [value, setValue, error, replace];
}
