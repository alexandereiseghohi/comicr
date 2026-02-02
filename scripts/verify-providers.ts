import fs from "node:fs/promises";

import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

type ProviderReport = {
  checks: { info?: string; name: string; ok: boolean; }[];
  env: Record<string, string | undefined>;
  provider: string;
};

type Provider = {
  apiCheck?: string;
  discovery?: string;
  envKeys: string[];
  name: string;
};

const providers: Provider[] = [
  {
    name: "google",
    envKeys: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    discovery: "https://accounts.google.com/.well-known/openid-configuration",
  },
  {
    name: "github",
    envKeys: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    apiCheck: "https://api.github.com/",
  },
  {
    name: "apple",
    envKeys: ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
    // Apple metadata is not publicly fetchable in the same way; env presence validated
  },
];

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return await res.json();
}

async function main() {
  const args = process.argv.slice(2);
  const reportArg = args.find((a) => a.startsWith("--report="));
  const reportPath = reportArg ? reportArg.split("=")[1] : "providers-report.json";

  const reports: ProviderReport[] = [];

  for (const p of providers) {
    const report: ProviderReport = { provider: p.name, env: {}, checks: [] };
    for (const k of p.envKeys) {
      // redact actual env values to avoid leaking secrets in CI logs/reports
      report.env[k] = process.env[k] ? "REDACTED" : undefined;
      report.checks.push({ name: `env:${k}`, ok: Boolean(process.env[k]) });
    }

    if (p.discovery) {
      try {
        const json = await fetchJson(p.discovery);
        report.checks.push({ name: "discovery", ok: true, info: `issuer=${json.issuer}` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        report.checks.push({ name: "discovery", ok: false, info: message });
      }
    } else if (p.apiCheck) {
      try {
        const res = await fetch(p.apiCheck);
        report.checks.push({ name: "api-root", ok: res.ok, info: `status=${res.status}` });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        report.checks.push({ name: "api-root", ok: false, info: message });
      }
    }

    reports.push(report);
  }

  await fs.writeFile(
    reportPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2),
    "utf8"
  );
  console.log(`Provider verification written to ${reportPath}`);
  const failing = reports.flatMap((r) => r.checks.filter((c) => !c.ok));
  if (failing.length) {
    console.warn(`Found ${failing.length} failing checks.`);
    process.exitCode = 2;
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
