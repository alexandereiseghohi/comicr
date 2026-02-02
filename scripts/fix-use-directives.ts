import fs from "node:fs";
import path from "node:path";

const exts = [".ts", ".tsx", ".js", ".jsx"];
const __filename = path.win32.normalize(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\//, "")));
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../src");

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (exts.includes(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function fixFile(file: string) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;

  // Remove ("use server"); or ("use client");
  src = src.replaceAll(/\(\s*["']use (server|client)["']\s*\);?/g, () => {
    changed = true;
    return "";
  });

  // Remove 'use server'; or "use client"; not at the top
  const lines = src.split("\n");
  let directive: null | string = null;
  for (let i = 0; i < lines.length; ++i) {
    if (/^\s*['"]use (server|client)['"]\s*;?\s*$/.test(lines[i])) {
      directive = lines[i].replace(/;$/, "");
      lines.splice(i, 1);
      changed = true;
      break;
    }
  }

  // Find first import line
  const importIdx = lines.findIndex((l) => /^\s*import /.test(l));
  if (directive && importIdx !== -1) {
    // Only insert if not already at the top
    if (lines[0].trim() !== directive.replace(/;$/, "")) {
      lines.splice(importIdx, 0, directive);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    console.log("Fixed:", file);
  }
}

for (const file of walk(root)) {
  fixFile(file);
}
