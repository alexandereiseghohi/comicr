import dotenv from "dotenv";
import fs from "fs/promises";

const samplePath = process.argv[2] || ".env.example";
const envPath = process.argv[3] || ".env";

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
    process.exitCode = 2;
  } else {
    console.log(
      `All ${Object.keys(sample).length} keys from ${samplePath} are present in ${envPath}.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
