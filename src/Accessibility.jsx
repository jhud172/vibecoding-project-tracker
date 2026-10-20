import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Accessibility,
  ArrowUpRight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";
import {
  DEFAULT_ACCESS,
  TEXT_SIZES,
  createNarrator,
  resolvePalette,
  spokenTask,
  validAccess,
} from "./accessibility";
import { useLocalStorage } from "./useLocalStorage";
import {
  DialogAudioContext,
  Field,
  Modal,
  buttonClass,
  fieldClass,
  primaryClass,
} from "./ui";

const AccessContext = createContext(null);
export const useAccess = () => useContext(AccessContext);

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs, storageError, replacePrefs] = useLocalStorage(
    "relay.accessibility:v1",
    DEFAULT_ACCESS,
    validAccess,
  );
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [systemMotion, setSystemMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [voices, setVoices] = useState([]);
  const [speech, setSpeech] = useState({ state: "idle", title: "", error: "" });
  const narrator = useRef(null);
  const supported =
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";
  const isDark =
    prefs.theme === "dark" || (prefs.theme === "system" && systemDark);
  useEffect(() => {
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onDark = () => setSystemDark(dark.matches);
    const onMotion = () => setSystemMotion(motion.matches);
    dark.addEventListener("change", onDark);
    motion.addEventListener("change", onMotion);
    return () => {
      dark.removeEventListener("change", onDark);
      motion.removeEventListener("change", onMotion);
    };
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDark ? "dark" : "light";
    root.dataset.palette = prefs.palette;
    root.dataset.contrast = String(prefs.contrast);
    root.dataset.reduceMotion = String(prefs.reduceMotion || systemMotion);
    root.dataset.plainFont = String(prefs.plainFont);
    root.dataset.underlineLinks = String(prefs.underlineLinks);
    root.dataset.largeText = String(prefs.textSize >= 150);
    root.style.fontSize = `${prefs.textSize}%`;
    root.style.colorScheme = isDark ? "dark" : "light";
    const palette = resolvePalette(prefs, isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", palette.page);
    for (const [key, hex] of Object.entries(palette)) {
      const rgb = hex
        .match(/[a-f\d]{2}/gi)
        .map((v) => parseInt(v, 16))
        .join(" ");
      root.style.setProperty(`--${key}`, rgb);
    }
  }, [prefs, isDark, systemMotion]);
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const refresh = () => setVoices(synth.getVoices());
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    narrator.current = createNarrator(
      synth,
      window.SpeechSynthesisUtterance,
      (patch) => setSpeech((current) => ({ ...current, ...patch })),
    );
    const onHide = () => {
      if (document.hidden) narrator.current?.stop();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      document.removeEventListener("visibilitychange", onHide);
      narrator.current?.stop();
    };
  }, [supported]);
  useEffect(() => {
    if (speech.state !== "starting") return;
    const timer = setTimeout(() => {
      narrator.current?.stop();
      setSpeech({
        state: "idle",
        title: "",
        error:
          "The voice did not start. Try another voice or your device’s screen reader.",
      });
    }, 12000);
    return () => clearTimeout(timer);
  }, [speech.state]);
  const update = (key, value) =>
    setPrefs((current) => ({ ...current, [key]: value }));
  const read = (text, title) =>
    narrator.current?.start(
      text,
      title,
      prefs.rate,
      voices.find((voice) => voice.voiceURI === prefs.voice),
    );
  return (
    <AccessContext.Provider
      value={{
        prefs,
        update,
        restore: (value) => (validAccess(value) ? replacePrefs(value) : false),
        isDark,
        systemMotion,
        storageError,
        voices,
        supported,
        speech,
        read,
        stop: () => narrator.current?.stop(),
        pause: () => narrator.current?.pause(),
        resume: () => narrator.current?.resume(),
        reset: () => {
          narrator.current?.stop();
          replacePrefs({ ...DEFAULT_ACCESS });
        },
      }}
    >
      <DialogAudioContext.Provider
        value={
          speech.state !== "idle" || speech.error ? (
            <>
              <Playback />
              {speech.error && (
                <p role="alert" className="text-sm text-type-bug">
                  {speech.error}
                </p>
              )}
            </>
          ) : null
        }
      >
        {children}
      </DialogAudioContext.Provider>
    </AccessContext.Provider>
  );
}

export function AccessButton({ onClick }) {
  return (
    <button
      type="button"
      className={`${buttonClass} !py-2 !text-xs`}
      onClick={onClick}
      aria-haspopup="dialog"
    >
      <Accessibility size={18} aria-hidden="true" /> Accessibility
    </button>
  );
}

