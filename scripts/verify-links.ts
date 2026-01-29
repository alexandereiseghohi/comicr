import fs from "fs/promises";
import path from "path";

type LinkResult = {
  sourceFile: string;
  link: string;
  status: number | "LOCAL_OK" | "MISSING" | "ERROR";
  notes?: string;
};

function extractLinks(markdown: string): string[] {
  const links: string[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = regex.exec(markdown))) {
    const url = m[2] ?? m[4];
    if (url) links.push(url.split(/\s+/)[0].trim());
  }
  return links;
}

async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const res = path.resolve(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkDir(res)));
    } else if (e.isFile() && /\.(md|markdown)$/i.test(e.name)) {
      files.push(res);
    }
  }
  return files;
}

async function checkUrl(url: string): Promise<number | "ERROR"> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.status >= 400 && res.status < 500) {
      const g = await fetch(url, { method: "GET" });
      return g.status;
    }
    return res.status;
  } catch (err) {
    return `ERROR ${err?.toString() ?? ""}` as "ERROR";
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dirs = args.filter((a) => !a.startsWith("--report="));
  const reportArg = args.find((a) => a.startsWith("--report="));
  const reportPath = reportArg ? reportArg.split("=")[1] : "link-report.csv";
  const targets = dirs.length ? dirs : [".github/prompts", ".github/instructions", "README.md"];

  const files: string[] = [];
  for (const t of targets) {
    try {
      const stat = await fs.stat(t);
      if (stat.isDirectory()) files.push(...(await walkDir(t)));
      else if (stat.isFile()) files.push(path.resolve(t));
    } catch {
      // skip missing
    }
  }

  const results: LinkResult[] = [];

  for (const file of files) {
    try {
      const content = await fs.readFile(file, "utf-8");
      const links = extractLinks(content);
      for (const link of links) {
        if (/^https?:\/\//i.test(link)) {
          const status = await checkUrl(link);
          results.push({ sourceFile: path.relative(process.cwd(), file), link, status });
        } else {
          const targetPath = path.resolve(path.dirname(file), link.split("#")[0]);
          try {
            await fs.access(targetPath);
            results.push({
              sourceFile: path.relative(process.cwd(), file),
              link,
              status: "LOCAL_OK",
            });
          } catch {
            results.push({
              sourceFile: path.relative(process.cwd(), file),
              link,
              status: "MISSING",
            });
          }
        }
      }
    } catch (err: unknown) {
      console.error("Failed to read", file, err);
    }
  }

  const csvLines = ["sourceFile,link,status,notes"];
  for (const r of results) {
    csvLines.push(
      `${r.sourceFile.replace(/,/g, "%2C")},${r.link.replace(/,/g, "%2C")},${r.status},${(
        r.notes ?? ""
      ).replace(/,/g, "%2C")}`
    );
  }
  await fs.writeFile(reportPath, csvLines.join("\n"), "utf8");
  const bad = results.filter(
    (r) =>
      (typeof r.status === "number" && r.status >= 400) ||
      r.status === "MISSING" ||
      r.status === "ERROR"
  );
  console.log(
    `Checked ${results.length} links across ${files.length} markdown files. Report: ${reportPath}`
  );
  if (bad.length) {
    console.warn(`Found ${bad.length} failing links. See ${reportPath} for details.`);
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
