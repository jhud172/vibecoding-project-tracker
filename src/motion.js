import { flushSync } from "react-dom";
let transition;
export function turnWorkspacePage(update) {
  const reduced =
    document.documentElement.dataset.reduceMotion === "true" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced) {
    update();
    return;
  }
  transition?.skipTransition();
  transition = document.startViewTransition(() => flushSync(update));
  // A replaced/hidden transition may be skipped; that must never block navigation.
  transition.ready.catch(() => {});
}
