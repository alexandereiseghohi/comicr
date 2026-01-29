import dotenv from "dotenv";
import fs from "fs/promises";

const rawArgs = process.argv.slice(2);
const samplePath = rawArgs.find((a) => !a.startsWith("--report=")) || ".env.example";
const envPath = rawArgs.find((a, i) => i === 1 && !a.startsWith("--report=")) || ".env";
const reportArg = rawArgs.find((a) => a.startsWith("--report="));
const reportPath = reportArg ? reportArg.split("=")[1] : undefined;

async function parseDotEnv(file: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(file, "utf8");
    const parsed = dotenv.parse(content);
    return parsed;
  } catch {
    return {};
  }
}

async function main() {
  const sample = await parseDotEnv(samplePath);
  const actual = await parseDotEnv(envPath);

  const missing = Object.keys(sample).filter(
    (k) => !Object.keys(actual).includes(k) || actual[k] === ""
  );
  if (missing.length) {
    console.error(`Missing ${missing.length} env vars from ${envPath}:`);
    for (const m of missing) console.error(` - ${m}`);
    if (reportPath) {
      const report = {
        generatedAt: new Date().toISOString(),
        samplePath,
        envPath,
        totalSampleKeys: Object.keys(sample).length,
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
    console.log(
      `All ${Object.keys(sample).length} keys from ${samplePath} are present in ${envPath}.`
    );
    if (reportPath) {
      const report = {
        generatedAt: new Date().toISOString(),
        samplePath,
        envPath,
        totalSampleKeys: Object.keys(sample).length,
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
