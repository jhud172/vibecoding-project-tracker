export const PRINCIPLES = [
  [
    "Recognition before recall",
    "Keep the owner, stage, deadline and next action visible so people can inspect the work instead of remembering hidden state. This is a design intention, not a measured memory improvement.",
  ],
  [
    "One clear place to continue",
    "Focus desk presents one suggested task, a reason and an editable queue. The stronger surface establishes visual hierarchy while preserving the user’s choice.",
  ],
  [
    "More than one way to perceive and act",
    "Use text with colour, labels with icons, stage menus with drag grips, and keyboard controls with pointer controls. A palette picker alone cannot make an inaccessible interface accessible.",
  ],
  [
    "Control and a way back",
    "No automatic speech. Themes and reading preferences are reversible. Undo, context history and import previews make consequential changes inspectable.",
  ],
];
export const DECISIONS = [
  {
    title: "Recovery and inspectable handoffs",
    items: [
      ["Complete backup and conflict review", "Export names what it includes and makes accessibility preferences optional. Import separates current and incoming text, defaults to keeping current content and labels the scope of replacement. A prior workspace version provides a recovery route after an import."],
      ["Optional cloud controls and explicit sync", "Account, sharing and comments load in a separate panel so everyday local work is not gated by sign-in. Cloud preview precedes loading, and upload names the data it sends. Visible versions and stale-save rejection make conflicts inspectable. Account IDs enable deliberate sharing without searching or exposing an email directory."],
      ["Recoverable error screen", "A render failure presents a raw-download and reload action, preserving saved work. The message describes what happened without displaying implementation stack traces or inventing a successful recovery."],
      [
        "Explicit first-use choice",
        "An empty workspace is offered alongside labelled samples. The choice establishes what is the user’s work and what is an example; a short introduction explains the task-context-handoff sequence.",
      ],
      [
        "Recovery beside save status",
        "A labelled header control keeps recovery discoverable. Deleted tasks and persistent undo/redo reduce the cost of accidental edits. Storage estimates and last backup-request dates describe observed browser state without promising that a download completed.",
      ],
      [
        "Draft status and deliberate recovery",
        "A saved-time message acknowledges unfinished input. Recovered drafts are offered explicitly and never silently replace the editor. Stale-task checks preserve the draft when another tab has saved newer work.",
      ],
      [
        "Section editor alongside free text",
        "Named decisions, progress, next-step, verification and risk fields provide recognition cues. Editing a section preserves unknown headings and existing prose. The full context remains visible so the structure is optional and inspectable.",
      ],
      [
        "Preview before sharing",
        "Markdown and handoff previews let people check the actual text before copying. Concise export foregrounds ownership, next action and verification; detailed export retains the complete task. Missing sections are stated explicitly rather than invented.",
      ],
      [
        "Versions and passage recovery",
        "Text labels identify added and removed lines, with coloured edges as a secondary cue. A paragraph can be appended to the draft without replacing unrelated context. The comparison states that it checks line presence rather than promising a full edit diff.",
      ],
      [
        "Templates and session wrap-up",
        "Templates sit in an optional disclosure to keep the everyday editor manageable. A wrap-up view prompts progress, next action, verification and risks before the session is saved. Presence checks describe measurable text or populated sections, never quality or correctness.",
      ],
    ],
  },
  {
    title: "Layout, navigation & visual hierarchy",
    items: [
      [
        "Warm page, distinct cards and fine boundaries",
        "The page, content cards and grouped areas use separate surface tokens. Borders separate information without large shadows. Warm paper is a brand preference; no claim that it reduces clinical eye strain is made.",
      ],
      [
        "Whitespace and alignment",
        "Repeated spacing groups a title with its description and separates unrelated controls. Left alignment creates a predictable reading start. Space is functional grouping, rather than decoration that displaces the work.",
      ],
      [
        "Sidebar on wide screens; wrapping header on small screens",
        "Stable navigation stays visible where there is room. On narrow screens or enlarged text it gives way to the header and labelled view buttons so navigation does not compete with task content.",
      ],
      [
        "Breadcrumb and browser-save status",
        "The workspace name establishes location. The save label explains that data is local, rather than implying account sync. A storage failure changes the wording and presents a warning.",
      ],
      [
        "Four actionable counts",
        "Completion, overdue work, handoff essentials and linked deliverables answer specific workspace questions. Each opens a relevant view. They are counts of saved data, not invented scores or productivity claims.",
      ],
      [
        "One primary action style",
        "A filled button distinguishes the main action from bordered secondary actions. The wording names its outcome. The same hierarchy is preserved in dark and alternate palettes.",
      ],
      [
        "Focus desk and its faint ring",
        "A deep surface isolates the chosen task from the queue. The faint static ring echoes a target and gives depth; it carries no data, is hidden from assistive technology and can disappear in forced-colour modes without losing meaning.",
      ],
      [
        "Explained priority and selectable queue",
        "Deadlines order unfinished tasks; active work breaks ties. Visible explanations let people check the recommendation and select another task. The system does not claim AI judgment or know a task’s real business value.",
      ],
      [
        "Separate deliverable group",
        "Four labelled slots make Presentation, Demo, Report and Documentation discoverable. Open and edit are separate actions so inspecting a submission does not accidentally change its link.",
      ],
      [
        "Board and list",
        "Columns show workflow stage spatially. The ordered list helps sequential reading and narrow screens. At 150% text size and above, the list is used automatically so enlarged content does not require a wide board.",
      ],
      [
        "Eight-slide presentation",
        "One main argument per slide separates the problem, workflow, briefing, focus, recovery, accessibility and scope. Explicit Back/Next controls supplement arrow-key navigation. Read-this-slide and the same appearance preferences make the pitch adaptable; a design-guide link supplies the detailed rationale.",
      ],
    ],
  },
  {
    title: "Typography, colour & readable content",
    items: [
      [
        "Georgia headings",
        "A system serif gives the product an editorial identity and separates headings from controls without another font download. This is an aesthetic choice; the plain-heading option lets users remove it.",
      ],
      [
        "System sans-serif controls",
        "Familiar device fonts keep controls consistent with the operating system and avoid a font-loading delay. Relative sizes scale with user preferences and browser zoom.",
      ],
      [
        "Monospace metadata and prompt preview",
        "A different type style separates counts and structured text from prose. It is limited to supporting content. Small labels have been raised to at least 0.75rem instead of 10–11 fixed pixels.",
      ],
      [
        "Heading size, weight and line length",
        "A single page heading, section headings and task titles provide an outline for scanning and screen-reader navigation. Paragraphs use comfortable line spacing; long task titles wrap instead of covering actions.",
      ],
      [
        "Forest green and pale accent",
        "Green is Relay’s identity colour, used for active navigation and useful actions. It is not justified as a universal calming or motivational stimulus. Foreground/background contrast is checked as a pair, rather than judging a colour alone.",
      ],
      [
        "Task type and deadline colours",
        "A feature has a Feature label and a bug has a Bug label. Deadlines say overdue, due today or completed. The tint is an additional cue, so colour-vision differences do not remove the underlying information.",
      ],
      [
        "Done overrides urgency",
        "A completed task is labelled Completed even if its old deadline passed. This avoids a conflicting warning on work that no longer needs action.",
      ],
      [
        "Light, dark and device appearance",
        "People choose the luminance they prefer. Device mode follows the operating system. Dark mode changes real semantic foregrounds, surfaces and native controls, rather than applying an inversion filter to the page.",
      ],
      [
        "Colour-vision alternatives",
        "Blue/amber reduces reliance on red/green separation; teal/rose provides another option for blue/yellow differences; monochrome removes hue distinctions. These are selectable alternatives, not medical corrections, simulations or guarantees for every person.",
      ],
      [
        "Higher contrast and underlined links",
        "Higher contrast replaces subtle accents with strong neutral boundaries and text. Optional underlining gives links a shape cue. Browser forced colours remain supported.",
      ],
    ],
  },
  {
    title: "Interaction, access & feedback",
    items: [
      [
        "Visible Accessibility button",
        "A text label and human figure icon make preferences available in the header at every width, with a second entry in the footer and command menu. Finding accessibility does not require recognising an unlabeled icon.",
      ],
      [
        "100–200% text sizing",
        "Relative text and spacing scale together. Above 150%, grids stack, the sidebar hides and the list replaces the board. The settings dialog remains scrollable so the user can always reduce the size again.",
      ],
      [
        "Text-to-speech with explicit playback",
        "Read a task’s title, owner, stage, due date, description and saved context, or the whole workspace briefing. Voice, speed, pause, resume and stop are available. Nothing starts automatically. Long readings are bounded and clearly announced. Device/browser voices and output are external dependencies.",
      ],
      [
        "Screen-reader structure",
        "The app has a skip link, main landmark, named sections, real headings, labelled inputs, native buttons and polite status feedback. Read-aloud is a supplement: it does not replace a screen reader’s navigation, braille or form interaction.",
      ],
      [
        "Focus and keyboard",
        "Visible focus outlines show location. Native dialogs contain keyboard focus, accept Escape and return focus to the opener. Single-character shortcuts are off by default and can be enabled; Ctrl/Command K remains available.",
      ],
      [
        "Pointer targets and movement alternatives",
        "Buttons and form controls have a minimum 2.75rem target (44px at standard size). Dragging uses a grip and destination highlight, but every stage change also has a labelled select menu.",
      ],
      [
        "Motion preferences",
        "Transitions communicate hover or state change. Reduced motion from either the operating system or the panel removes these transitions. There is no blinking or automatically scrolling content.",
      ],
      [
        "Forms, errors and context templates",
        "Visible labels remain after typing; hints are associated with fields. Validation names the problem. Context templates append rather than overwrite, and the checklist distinguishes present from missing using symbols and accessible text.",
      ],
      [
        "Undo and context history",
        "A persistent Undo action supports recovery after a change. Earlier context is loaded into a draft for review before saving. Limits are stated: one-step undo ends at the next change/reload, and history is bounded.",
      ],
      [
        "Toasts, copy fallback and import preview",
        "A polite message confirms an action. The stable header keeps Undo available after a toast disappears. Clipboard failure offers selectable text. Backup import validates and previews data before a merge or confirmed replacement.",
      ],
      [
        "Owner initials and demo labels",
        "Initials make owners easier to locate beside their full names. They are not photographs, identity verification or real collaborator presence. Demo Designer and Demo Reviewer are explicitly fictional.",
      ],
    ],
  },
];

