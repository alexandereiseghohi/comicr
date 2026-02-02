/**
 * MCP Package Verification Script
 * Checks npm registry for recommended MCP server packages before configuration
 *
 * Usage: pnpm tsx scripts/verify-mcp-packages.ts [--report=mcp-packages-report.json]
 */
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

const execAsync = promisify(exec);

type MCPPackageCheck = {
  alternatives?: string[];
  checks: { info?: string; name: string; ok: boolean }[];
  package: string;
  purpose: string;
  recommended: boolean;
};

type MCPPackageReport = {
  generatedAt: string;
  packages: MCPPackageCheck[];
  summary: {
    available: number;
    missing: number;
    recommended: number;
    total: number;
  };
};

const recommendedMCPPackages = [
  {
    package: "@modelcontextprotocol/server-playwright",
    recommended: true,
    purpose: "Playwright test generation and debugging",
    alternatives: ["playwright", "@playwright/test"],
  },
  {
    package: "@modelcontextprotocol/server-sentry",
    recommended: true,
    purpose: "Sentry error tracking and performance monitoring",
    alternatives: ["@sentry/nextjs", "@sentry/cli"],
  },
  {
    package: "@modelcontextprotocol/server-vitest",
    recommended: true,
    purpose: "Vitest test generation and analysis",
    alternatives: ["vitest"],
  },
  {
    package: "@modelcontextprotocol/server-github",
    recommended: true,
    purpose: "GitHub integration for issues, PRs, and workflows",
    alternatives: ["@octokit/rest"],
  },
  // Verify existing packages too
  {
    package: "@modelcontextprotocol/server-nextjs",
    recommended: false,
    purpose: "Next.js development tools (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-typescript",
    recommended: false,
    purpose: "TypeScript analysis (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-postgres",
    recommended: false,
    purpose: "PostgreSQL operations (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-redis",
    recommended: false,
    purpose: "Redis cache management (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-filesystem",
    recommended: false,
    purpose: "File system operations (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-git",
    recommended: false,
    purpose: "Git integration (already configured)",
    alternatives: [],
  },
  {
    package: "@modelcontextprotocol/server-sequential-thinking",
    recommended: false,
    purpose: "Sequential thinking server (already configured)",
    alternatives: [],
  },
  {
    package: "@upstash/context7-mcp",
    recommended: false,
    purpose: "Context7 documentation server (already configured)",
    alternatives: [],
  },
];

async function checkNpmPackage(packageName: string): Promise<{ exists: boolean; info?: string; version?: string }> {
  try {
    // Use npm view to check if package exists
    const { stdout } = await execAsync(`npm view ${packageName} version`, { timeout: 10000 });
    const version = stdout.trim();
    return { exists: true, version };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { exists: false, info: errorMessage };
  }
}

async function testNpxInstallation(packageName: string): Promise<{ canInstall: boolean; info?: string }> {
  try {
    // Test if npx can resolve the package (dry run)
    await execAsync(`npx --dry-run ${packageName} --help`, {
      timeout: 15000,
    });
    return { canInstall: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { canInstall: false, info: errorMessage };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reportArg = args.find((a) => a.startsWith("--report="));
  const reportPath = reportArg ? reportArg.split("=")[1] : "mcp-packages-report.json";

  console.log("🔍 Verifying MCP package availability...");

  const packageChecks: MCPPackageCheck[] = [];
  let available = 0;
  let missing = 0;
  let recommended = 0;

  for (const pkg of recommendedMCPPackages) {
    console.log(`  Checking ${pkg.package}...`);

    const check: MCPPackageCheck = {
      package: pkg.package,
      recommended: pkg.recommended,
      purpose: pkg.purpose,
      checks: [],
      alternatives: pkg.alternatives,
    };

    if (pkg.recommended) recommended++;

    // Check npm registry
    const npmCheck = await checkNpmPackage(pkg.package);
    check.checks.push({
      name: "npm-registry",
      ok: npmCheck.exists,
      info: npmCheck.exists ? `version: ${npmCheck.version}` : npmCheck.info,
    });

    if (npmCheck.exists) {
      available++;

      // Test npx installation capability
      const npxCheck = await testNpxInstallation(pkg.package);
      check.checks.push({
        name: "npx-installable",
        ok: npxCheck.canInstall,
        info: npxCheck.info,
      });
    } else {
      missing++;
      check.checks.push({
        name: "npx-installable",
        ok: false,
        info: "Package not found in registry",
      });
    }

    packageChecks.push(check);
  }

  // Generate report
  const report: MCPPackageReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: recommendedMCPPackages.length,
      available,
      missing,
      recommended,
    },
    packages: packageChecks,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  // Console output
  console.log("\n📊 MCP Package Verification Results:");
  console.log(`  Total packages: ${report.summary.total}`);
  console.log(`  Available: ${report.summary.available}`);
  console.log(`  Missing: ${report.summary.missing}`);
  console.log(`  Recommended new packages: ${report.summary.recommended}`);

  console.log("\n📋 Recommended Packages Status:");
  for (const check of packageChecks.filter((p) => p.recommended)) {
    const status = check.checks.every((c) => c.ok) ? "✅" : "❌";
    console.log(`  ${status} ${check.package} - ${check.purpose}`);

    if (!check.checks.every((c) => c.ok)) {
      for (const c of check.checks.filter((c) => !c.ok)) {
        console.log(`    ⚠️  ${c.name}: ${c.info}`);
      }
      if (check.alternatives && check.alternatives.length > 0) {
        console.log(`    💡 Alternatives: ${check.alternatives.join(", ")}`);
      }
    }
  }

  console.log(`\n📄 Full report written to: ${reportPath}`);

  // Exit with error code if recommended packages are missing
  const missingRecommended = packageChecks.filter((p) => p.recommended && !p.checks.every((c) => c.ok));
  if (missingRecommended.length > 0) {
    console.warn(`\n⚠️  ${missingRecommended.length} recommended packages are not available.`);
    process.exitCode = 2;
  } else {
    console.log("\n🎉 All recommended MCP packages are available!");
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("❌ Verification failed:", message);
  process.exit(1);
});
