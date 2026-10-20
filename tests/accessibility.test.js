import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ACCESS,
  BROWSER_VOICE,
  createNarrator,
  resolvePalette,
  selectReadingVoice,
  speechChunks,
  spokenTask,
  validAccess,
} from "../src/accessibility.js";

test("automatic narration never falls back to online speech without an explicit choice", () => {
  const remote = { voiceURI: "online", lang: "en-GB", default: true, localService: false };
  const local = { voiceURI: "device", lang: "en-GB", localService: true };
  const other = { voiceURI: "fr-device", lang: "fr-FR", default: true, localService: true };
  assert.equal(selectReadingVoice([remote, other, local], "", "en-GB"), local);
  assert.equal(selectReadingVoice([remote], "", "en-GB"), null);
  assert.equal(selectReadingVoice([], "", "en-GB"), null);
  assert.equal(selectReadingVoice([remote], "online"), remote);
  assert.equal(selectReadingVoice([remote], "removed-voice"), null);
  assert.equal(selectReadingVoice([], BROWSER_VOICE), undefined);
});

function luminance(hex) {
  const channels = hex
    .match(/[a-f\d]{2}/gi)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test("normal text pairings meet 4.5:1 across all light/dark palette and contrast combinations", () => {
  const pairs = [
    ...["ink", "muted", "brand"].flatMap((fg) =>
      ["page", "card", "subtle", "tint", "neutral", "safe", "warning-bg", "overdue"].map((bg) => [fg, bg]),
    ),
    ["brand", "accent"],
    ["feature", "safe"],
    ["bug", "overdue"],
    ["warning", "warning-bg"],
    ["action-ink", "action"],
    ["focus-ink", "focus-bg"],
    ["focus-muted", "focus-bg"],
    ["focus-bg", "focus-accent"],
  ];
  for (const isDark of [false, true])
    for (const palette of ["default", "red-green", "blue-yellow", "mono"])
      for (const high of [false, true]) {
        const p = resolvePalette(
          { ...DEFAULT_ACCESS, palette, contrast: high },
          isDark,
        );
        for (const [fg, bg] of pairs)
          assert.ok(
            contrast(p[fg], p[bg]) >= 4.5,
            `${palette}/${isDark}/${high} ${fg}/${bg}: ${contrast(p[fg], p[bg]).toFixed(2)}`,
          );
      }
});
test("focus and strong control boundaries maintain 3:1 against adjacent surfaces", () => {
  for (const isDark of [false, true])
    for (const palette of ["default", "red-green", "blue-yellow", "mono"]) {
      const p = resolvePalette({ ...DEFAULT_ACCESS, palette }, isDark);
      for (const bg of ["page", "card", "subtle", "tint"]) {
        assert.ok(contrast(p.brand, p[bg]) >= 3);
        assert.ok(contrast(p["strong-line"], p[bg]) >= 3);
      }
    }
});
test("preference validation rejects malformed, unbounded and incompatible stored settings", () => {
  assert.ok(validAccess(DEFAULT_ACCESS));
  assert.equal(DEFAULT_ACCESS.shortcuts, false);
  for (const bad of [
    null,
    {},
    { ...DEFAULT_ACCESS, textSize: 500 },
    { ...DEFAULT_ACCESS, palette: "simulate" },
    { ...DEFAULT_ACCESS, theme: "unknown" },
    { ...DEFAULT_ACCESS, rate: -1 },
    { ...DEFAULT_ACCESS, contrast: "true" },
  ])
    assert.equal(validAccess(bad), false);
});
test("speech chunking preserves readable content and bounds long engine requests", () => {
  const words = "A concrete next step. Verify the result. ".repeat(100);
  const chunks = speechChunks(words);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 240));
  assert.equal(chunks.join(" "), words.trim());
  assert.deepEqual(speechChunks("  "), []);
  assert.ok(
    speechChunks("a".repeat(1000)).every((chunk) => chunk.length <= 240),
  );
});
function fixture() {
  const state = {};
  const calls = [];
  let utterance;
  const synth = {
    cancel: () => calls.push("cancel"),
    pause: () => calls.push("pause"),
    resume: () => calls.push("resume"),
    speak: (value) => {
      utterance = value;
      calls.push("speak");
    },
  };
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  return {
    state,
    calls,
    get utterance() {
      return utterance;
    },
    reader: createNarrator(synth, Utterance, (patch) =>
      Object.assign(state, patch),
    ),
  };
}
test("speech state follows engine start, pause/resume and completion, with rate and voice", () => {
  const f = fixture();
  const voice = { lang: "en-AU" };
  f.reader.start("Hello Relay.", "Task", 0.75, voice);
  assert.equal(f.state.state, "starting");
  assert.equal(f.utterance.rate, 0.75);
  assert.equal(f.utterance.voice, voice);
  f.utterance.onstart();
  assert.equal(f.state.state, "speaking");
  f.reader.pause();
  assert.equal(f.state.state, "paused");
  f.reader.resume();
  assert.equal(f.state.state, "speaking");
  f.utterance.onend();
  assert.equal(f.state.state, "idle");
});
test("stale speech callbacks cannot restart or fail a replacement reading", () => {
  const f = fixture();
  f.reader.start("First. ".repeat(200), "Old", 1);
  const old = f.utterance;
  f.reader.start("New task.", "New", 1);
  const before = f.calls.length;
  old.onend();
  old.onerror();
  old.onstart();
  assert.equal(f.calls.length, before);
  assert.equal(f.state.title, "New");
  f.reader.stop();
  f.utterance.onend();
  assert.equal(f.calls.length, before + 1);
  assert.equal(f.state.state, "idle");
});
test("speech engine errors stop the queue and expose a recovery message", () => {
  const f = fixture();
  f.reader.start("Work. ".repeat(200), "Task", 1);
  f.utterance.onerror();
  assert.equal(f.state.state, "idle");
  assert.match(f.state.error, /another voice/);
  const before = f.calls.length;
  f.utterance.onend();
  assert.equal(f.calls.length, before);
});
test("reading limits are announced and task narration includes meaningful fields", () => {
  const f = fixture();
  f.reader.start("word ".repeat(4000), "Long", 1);
  const chunks = [];
  for (let i = 0; f.state.state !== "idle" && i < 1000; i++) {
    chunks.push(f.utterance.text);
    f.utterance.onend();
  }
  assert.match(chunks.at(-1), /twelve thousand/);
  assert.ok(chunks.length < 60);
  const task = spokenTask({
    title: "Ship",
    type: "feature",
    status: "in-progress",
    assignee: "James",
    description: "Test it",
    context: "Next: deploy",
    dueDate: null,
  });
  for (const text of [
    "Ship",
    "in progress",
    "James",
    "No date set",
    "Test it",
    "Next: deploy",
  ])
    assert.ok(task.includes(text));
});
