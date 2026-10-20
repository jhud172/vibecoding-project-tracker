import { STAGES, TEAM, TOOLS } from "./model.js";

const PREFIX = "relay.draft:v1:";
export const draftPrefix = (projectId, taskId) => `${PREFIX}${encodeURIComponent(projectId)}:${encodeURIComponent(taskId || "new")}:`;
export function validDraft(record) {
  const d = record?.draft;
  return !!d && typeof record.at === "string" && Number.isFinite(Date.parse(record.at)) && typeof record.base === "string" &&
    typeof d.title === "string" && d.title.length <= 120 && typeof d.description === "string" && d.description.length <= 100_000 &&
    typeof d.context === "string" && d.context.length <= 100_000 && ["feature","bug"].includes(d.type) &&
    STAGES.some(s => s.id === d.status) && TEAM.includes(d.assignee) && (d.contextTool == null || TOOLS.includes(d.contextTool));
}
export function findDraft(storage, projectId, task) {
  const prefix = draftPrefix(projectId, task.id);
  const records = [];
  for (let i=0;i<storage.length;i++) {
    const key=storage.key(i);
    if (!key?.startsWith(prefix)) continue;
    try {
      const record=JSON.parse(storage.getItem(key));
      if (validDraft(record) && JSON.stringify(record.draft) !== JSON.stringify(task)) records.push({...record,key});
    } catch { /* A damaged draft never replaces a valid task. */ }
  }
  return records.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0] || null;
}
export function writeDraft(storage, key, task, draft, now = new Date().toISOString()) {
  const record = { base: JSON.stringify(task), at: now, draft: { ...draft, context: draft.context || "" } };
  if (!validDraft(record)) throw new Error("This draft cannot be saved for recovery. Keep a copy of your text before leaving.");
  storage.setItem(key, JSON.stringify(record));
  return now;
}