export function ReadButton({ text, title, className = buttonClass }) {
  const { supported, read } = useAccess();
  return (
    <button
      type="button"
      className={className}
      onClick={() => read(text, title)}
      disabled={!supported}
      title={
        supported
          ? "Read aloud using your device’s voice"
          : "Read-aloud is unavailable in this browser"
      }
    >
      <Volume2 size={16} aria-hidden="true" /> Read aloud
    </button>
  );
}

function Playback() {
  const { speech, pause, resume, stop } = useAccess();
  if (speech.state === "idle") return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs" role="status">
        {speech.state === "starting"
          ? "Starting voice…"
          : speech.state === "paused"
            ? "Paused"
            : "Reading"}
        : {speech.title}
      </span>
      {speech.state !== "starting" && (
        <button
          type="button"
          className={`${buttonClass} !py-2 !text-xs`}
          onClick={speech.state === "paused" ? resume : pause}
        >
          {speech.state === "paused" ? (
            <Play size={15} aria-hidden="true" />
          ) : (
            <Pause size={15} aria-hidden="true" />
          )}
          {speech.state === "paused" ? "Resume reading" : "Pause reading"}
        </button>
      )}
      <button
        type="button"
        className={`${buttonClass} !py-2 !text-xs`}
        onClick={stop}
      >
        <Square size={15} aria-hidden="true" /> Stop reading
      </button>
    </div>
  );
}

export function ReadingDock({ hidden }) {
  const { speech } = useAccess();
  if (hidden || (speech.state === "idle" && !speech.error)) return null;
  return (
    <section
      aria-label="Read-aloud controls"
      className="reader-dock border-b border-line bg-surface-tint px-5 py-3"
    >
      <Playback />
      {speech.error && (
        <p role="alert" className="text-sm text-type-bug">
          {speech.error}
        </p>
      )}
    </section>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  const id = useId();
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-card p-4">
      <input
        type="checkbox"
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        className="mt-1 h-5 w-5 shrink-0 accent-brand-primary"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span id={`${id}-label`} className="block text-sm font-semibold">
          {label}
        </span>
        <span
          id={`${id}-hint`}
          className="mt-1 block text-xs leading-relaxed text-text-muted"
        >
          {hint}
        </span>
      </span>
    </label>
  );
}

