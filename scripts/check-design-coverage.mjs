import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { SOURCES } from "../src/designRationale.js";
import { ASSET_REASONS, COMPONENT_REASONS, ICON_REASONS, JUSTIFICATIONS, JUSTIFICATION_FIELDS, JUSTIFICATION_REFS, PAGE_REASONS } from "../src/designInventory.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const ids = new Set();
const failures = [];
for (const entry of JUSTIFICATIONS) {
  if (!entry.id || ids.has(entry.id)) failures.push(`Duplicate/missing decision ID: ${entry.id}`);
  ids.add(entry.id);
  for (const key of ["title", "area", ...JUSTIFICATION_FIELDS.map(([key]) => key)])
    if (typeof entry[key] !== "string" || !entry[key].trim()) failures.push(`${entry.id}: missing ${key}`);
  for (const key of entry.sources) if (!JUSTIFICATION_REFS[key]) failures.push(`${entry.id}: unknown source ${key}`);
  const narration = [entry.title, ...JUSTIFICATION_FIELDS.map(([key, label]) => `${label}. ${entry[key]}`)].join(". ");
  if (narration.length > 12000) failures.push(`${entry.id}: individual narration exceeds the announced limit`);
  for (const file of entry.implementation) {
    try { await stat(join(root, file)); } catch { failures.push(`${entry.id}: missing implementation ${file}`); }
  }
}
const documentedIcons = new Set(ICON_REASONS.flatMap(group => group.names));
for (const item of [...ASSET_REASONS, ...ICON_REASONS, ...PAGE_REASONS])
  if (!ids.has(item.reason)) failures.push(`Unknown reason ${item.reason}`);
let components = 0;
const referencedIcons = new Set();
const jsxFiles = (await readdir(join(root, "src"))).filter(name => name.endsWith(".jsx"));
for (const path of Object.keys(COMPONENT_REASONS))
  if (!jsxFiles.some(file => path === `src/${file}`)) failures.push(`Stale component file ${path}`);
for (const key of Object.keys(JUSTIFICATION_REFS))
  if (!SOURCES.some(([, url]) => url === JUSTIFICATION_REFS[key][1])) failures.push(`Missing published source ${key}`);
for (const file of jsxFiles) {
  const path = `src/${file}`;
  let source = await readFile(join(root, path), "utf8");
  const declared = [...source.matchAll(/(?:function|class)\s+([A-Z]\w*)/g)].map(match => match[1]);
  for (const name of declared) {
    components++;
    if (!ids.has(COMPONENT_REASONS[path]?.[name])) failures.push(`${path}: undocumented component ${name}`);
  }
  for (const name of Object.keys(COMPONENT_REASONS[path] || {}))
    if (!declared.includes(name)) failures.push(`${path}: stale component entry ${name}`);
  for (const match of [...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g)]) {
    source = source.replace(match[0], "");
    for (const specifier of match[1].split(",").map(text => text.trim()).filter(Boolean)) {
      const [name, local = name] = specifier.split(/\s+as\s+/);
      if (!new RegExp(`\\b${local}\\b`).test(source)) continue;
      referencedIcons.add(name);
      if (!documentedIcons.has(name)) failures.push(`${path}: undocumented icon ${name}`);
    }
  }
}
for (const name of documentedIcons) if (!referencedIcons.has(name)) failures.push(`Stale icon entry ${name}`);
async function filesUnder(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    result.push(...entry.isDirectory() ? await filesUnder(path) : [relative(root, path).replaceAll("\\", "/")]);
  }
  return result;
}
const publicFiles = await filesUnder(join(root, "public"));
for (const file of publicFiles) if (!ASSET_REASONS.some(asset => asset.file === file)) failures.push(`Undocumented public asset ${file}`);
for (const asset of ASSET_REASONS) if (!publicFiles.includes(asset.file)) failures.push(`Missing documented asset ${asset.file}`);
const htmlFiles = (await readdir(root)).filter(file => file.endsWith(".html"));
for (const file of htmlFiles) if (!PAGE_REASONS.some(page => page.file === file)) failures.push(`Undocumented public page ${file}`);
for (const page of PAGE_REASONS) {
  try { await stat(join(root, page.file)); await stat(join(root, page.entry)); }
  catch { failures.push(`Missing page/entry ${page.file}`); }
}
if (failures.length) throw new Error(`Design coverage failed:\n${failures.join("\n")}`);
console.log(`Design source coverage: ${JUSTIFICATIONS.length} explanations, ${components} declared components, ${referencedIcons.size} referenced Lucide symbols, ${publicFiles.length} assets, ${htmlFiles.length} pages. This checks inventory coverage, not human benefit or full accessibility.`);
