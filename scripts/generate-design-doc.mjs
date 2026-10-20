import { writeFile } from "node:fs/promises";
import {
  PRINCIPLES,
  DECISIONS,
  ICONS,
  SOURCES,
} from "../src/designRationale.js";

const text = [
  "# Relay: design rationale",
  "",
  "Published at https://relay-jhud172.vercel.app/design.html. The app and this document share src/designRationale.js as their content source. Regenerate with npm run docs:design.",
  "",
  "## Principles",
  "",
  ...PRINCIPLES.flatMap(([title, body]) => [`### ${title}`, "", body, ""]),
  ...DECISIONS.flatMap((group) => [
    `## ${group.title}`,
    "",
    ...group.items.flatMap(([title, body]) => [`### ${title}`, "", body, ""]),
  ]),
  "## Logo, images and icons",
  "",
  "The Relay logo uses connected square nodes to represent continuing work and context between stages. Its adjacent wordmark identifies the product, while the dot is decorative. The vector favicon preserves the shape at small and enlarged sizes. The design guide gives the informative logo an alt description; repeated interface icons are decorative beside accessible labels.",
  "",
  "There are no stock photographs or generated illustrations in the workspace: they do not explain task state. The faint static Focus ring is decorative and carries no essential meaning. Lucide provides a consistent outline vocabulary.",
  "",
  ...ICONS.flatMap(([name, use, why]) => [
    `### ${name}`,
    "",
    `Used for: ${use}. ${why}`,
    "",
  ]),
  "## Sources and evidence",
  "",
  ...SOURCES.flatMap(([title, url, why]) => [`- [${title}](${url}): ${why}`]),
  "",
  "General heuristics and WCAG guidance inform this design; they are not a user-study result for Relay. ACCESSIBILITY.md records tested behavior and limitations. No universal psychological response or full conformance certification is claimed.",
  "",
  "## Rule for future changes",
  "",
  "Every new visual asset, component or interaction must record: the user need; the design choice; the intended benefit and source (or label it a design judgment); the keyboard/screen-reader/colour/resize implications; the verification and remaining limits. Add the rationale to src/designRationale.js, regenerate this file, and inspect the relevant rendered states before shipping.",
  "",
].join("\n");
await writeFile(new URL("../DESIGN_RATIONALE.md", import.meta.url), text);