export function AccessibilityPanel({
  tasks,
  briefing,
  onClose,
  briefingLabel = "Workspace briefing",
}) {
  const {
    prefs,
    update,
    isDark,
    systemMotion,
    supported,
    voices,
    storageError,
    reset,
    read,
  } = useAccess();
  const [reading, setReading] = useState("workspace");
  const selected = tasks.find((task) => task.id === reading);
  return (
    <Modal
      title="Make Relay comfortable."
      subtitle="Choose how you see, navigate and listen. Preferences stay in this browser."
      onClose={onClose}
      wide
    >
      <div className="space-y-7 p-6">
        {storageError && (
          <p
            role="alert"
            className="rounded-lg bg-due-overdue p-3 text-sm text-type-bug"
          >
            {storageError}
          </p>
        )}
        <section aria-labelledby="access-display">
          <h3 id="access-display" className="mb-3 text-base font-semibold">
            Display & reading
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Appearance"
              hint={`Currently ${isDark ? "dark" : "light"}. System follows your device preference.`}
            >
              <select
                className={fieldClass}
                value={prefs.theme}
                onChange={(e) => update("theme", e.target.value)}
              >
                <option value="system">Use device setting</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
            <Field
              label="Text size"
              hint="Scales text and spacing together. Browser zoom remains available."
            >
              <select
                className={fieldClass}
                value={prefs.textSize}
                onChange={(e) => update("textSize", Number(e.target.value))}
              >
                {TEXT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}%{size === 100 ? " · Standard" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Colour palette"
              hint="Alternative palettes for colour-vision differences. Labels and shapes always carry meaning; choose what works for you."
            >
              <select
                className={fieldClass}
                value={prefs.palette}
                onChange={(e) => update("palette", e.target.value)}
              >
                <option value="default">Original forest</option>
                <option value="red-green">
                  Blue & amber · red/green alternative
                </option>
                <option value="blue-yellow">
                  Teal & rose · blue/yellow alternative
                </option>
                <option value="mono">Monochrome</option>
              </select>
            </Field>
            <div
              className="rounded-xl border border-line bg-surface-subtle p-4"
              aria-label="Palette preview"
            >
              <p className="mb-3 text-xs font-medium">
                A preview with meaning beyond colour
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded border border-line bg-due-safe px-2 py-1 text-type-feature">
                  ✓ Feature
                </span>
                <span className="rounded border border-line bg-due-overdue px-2 py-1 text-type-bug">
                  ! Bug / overdue
                </span>
              </div>
              <p className="mt-3 text-xs text-text-muted">
                Higher contrast takes precedence over the chosen palette.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Higher contrast"
              hint="Uses strong neutral text and boundaries. Status labels remain visible."
              checked={prefs.contrast}
              onChange={(v) => update("contrast", v)}
            />
            <Toggle
              label="Plain heading font"
              hint="Uses the same familiar sans-serif font for headings and controls. Choose the style you find easier to read."
              checked={prefs.plainFont}
              onChange={(v) => update("plainFont", v)}
            />
            <Toggle
              label="Underline links"
              hint="Makes links recognisable without relying on colour."
              checked={prefs.underlineLinks}
              onChange={(v) => update("underlineLinks", v)}
            />
            <Toggle
              label="Reduce motion"
              hint={
                systemMotion
                  ? "Your device already requests reduced motion; Relay honours it."
                  : "Removes interface transitions and decorative motion."
              }
              checked={prefs.reduceMotion}
              onChange={(v) => update("reduceMotion", v)}
            />
          </div>
        </section>
        <section
          aria-labelledby="access-audio"
          className="border-t border-line pt-5"
        >
          <h3
            id="access-audio"
            className="flex items-center gap-2 text-base font-semibold"
          >
            <Headphones size={19} aria-hidden="true" /> Listen to your work
          </h3>
          <p className="mb-4 mt-2 text-sm leading-relaxed text-text-muted">
            Read a workspace briefing or a task’s description and saved context.
            Audio starts only when you press Read aloud. Device voices vary and
            some require a connection. Screen-reader navigation remains
            available independently.
          </p>
          {!supported ? (
            <p
              role="status"
              className="rounded-xl border border-line p-4 text-sm"
            >
              This browser does not provide read-aloud. Try your device’s screen
              reader or a browser with speech synthesis.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Read aloud content"
                  hint="Long text is limited to the first 12,000 characters per reading."
                >
                  <select
                    className={fieldClass}
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                  >
                    <option value="workspace">
                      {briefingLabel}
                      {tasks.length ? " · all unfinished tasks" : ""}
                    </option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Reading speed"
                  hint="Changes apply to the next reading."
                >
                  <select
                    className={fieldClass}
                    value={prefs.rate}
                    onChange={(e) => update("rate", Number(e.target.value))}
                  >
                    {[0.75, 1, 1.25, 1.5].map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}×{rate === 1 ? " · Normal" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <Field
                  label="Reading voice"
                  hint={
                    voices.length
                      ? "Device voices are labelled; online voices may use a network service."
                      : "No voice list is available yet. You can try the browser’s default voice."
                  }
                >
                  <select
                    className={fieldClass}
                    value={
                      voices.some((v) => v.voiceURI === prefs.voice)
                        ? prefs.voice
                        : ""
                    }
                    onChange={(e) => update("voice", e.target.value)}
                  >
                    <option value="">Browser default</option>
                    {voices.map((voice, i) => (
                      <option
                        value={voice.voiceURI}
                        key={`${voice.voiceURI}-${i}`}
                      >
                        {voice.name} · {voice.lang} ·{" "}
                        {voice.localService ? "device" : "online"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <button
                type="button"
                className={`${primaryClass} mt-4`}
                onClick={() =>
                  read(
                    selected ? spokenTask(selected) : briefing,
                    selected ? selected.title : briefingLabel,
                  )
                }
              >
                <Volume2 size={17} aria-hidden="true" /> Read aloud
              </button>
            </>
          )}
        </section>
        <section
          aria-labelledby="access-navigation"
          className="space-y-3 border-t border-line pt-5"
        >
          <h3 id="access-navigation" className="text-base font-semibold">
            Keyboard & navigation
          </h3>
          <p className="text-sm leading-relaxed text-text-muted">
            Tab / Shift+Tab move between controls. Enter / Space activate
            buttons. Escape closes dialogs and returns focus. Use the first
            “Skip to workspace” link to bypass the header. Every drag action has
            a stage menu alternative.
          </p>
          <Toggle
            label="Enable single-key shortcuts"
            hint="Off by default to avoid conflicts with speech input and assistive technology. Enables N (new task), F (Focus desk) and / (search). Ctrl/⌘ K always opens quick actions."
            checked={prefs.shortcuts}
            onChange={(v) => update("shortcuts", v)}
          />
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <a
            href="/design.html"
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} text-brand-primary`}
          >
            Why this design? <ArrowUpRight size={15} aria-hidden="true" />
            <span className="sr-only"> (opens a new tab)</span>
          </a>
          <button type="button" className={buttonClass} onClick={reset}>
            <RotateCcw size={15} aria-hidden="true" /> Reset accessibility
            preferences
          </button>
        </div>
        <p className="text-xs leading-relaxed text-text-muted">
          Reset restores your device’s appearance setting and standard text
          size. It keeps your tasks and deliverable links.
        </p>
      </div>
    </Modal>
  );
}