export const ICONS = [
  [
    "Workflow / connected squares",
    "Logo, local workspace identity and handoff",
    "Two connected nodes represent work continuing between stages. The favicon uses the same shape at small sizes. The adjacent Relay name or link label supplies the meaning.",
  ],
  [
    "Layout grid / list",
    "Board and list selectors",
    "The shapes suggest spatial or sequential layouts; accessible names and selected states remove the need to interpret the shapes alone.",
  ],
  [
    "Target",
    "Focus desk",
    "Suggests a chosen priority. The accompanying text says Focus desk; it does not imply measured concentration.",
  ],
  [
    "Folder, flag, presentation screen, code, file and book",
    "Deliverables and their four types",
    "Familiar document metaphors help distinguish destinations. Presentation, Demo, Report and Documentation remain fully written.",
  ],
  [
    "Plus",
    "Create task / append template",
    "A conventional addition cue paired with text or a specific accessible name. It does not hide a destructive action.",
  ],
  [
    "Bug / check marks / circle",
    "Task type, completed work and checklist state",
    "Shape reinforces a written state. Missing/present checklist states also have screen-reader text.",
  ],
  [
    "Clock",
    "Deadlines and overdue count",
    "Signals time next to a date or explicit urgency label, independent of tint.",
  ],
  [
    "Clipboard",
    "Copy briefing",
    "Represents copying structured task context. A success message or manual-copy fallback confirms the result.",
  ],
  [
    "Sparkles",
    "Curated context and resume briefing",
    "Draws attention to the distinctive briefing feature. Text explains its operation; it is not a claim that an AI model is running.",
  ],
  [
    "Magnifier / command symbol",
    "Search and quick actions",
    "Suggests finding and keyboard access. Labels and the shortcut are provided.",
  ],
  [
    "History / curved return arrow",
    "Activity and undo",
    "Separate past-event review from reversing the most recent change, with different written labels.",
  ],
  [
    "Link / outward arrow",
    "Deliverable links and external destinations",
    "Indicates a URL or opening a destination. External guide links explicitly announce a new tab.",
  ],
  [
    "Arrow right",
    "Continue, save, next workflow action",
    "Supports the action’s direction. The verb still specifies exactly what will happen.",
  ],
  [
    "Grip dots / ellipsis",
    "Dragging and task edit",
    "Grip dots make a drag handle discoverable; the edit control has a task-specific accessible name. Stage menus and task-title buttons remain alternatives.",
  ],
  [
    "Sliders / human accessibility figure",
    "Workspace settings / access preferences",
    "Different icons separate data settings from reading preferences, each with an explicit label.",
  ],
  [
    "Speaker / headphones / play / pause / square",
    "Read aloud and playback",
    "Standard audio metaphors accompany written controls and status. Speech is opt-in and can be stopped.",
  ],
  [
    "Download / upload",
    "Backup export / import",
    "Indicates direction of data movement. Labels and preview clarify the contents and effect.",
  ],
  [
    "Trash / cross",
    "Delete task / close or dismiss",
    "Trash is tied to a deletion confirmation; cross closes the named dialog or notification. They are never the sole programmatic name.",
  ],
];

