import { writeFile } from "node:fs/promises";
import "./check-design-coverage.mjs";
import { ASSET_REASONS, COMPONENT_REASONS, ICON_REASONS, IDENTITY_NOTE, IMAGERY_NOTE, JUSTIFICATIONS, JUSTIFICATION_FIELDS, JUSTIFICATION_REFS, PAGE_REASONS } from "../src/designInventory.js";
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
  IDENTITY_NOTE,
  "",
  IMAGERY_NOTE,
  "",
  ...ICONS.flatMap(([name, use, why]) => [
    `### ${name}`,
    "",
    `Used for: ${use}. ${why}`,
    "",
  ]),
  "## Complete implemented-choice register",
  "",
  "The register covers implemented interface/component families and the asset/icon inventory. Guidance supports principles; exact timings, spacing, colour/material choices and aesthetic details remain design judgments unless a specific observation is recorded. Source coverage is not proof of psychological benefit or full accessibility. The live guide provides search, expandable entries and individual narration.",
  "",
  ...JUSTIFICATIONS.flatMap(entry => [
    `### ${entry.title} (${entry.id})`, "", `Area: ${entry.area}.`, "",
    ...JUSTIFICATION_FIELDS.flatMap(([key, label]) => [`**${label}:** ${entry[key]}`, ""]),
    `**Implementation:** ${entry.implementation.map(file => `\`${file}\``).join(", ")}.`, "",
    `**Guidance:** ${entry.sources.map(key => `[${JUSTIFICATION_REFS[key][0]}](${JUSTIFICATION_REFS[key][1]})`).join(", ")}.`, "",
  ]),
  "## Source inventory", "",
  "Static source coverage checks declared component names, referenced Lucide imports, shipped public assets and HTML pages against this register. It catches omissions/stale entries, not whether the rationale is convincing or every runtime state was tested.", "",
  "### Components", "",
  ...Object.entries(COMPONENT_REASONS).flatMap(([file, components]) => [
    `- \`${file}\`: ${Object.entries(components).map(([name, reason]) => `\`${name}\` → ${reason}`).join("; ")}.`,
  ]), "",
  "### Every referenced Lucide symbol", "",
  ...ICON_REASONS.flatMap(group => [`- **${group.names.join(", ")}** → ${group.reason}: ${group.why}`]), "",
  "### Shipped assets", "",
  ...ASSET_REASONS.flatMap(asset => [`- \`${asset.file}\` → ${asset.reason}: ${asset.role}`]), "",
  "### Public pages", "",
  ...PAGE_REASONS.flatMap(page => [`- \`${page.file}\` / \`${page.entry}\` → ${page.reason}: ${page.role}`]), "",
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
