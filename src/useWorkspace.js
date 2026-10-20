import { useEffect, useState, useSyncExternalStore } from "react";
import { WORKSPACE_KEY, createWorkspaceStore } from "./workspace.js";

export function useWorkspace() {
  const [store] = useState(() =>
    createWorkspaceStore({
      // Access can itself throw in blocked-storage browser contexts.
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    }),
  );
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const lock = async (action) =>
    navigator.locks?.request
      ? navigator.locks.request(WORKSPACE_KEY, { mode: "exclusive" }, action)
      : action();
  useEffect(() => {
    lock(() => {
      try {
        store.initialize();
      } catch {
        /* The store exposes its error. */
      }
    });
    const external = (event) => {
      if (event.key === WORKSPACE_KEY || event.key === null)
        store.acceptExternal(event.newValue);
    };
    window.addEventListener("storage", external);
    return () => window.removeEventListener("storage", external);
  }, [store]);
  const perform = async (action) => {
    const revision = store.getSnapshot().state.revision;
    try {
      return { ok: true, changed: await lock(() => action(revision)) };
    } catch (failure) {
      return { ok: false, error: failure.message };
    }
  };
  const mutate = (recipe, label, history = true) =>
    perform((revision) => store.commit(recipe, label, revision, history));
  const updateProject = (recipe, label) =>
    mutate((data) => {
      data.projects = data.projects.map((p) =>
        p.id === data.activeProject ? recipe(p) : p,
      );
      return data;
    }, label);
  return {
    ...snapshot,
    store,
    mutate,
    updateProject,
    project: snapshot.state.data.projects.find(
      (p) => p.id === snapshot.state.data.activeProject,
    ),
    undo: () => perform((revision) => store.travel("undo", revision)),
    redo: () => perform((revision) => store.travel("redo", revision)),
    recover: (data) => perform(() => store.recover(data)),
  };
}
