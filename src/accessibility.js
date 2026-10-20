export const DEFAULT_ACCESS = {
  theme: "system",
  textSize: 100,
  palette: "default",
  contrast: false,
  reduceMotion: false,
  plainFont: false,
  underlineLinks: false,
  shortcuts: false,
  rate: 1,
  voice: "",
};
export const TEXT_SIZES = [100, 125, 150, 175, 200];
export const BROWSER_VOICE = "relay:browser-default";
// null means that automatic local selection is unavailable; undefined is an
// explicitly selected browser default, which may be an online service.
export function selectReadingVoice(voices, selection = "", language = "en") {
  if (selection === BROWSER_VOICE) return undefined;
  const explicit = voices.find((voice) => voice.voiceURI === selection);
  if (explicit) return explicit;
  const local = voices.filter((voice) => voice.localService === true);
  const sameLanguage = (voice) => voice.lang?.split("-")[0] === language.split("-")[0];
  return local.find(voice => sameLanguage(voice) && voice.default)
    || local.find(sameLanguage) || local.find(voice => voice.default) || local[0] || null;
}
export function validAccess(value) {
  return (
    !!value &&
    ["system", "light", "dark"].includes(value.theme) &&
    TEXT_SIZES.includes(value.textSize) &&
    ["default", "red-green", "blue-yellow", "mono"].includes(value.palette) &&
    [
      "contrast",
      "reduceMotion",
      "plainFont",
      "underlineLinks",
      "shortcuts",
    ].every((key) => typeof value[key] === "boolean") &&
    [0.75, 1, 1.25, 1.5].includes(value.rate) &&
    typeof value.voice === "string" &&
    value.voice.length < 500
  );
}

const light = {
  page: "#F6F5F0",
  card: "#FFFFFF",
  subtle: "#EBEDE5",
  tint: "#EAF0E2",
  ink: "#252B27",
  muted: "#536056",
  line: "#B0BAAD",
  "strong-line": "#71836C",
  brand: "#264F3D",
  accent: "#DCE8C7",
  action: "#264F3D",
  "action-ink": "#FFFFFF",
  feature: "#365B3B",
  bug: "#983A2C",
  warning: "#76500C",
  safe: "#E8EFE5",
  "warning-bg": "#FBEDCB",
  overdue: "#FBE5DF",
  neutral: "#EDF0EC",
  "focus-bg": "#203E31",
  "focus-ink": "#F4F4E8",
  "focus-muted": "#D5DFD2",
  "focus-accent": "#DCE8C7",
};
const dark = {
  page: "#151D19",
  card: "#202C25",
  subtle: "#29352D",
  tint: "#2A3C2D",
  ink: "#F0F2E9",
  muted: "#C2CCBF",
  line: "#788875",
  "strong-line": "#A4BA9A",
  brand: "#B8DDBB",
  accent: "#314A35",
  action: "#B8DDBB",
  "action-ink": "#14271A",
  feature: "#BEDDB5",
  bug: "#FFC0AC",
  warning: "#FFE1A0",
  safe: "#2C3D2C",
  "warning-bg": "#49391C",
  overdue: "#492B25",
  neutral: "#29352D",
  "focus-bg": "#203E31",
  "focus-ink": "#F4F4E8",
  "focus-muted": "#D5DFD2",
  "focus-accent": "#DCE8C7",
};

