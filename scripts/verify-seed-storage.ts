import fs from "node:fs/promises";

type Result = { error?: string; ok: boolean; status?: number; url: string; };

async function checkUrl(url: string): Promise<Result> {
  try {
    const res = await fetch(url, { method: "GET" });
    return { url, ok: res.ok, status: res.status };
  } catch (err: unknown) {
    return { url, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reportArg = args.find((a) => a.startsWith("--report="));
  const reportPath = reportArg ? reportArg.split("=")[1] : "seed-storage-report.json";

  // Derive a small set of URLs matching seed.ts generation patterns
  const urls: string[] = [];
  for (let i = 0; i < 10; i++) {
    urls.push(`https://api.dicebear.com/7.x/avataaars/svg?seed=author${i + 1}`);
    urls.push(`https://api.dicebear.com/7.x/avataaars/svg?seed=artist${i + 1}`);
    urls.push(`https://picsum.photos/400/600?random=${i}`);
  }

  const results: Result[] = [];
  for (const u of urls) {
    // small delay to be polite
    results.push(await checkUrl(u));
  }

  await fs.writeFile(
    reportPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8"
  );
  const failing = results.filter((r) => !r.ok);
  console.log(
    `Checked ${results.length} seed URLs. Failures: ${failing.length}. Report: ${reportPath}`
  );
  if (failing.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
