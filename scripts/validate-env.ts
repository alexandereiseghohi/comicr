import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const envPath = ".env.local";
const reportArg = process.argv.find((a) => a.startsWith("--report="));
const reportPath = reportArg ? reportArg.split("=")[1] : undefined;

async function parseDotEnv(file: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(file, "utf8");
    return dotenv.parse(content);
  } catch {
    return {};
  }
}

// Extract env keys from src/lib/env.ts (envSchema)
async function extractEnvKeysFromSchema(): Promise<string[]> {
  // ESM-safe __dirname replacement
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envFile = path.join(__dirname, "../src/lib/env.ts");
  const content = await fs.readFile(envFile, "utf8");
  // Find the envSchema = z.object({ ... })
  const objectStart = content.indexOf("z.object({");
  if (objectStart === -1) throw new Error("envSchema z.object({ not found");
  const objectBody = content.slice(objectStart + 10);
  // Match all top-level keys: KEY: z.xxx
  const keyRegex = /([A-Z0-9_]+)\s*:/g;
  const keys = [];
  let match;
  while ((match = keyRegex.exec(objectBody))) {
    keys.push(match[1]);
  }
  return Array.from(new Set(keys));
}

async function main() {
  const requiredKeys = await extractEnvKeysFromSchema();
  const actual = await parseDotEnv(envPath);

  const missing = requiredKeys.filter(
    (k) => !(k in actual) || (actual[k] !== "placeholder" && actual[k].trim() === "")
  );
  if (missing.length) {
    console.error(`Missing ${missing.length} env vars from ${envPath}:`);
    for (const m of missing) console.error(` - ${m}`);
    if (reportPath) {
      const report = {
        generatedAt: new Date().toISOString(),
        envPath,
        totalRequiredKeys: requiredKeys.length,
        missing,
      } as const;
      try {
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
        console.log(`Wrote report to ${reportPath}`);
      } catch (e) {
        console.error(`Failed to write report to ${reportPath}:`, e);
      }
    }
    process.exitCode = 2;
  } else {
    console.log(`All ${requiredKeys.length} required keys from env schema are present in ${envPath}.`);
    if (reportPath) {
      const report = {
        generatedAt: new Date().toISOString(),
        envPath,
        totalRequiredKeys: requiredKeys.length,
        missing: [] as string[],
      } as const;
      try {
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
        console.log(`Wrote report to ${reportPath}`);
      } catch (e) {
        console.error(`Failed to write report to ${reportPath}:`, e);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
