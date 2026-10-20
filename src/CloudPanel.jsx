import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./cloudConfig";
import { validProject } from "./workspace";
import { Field, Modal, buttonClass, fieldClass, primaryClass } from "./ui";

let client;
const cloudClient = () =>
  (client ||= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));
export default function CloudPanel({ workspace, onClose }) {
  const [api] = useState(cloudClient);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [remote, setRemote] = useState(null);
  const [comments, setComments] = useState([]);
  const [members, setMembers] = useState([]);
  const [comment, setComment] = useState("");
  const [member, setMember] = useState("");
  const [role, setRole] = useState("viewer");
  const project = workspace.project;
  useEffect(() => {
    let active = true;
    api.auth.getSession().then(({ data, error }) => {
      if (active) {
        setUser(data.session?.user || null);
        if (error) setFailure(error.message);
      }
    });
    const {
      data: { subscription },
    } = api.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setProjects([]);
      setRemote(null);
      setComments([]);
      setMembers([]);
      setSelected("");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [api]);
  const run = async (action) => {
    setBusy(true);
    setFailure("");
    setMessage("");
    try {
      await action();
    } catch (error) {
      setFailure(
        error.message || "The cloud request failed. Local work is kept.",
      );
    } finally {
      setBusy(false);
    }
  };
  const check = (result) => {
    if (result.error) throw result.error;
    return result.data;
  };
  const list = async () => {
    const data = check(
      await api
        .from("relay_projects")
        .select("id,name,owner_id,version,updated_at")
        .order("updated_at", { ascending: false })
        .limit(100),
    );
    setProjects(data);
    setMessage(`${data.length} accessible cloud projects loaded.`);
  };
  const load = async (id) => {
    const data = check(
      await api.from("relay_projects").select("*").eq("id", id).single(),
    );
    if (!validProject(data.payload))
      throw new Error(
        "The cloud project has an unsupported structure. Local work was kept.",
      );
    setRemote(data);
    setSelected(data.id);
    setComments(
      check(
        await api
          .from("relay_comments")
          .select("*")
          .eq("project_id", id)
          .order("created_at")
          .limit(100),
      ),
    );
    setMembers(
      data.owner_id === user.id
        ? check(
            await api.from("relay_members").select("*").eq("project_id", id),
          )
        : [],
    );
    setMessage(
      `Preview loaded: ${data.name}, version ${data.version}. Local work has not been changed.`,
    );
  };
  const localPayload = () => {
    const payload = structuredClone(project);
    delete payload.cloud;
    return payload;
  };
  const applyCloud = async () => {
    if (
      !remote ||
      !window.confirm(
        "Replace the current local project with this cloud preview? A local recovery version will be saved first.",
      )
    )
      return;
    const result = await workspace.updateProject(
      (p) => ({
        ...remote.payload,
        id: p.id,
        cloud: { id: remote.id, version: remote.version },
      }),
      "Before loading cloud project",
    );
    if (!result.ok) throw new Error(result.error);
    setMessage(
      "Cloud project loaded locally. Edits remain local until you choose Save to cloud.",
    );
  };
  const publish = async (fresh) => {
    if (workspace.readOnly)
      throw new Error("Recover local storage before connecting this work.");
    if (
      !window.confirm(
        "Upload this project’s tasks, context, links, history and deleted-task recovery to your authenticated cloud account? Review private details first.",
      )
    )
      return;
    const before = JSON.stringify(project),
      payload = localPayload();
    let saved;
    if (fresh) {
      saved = check(
        await api
          .from("relay_projects")
          .insert({ owner_id: user.id, name: project.name, payload })
          .select()
          .single(),
      );
    } else {
      const reference = project.cloud;
      if (!reference)
        throw new Error("Create a cloud copy or load a cloud preview first.");
      saved = check(
        await api
          .from("relay_projects")
          .update({
            name: project.name,
            payload,
            version: reference.version + 1,
          })
          .eq("id", reference.id)
          .eq("version", reference.version)
          .select()
          .maybeSingle(),
      );
      if (!saved)
        throw new Error(
          "Cloud save was rejected: the project changed, your permission changed, or it was removed. Refresh the cloud list and preview the latest version. Your local work is kept for comparison.",
        );
    }
    const result = await workspace.updateProject((p) => {
      if (JSON.stringify(p) !== before)
        throw new Error(
          "The cloud copy saved, but local work changed during upload. Load the cloud preview to compare before saving again.",
        );
      return { ...p, cloud: { id: saved.id, version: saved.version } };
    }, "Link saved cloud version");
    if (!result.ok) throw new Error(result.error);
    await list();
    await load(saved.id);
    setMessage(
      `Saved cloud version ${saved.version}. Other devices can now load this version.`,
    );
  };
  return (
    <Modal
      title="Your work, across devices."
      subtitle="Optional account sync and shared projects. Local work stays available when you are offline."
      onClose={onClose}
      wide
    >
      <div className="space-y-5 p-6">
        <p className="text-sm text-text-muted">
          Sync is explicit: preview cloud work before loading it, and save local
          edits when ready. A stale cloud version is rejected so collaborators
          can compare changes. This panel contacts Supabase only when opened;
          upload requires an account and your confirmation.
        </p>
        {failure && (
          <p
            role="alert"
            className="rounded-lg bg-due-overdue p-3 text-sm text-type-bug"
          >
            {failure}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-lg bg-surface-tint p-3 text-sm">
            {message}
          </p>
        )}
        {!user ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                check(await api.auth.signInWithPassword({ email, password }));
                setPassword("");
                setMessage(
                  "Signed in. Load your accessible project list to continue.",
                );
              });
            }}
          >
            <Field label="Account email">
              <input
                type="email"
                autoComplete="username"
                className={fieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Account password">
              <input
                type="password"
                minLength={8}
                autoComplete="current-password"
                className={fieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className={primaryClass}>
                Sign in
              </button>
              <button
                type="button"
                disabled={busy || !email.includes("@") || password.length < 8}
                className={buttonClass}
                onClick={() =>
                  run(async () => {
                    const data = check(
                      await api.auth.signUp({
                        email,
                        password,
                        options: { emailRedirectTo: window.location.origin },
                      }),
                    );
                    setPassword("");
                    setMessage(
                      data.session
                        ? "Account created and signed in."
                        : "Check your email to confirm this account, then sign in. Delivery depends on the configured email service; a missing confirmation is not a successful login.",
                    );
                  })
                }
              >
                Create account
              </button>
              <button
                type="button"
                disabled={busy || !email.includes("@")}
                className={buttonClass}
                onClick={() =>
                  run(async () => {
                    check(
                      await api.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin,
                      }),
                    );
                    setMessage(
                      "Password reset requested. Check your email; delivery is subject to the email service limits.",
                    );
                  })
                }
              >
                Email password reset
              </button>
            </div>
            <p className="text-xs text-text-muted">
              Passwords go directly to Supabase Auth. Account confirmation and
              password recovery require working email delivery.
            </p>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="break-all text-sm">
                Signed in as {user.email}
                <br />
                <span className="text-xs text-text-muted">
                  Your account ID: {user.id}
                </span>
              </p>
              <button
                className={buttonClass}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    check(await api.auth.signOut());
                    setMessage("Signed out. Local work is kept.");
                  })
                }
              >
                Sign out
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={buttonClass}
                disabled={busy}
                onClick={() => run(list)}
              >
                Refresh cloud projects
              </button>
              <button
                className={buttonClass}
                disabled={busy || workspace.readOnly}
                onClick={() => run(() => publish(true))}
              >
                Create a separate cloud copy
              </button>
              <button
                className={primaryClass}
                disabled={busy || workspace.readOnly || !project.cloud}
                onClick={() => run(() => publish(false))}
              >
                Save local changes to linked cloud project
              </button>
            </div>
            {project.cloud && (
              <p className="text-xs text-text-muted">
                Local link: {project.cloud.id} · version {project.cloud.version}
              </p>
            )}
            <Field label="Cloud project preview">
              <select
                className={fieldClass}
                value={selected}
                disabled={busy}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setRemote(null);
                }}
              >
                <option value="">Choose from your accessible projects</option>
                {projects.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name} · version {p.version}
                  </option>
                ))}
              </select>
            </Field>
            <button
              className={buttonClass}
              disabled={busy || !selected}
              onClick={() => run(() => load(selected))}
            >
              Preview selected cloud version
            </button>
            {remote && (
              <section className="space-y-4 rounded-xl border border-line p-4">
                <h3 className="font-semibold">
                  {remote.name} · cloud version {remote.version}
                </h3>
                <p className="text-sm text-text-muted">
                  {remote.payload.tasks.length} tasks ·{" "}
                  {remote.payload.anchors.filter((a) => a.url).length} linked
                  deliverables · saved{" "}
                  {new Date(remote.updated_at).toLocaleString("en-GB")}
                </p>
                <details>
                  <summary className="cursor-pointer text-sm">
                    Inspect task titles and next context
                  </summary>
                  {remote.payload.tasks.map((t) => (
                    <div key={t.id} className="my-3 border-t border-line pt-3">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="max-h-40 overflow-auto whitespace-pre-wrap text-xs">
                        {t.context || "No context"}
                      </p>
                    </div>
                  ))}
                </details>
                <button
                  className={buttonClass}
                  disabled={busy || workspace.readOnly}
                  onClick={() => run(applyCloud)}
                >
                  Load preview into current local project
                </button>
                <h4 className="border-t border-line pt-4 font-semibold">
                  Project comments
                </h4>
                <p className="text-xs text-text-muted">
                  Owners and editors can comment. Refresh the preview to see new
                  comments; the latest 100 are shown.
                </p>
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-surface-tint p-3">
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {c.body}
                    </p>
                    <p className="mt-1 break-all text-xs text-text-muted">
                      {c.author_id === user.id ? "You" : c.author_id} ·{" "}
                      {new Date(c.created_at).toLocaleString("en-GB")}
                    </p>
                    {(c.author_id === user.id ||
                      remote.owner_id === user.id) && (
                      <button
                        className={`${buttonClass} mt-2`}
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            check(
                              await api
                                .from("relay_comments")
                                .delete()
                                .eq("id", c.id),
                            );
                            await load(remote.id);
                          })
                        }
                      >
                        Remove comment
                        <span className="sr-only">
                          {" "}
                          from {new Date(c.created_at).toLocaleString("en-GB")}
                        </span>
                      </button>
                    )}
                  </div>
                ))}
                <Field label="New project comment">
                  <textarea
                    className={fieldClass}
                    rows={2}
                    maxLength={4000}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Field>
                <button
                  className={buttonClass}
                  disabled={busy || !comment.trim()}
                  onClick={() =>
                    run(async () => {
                      check(
                        await api
                          .from("relay_comments")
                          .insert({
                            project_id: remote.id,
                            author_id: user.id,
                            body: comment.trim(),
                          }),
                      );
                      setComment("");
                      await load(remote.id);
                    })
                  }
                >
                  Post comment
                </button>
                {remote.owner_id === user.id && (
                  <div className="space-y-3 border-t border-line pt-4">
                    <h4 className="font-semibold">Sharing and permissions</h4>
                    <p className="text-xs text-text-muted">
                      Only you can grant access. Ask a collaborator to create an
                      account and give you the account ID shown in this panel.
                      Viewers can read; editors can save project content and
                      comment. Sharing exposes this cloud project’s complete
                      payload.
                    </p>
                    {members.map((m) => (
                      <div
                        className="flex flex-wrap items-center gap-2"
                        key={m.user_id}
                      >
                        <p className="break-all text-xs">
                          {m.user_id} · {m.role}
                        </p>
                        <button
                          className={buttonClass}
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              check(
                                await api
                                  .from("relay_members")
                                  .delete()
                                  .eq("project_id", remote.id)
                                  .eq("user_id", m.user_id),
                              );
                              await load(remote.id);
                            })
                          }
                        >
                          Revoke access
                          <span className="sr-only"> for {m.user_id}</span>
                        </button>
                      </div>
                    ))}
                    <Field label="Collaborator account ID">
                      <input
                        className={fieldClass}
                        value={member}
                        onChange={(e) => setMember(e.target.value.trim())}
                      />
                    </Field>
                    <Field label="Collaborator permission">
                      <select
                        className={fieldClass}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="viewer">Viewer: read only</option>
                        <option value="editor">Editor: save and comment</option>
                      </select>
                    </Field>
                    <button
                      className={buttonClass}
                      disabled={busy || !/^[0-9a-f-]{36}$/i.test(member)}
                      onClick={() =>
                        run(async () => {
                          if (
                            !window.confirm(
                              `Grant ${role} access to account ${member} for this complete project?`,
                            )
                          )
                            return;
                          check(
                            await api
                              .from("relay_members")
                              .insert({
                                project_id: remote.id,
                                user_id: member,
                                role,
                              }),
                          );
                          setMember("");
                          await load(remote.id);
                        })
                      }
                    >
                      Grant project access
                    </button>
                  </div>
                )}
              </section>
            )}
            <details className="border-t border-line pt-4">
              <summary className="cursor-pointer text-sm">
                Change account password
              </summary>
              <Field label="New account password">
                <input
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  className={fieldClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <button
                className={`${buttonClass} mt-3`}
                disabled={busy || password.length < 8}
                onClick={() =>
                  run(async () => {
                    check(await api.auth.updateUser({ password }));
                    setPassword("");
                    setMessage("Account password updated.");
                  })
                }
              >
                Save new password
              </button>
            </details>
          </>
        )}
      </div>
    </Modal>
  );
}