// Alternate encodings are user choices, never simulations or a claim to correct vision.
export function resolvePalette(settings, isDark = false) {
  const p = { ...(isDark ? dark : light) };
  if (settings.palette === "red-green")
    Object.assign(
      p,
      isDark
        ? {
            brand: "#BBDFFF",
            accent: "#213D56",
            action: "#BBDFFF",
            "action-ink": "#10283B",
            feature: "#BBDFFF",
            bug: "#FFE1A0",
            safe: "#20394B",
            overdue: "#49391C",
            tint: "#243749",
          }
        : {
            brand: "#174C77",
            accent: "#DCEBFA",
            action: "#174C77",
            "action-ink": "#FFFFFF",
            feature: "#174C77",
            bug: "#785000",
            safe: "#E4EFF9",
            overdue: "#FFF0CA",
            tint: "#E5EEF5",
          },
    );
  if (settings.palette === "blue-yellow")
    Object.assign(
      p,
      isDark
        ? {
            brand: "#AEE8D6",
            accent: "#23443B",
            action: "#AEE8D6",
            "action-ink": "#102C23",
            feature: "#AEE8D6",
            bug: "#FFD0DB",
            warning: "#FFD0DB",
            safe: "#203C33",
            overdue: "#4B2936",
            "warning-bg": "#4B2936",
            tint: "#243C34",
          }
        : {
            brand: "#135747",
            accent: "#D9EEE7",
            action: "#135747",
            "action-ink": "#FFFFFF",
            feature: "#135747",
            bug: "#8A284B",
            warning: "#8A284B",
            safe: "#E0F0EA",
            overdue: "#FBE4EC",
            "warning-bg": "#FBE4EC",
            tint: "#E0EEE8",
          },
    );
  if (settings.palette !== "default" && settings.palette !== "mono")
    Object.assign(p, {
      "focus-bg": settings.palette === "red-green" ? "#173B56" : "#163F35",
      "focus-ink": "#FFFFFF",
      "focus-muted": "#DEE8E6",
      "focus-accent": "#EDF1E9",
    });
  if (settings.palette === "mono" || settings.contrast) {
    const fg = isDark ? "#FFFFFF" : "#151515";
    const bg = isDark ? "#121212" : "#FFFFFF";
    Object.assign(p, {
      page: bg,
      card: bg,
      subtle: isDark ? "#282828" : "#EEEEEE",
      tint: isDark ? "#282828" : "#EEEEEE",
      ink: fg,
      muted: fg,
      line: fg,
      "strong-line": fg,
      brand: fg,
      accent: isDark ? "#333333" : "#E2E2E2",
      action: fg,
      "action-ink": bg,
      feature: fg,
      bug: fg,
      warning: fg,
      safe: bg,
      "warning-bg": bg,
      overdue: bg,
      neutral: bg,
      "focus-bg": isDark ? "#121212" : "#151515",
      "focus-ink": "#FFFFFF",
      "focus-muted": "#FFFFFF",
      "focus-accent": "#EEEEEE",
    });
  }
  return p;
}

export function speechChunks(text, limit = 240) {
  const clean = String(text)
    .replace(/[#*_`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return [];
  const words = clean.split(" ");
  const chunks = [];
  let current = "";
  for (const word of words) {
    if (current && current.length + word.length + 1 > limit) {
      chunks.push(current);
      current = "";
    }
    // Even pathological unbroken text is bounded for speech engines.
    for (let i = 0; i < word.length; i += limit) {
      const part = word.slice(i, i + limit);
      if (current && current.length + part.length + 1 > limit) {
        chunks.push(current);
        current = "";
      }
      current += `${current ? " " : ""}${part}`;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function spokenTask(task) {
  return [
    task.title || "Untitled task",
    `Type: ${task.type}. Stage: ${task.status.replaceAll("-", " ")}. Owner: ${task.assignee}.`,
    `Due: ${task.dueDate || "No date set"}.`,
    task.description || "No description.",
    `Saved context: ${task.context || "No saved context."}`,
  ].join("\n");
}

// Isolated controller makes lifecycle, cancellation and queue behaviour testable.
export function createNarrator(synth, Utterance, onState) {
  let session = 0;
  let current = null;
  const stop = () => {
    session++;
    synth.cancel();
    current = null;
    onState({ state: "idle", title: "", error: "" });
  };
  return {
    stop,
    pause() {
      synth.pause();
      onState({ state: "paused" });
    },
    resume() {
      synth.resume();
      onState({ state: "speaking" });
    },
    start(text, title, rate, voice) {
      stop();
      const queue = speechChunks(text.slice(0, 12000));
      if (!queue.length) return;
      if (text.length > 12000)
        queue.push(
          "End of the first twelve thousand characters. Read the remaining text in the task editor.",
        );
      const token = session;
      onState({ state: "starting", title, error: "" });
      const next = () => {
        if (token !== session) return;
        const chunk = queue.shift();
        if (!chunk) {
          current = null;
          onState({ state: "idle", title: "", error: "" });
          return;
        }
        current = new Utterance(chunk);
        current.rate = rate;
        current.lang = voice?.lang || "en-GB";
        if (voice) current.voice = voice;
        current.onstart = () => {
          if (token === session) onState({ state: "speaking" });
        };
        current.onend = next;
        current.onerror = () => {
          if (token !== session) return;
          session++;
          synth.cancel();
          current = null;
          onState({
            state: "idle",
            title: "",
            error:
              "Read-aloud could not play. Try another voice or your device’s screen reader.",
          });
        };
        synth.speak(current);
      };
      next();
    },
  };
}