export const SOURCES = [
  [
    "Nielsen Norman Group: usability heuristics",
    "https://www.nngroup.com/articles/ten-usability-heuristics/",
    "Recognition, visible status, consistency, user control and recovery inform the interface. These are general heuristics, not evidence that Relay has already improved outcomes.",
  ],
  [
    "W3C: resize text",
    "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
    "Text enlargement up to 200% without losing content or functionality.",
  ],
  [
    "W3C: use of colour",
    "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
    "Meaning must not depend only on colour.",
  ],
  [
    "WCAG 2.2: contrast minimum",
    "https://www.w3.org/TR/WCAG22/#contrast-minimum",
    "Text contrast targets: 4.5:1 for normal text and 3:1 for large text.",
  ],
  [
    "W3C: character key shortcuts",
    "https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html",
    "Allow character shortcuts to be turned off, remapped or limited to focus.",
  ],
  [
    "W3C: target size",
    "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
    "WCAG 2.2 minimum target guidance; Relay aims above the 24 CSS-pixel minimum for buttons.",
  ],
  [
    "W3C: image alternatives",
    "https://www.w3.org/WAI/tutorials/images/",
    "Describe informative images; keep purely decorative imagery out of the accessibility tree.",
  ],
  [
    "MDN: speech synthesis",
    "https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis",
    "Browser speech controls, voice availability and playback events.",
  ],
];

export const GUIDE_TEXT = [
  "Relay: why this design?",
  ...PRINCIPLES.flat(),
  ...DECISIONS.flatMap((group) => [group.title, ...group.items.flat()]),
  "Logo, images and icons",
  ...ICONS.flat(),
].join(". ");
