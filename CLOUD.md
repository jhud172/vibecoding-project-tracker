# Relay cloud setup and acceptance evidence

Authentication Site URL is saved as `https://relay-jhud172.vercel.app` in the project's URL Configuration. The dashboard confirmed successful persistence; confirmation and recovery links therefore have the production fallback destination instead of the initial localhost default. No unrelated auth security settings were changed.

Dedicated project: `rnxsqhcjfdrxdbopyktw` (Relay), region `eu-west-2`, organization Crystal Powers (`dqaqmuvrzrnkzesjjetu`). Created 20 October 2026 after the user chose a new dedicated project and explicitly selected the organization. Organization plan verified as Free; no paid plan or charge was accepted. Unrelated projects were not modified.

The browser uses a public publishable key only. No service-role or secret API key belongs in source, browser storage or a Vite environment variable. Database access requires a signed-in Supabase user and row-level permissions. Schema changes are saved in `supabase/migrations/` and applied to the dedicated project.

The private-schema role helper only answers for `auth.uid()`. It has a fixed empty search path and is outside the exposed public RPC schema. Project ownership is immutable through client updates. Editors can change project content using an expected version; viewers can only read. Owners grant/revoke viewer/editor membership by an existing collaborator's account ID. No email directory or unsolicited invitations are sent. Comments belong to a project; editors/owners can add them and authors/owners can remove them.

Observed database acceptance check: a transaction created four disposable user fixtures and one project, switched to the authenticated role and tested owner, viewer, editor and outsider claims. Outsiders saw no project or membership rows; viewers could read but not update or comment; editors could update and comment but not change ownership or delete a project; an update using an obsolete version changed no rows. Every fixture was rolled back. This checks database policy enforcement; it does not establish real email delivery or a full real-account browser session.

After hardening, the Supabase security advisor returned zero findings. The missing comment-author foreign-key index was added. The performance advisor retains informational unused-index notices because this is a new project with little traffic; indexes support membership and comment queries. [Supabase unused-index guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Sync is deliberately explicit in this iteration. Open Workspace settings → Accounts, cloud sync & collaboration. Sign in, refresh the project list, preview a remote copy, and load it into the current local project. Local edits require Save to cloud. Upload confirms that context, history and deleted-task recovery are included. Loading saves a prior local recovery version. A changed remote version rejects a save and keeps local work for comparison. Comments update when the preview is refreshed.

Acceptance still required: real account signup/email confirmation, password recovery delivery, two real device sessions, collaborator UI permission/revocation and concurrent save comparison. The default hosted email sender is limited; configure a production email provider if external-user delivery requires it. Do not disable confirmation to hide this gate. Ask the user before any paid email plan, Supabase upgrade or other charge.

The optional panel and Supabase SDK are loaded only when opened. Production app startup does not send task data to Supabase. A browser regression verifies on-demand loading and rejected-credential handling with an isolated mocked response; actual authentication is a separate gate above.
