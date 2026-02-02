#!/usr/bin/env npx tsx
/**
 * ComicWise CLI (cw)
 * A unified command-line interface for ComicWise development tasks
 *
 * Usage: pnpm cw <command> [options]
 *
 * Commands:
 *   scaffold    - Generate new components, pages, actions, schemas
 *   db          - Database operations (push, seed, reset, studio)
 *   test        - Run tests (unit, e2e, all)
 *   deploy      - Deployment operations (build, preview, production)
 *   validate    - Run validation checks (types, lint, env)
 */

import { execSync, spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { fileURLToPath } from "node:url";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

const ROOT_DIR = path.resolve(__dirname, "..");

// Helper to run shell commands
function run(cmd: string, options?: { cwd?: string; silent?: boolean }): string {
  try {
    const result = execSync(cmd, {
      cwd: options?.cwd || ROOT_DIR,
      encoding: "utf-8",
      stdio: options?.silent ? "pipe" : "inherit",
    });
    return result || "";
  } catch (error) {
    if (!options?.silent) {
      throw error;
    }
    return "";
  }
}

// Helper for interactive prompts
async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}?${colors.reset} ${question} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// SCAFFOLD COMMANDS
// ============================================================================

const scaffoldTemplates = {
  component: (name: string, dir: string) => ({
    path: path.join(ROOT_DIR, "src/components", dir, `${name}.tsx`),
    content: `"use client";

import { cn } from "@/lib/utils";

interface ${pascalCase(name)}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${pascalCase(name)}({ className, children }: ${pascalCase(name)}Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
`,
  }),

  page: (name: string) => ({
    path: path.join(ROOT_DIR, "src/app/(root)", name, "page.tsx"),
    content: `import { Metadata } from "next";

export const metadata: Metadata = {
  title: "${pascalCase(name)} | ComicWise",
  description: "${pascalCase(name)} page description",
};

export default function ${pascalCase(name)}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">${pascalCase(name)}</h1>
    </div>
  );
}
`,
  }),

  action: (name: string) => ({
    path: path.join(ROOT_DIR, "src/lib/actions", `${name}.ts`),
    content: `"use server";

import { auth } from "@/auth";
import type { ActionResult } from "@/types";

export async function get${pascalCase(name)}Action(): Promise<ActionResult<unknown>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // TODO: Implement action logic
    return { success: true, data: null };
  } catch (error) {
    console.error("[${name.toUpperCase()}_ACTION_ERROR]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
`,
  }),

  schema: (name: string) => ({
    path: path.join(ROOT_DIR, "src/schemas", `${name}-schema.ts`),
    content: `import { z } from "zod";

export const ${camelCase(name)}Schema = z.object({
  id: z.number().optional(),
  // Add your schema fields here
});

export type ${pascalCase(name)}Input = z.infer<typeof ${camelCase(name)}Schema>;
`,
  }),

  query: (name: string) => ({
    path: path.join(ROOT_DIR, "src/database/queries", `${name}-queries.ts`),
    content: `import { db } from "@/database/db";
// import { ${camelCase(name)} } from "@/database/schema";

export async function getAll${pascalCase(name)}s() {
  try {
    // const result = await db.select().from(${camelCase(name)});
    // return { success: true, data: result };
    return { success: true, data: [] };
  } catch (error) {
    console.error("[GET_ALL_${name.toUpperCase()}_ERROR]", error);
    return { success: false, error: "Failed to fetch ${name}s" };
  }
}

export async function get${pascalCase(name)}ById(id: number) {
  try {
    // const result = await db.select().from(${camelCase(name)}).where(eq(${camelCase(name)}.id, id));
    // return { success: true, data: result[0] || null };
    return { success: true, data: null };
  } catch (error) {
    console.error("[GET_${name.toUpperCase()}_BY_ID_ERROR]", error);
    return { success: false, error: "Failed to fetch ${name}" };
  }
}
`,
  }),

  mutation: (name: string) => ({
    path: path.join(ROOT_DIR, "src/database/mutations", `${name}-mutations.ts`),
    content: `import { db } from "@/database/db";
// import { ${camelCase(name)} } from "@/database/schema";
import type { ${pascalCase(name)}Input } from "@/schemas/${name}-schema";

export async function create${pascalCase(name)}(input: ${pascalCase(name)}Input) {
  try {
    // const result = await db.insert(${camelCase(name)}).values(input).returning();
    // return { success: true, data: result[0] };
    return { success: true, data: input };
  } catch (error) {
    console.error("[CREATE_${name.toUpperCase()}_ERROR]", error);
    return { success: false, error: "Failed to create ${name}" };
  }
}

export async function update${pascalCase(name)}(id: number, input: Partial<${pascalCase(name)}Input>) {
  try {
    // const result = await db.update(${camelCase(name)}).set(input).where(eq(${camelCase(name)}.id, id)).returning();
    // return { success: true, data: result[0] };
    return { success: true, data: { id, ...input } };
  } catch (error) {
    console.error("[UPDATE_${name.toUpperCase()}_ERROR]", error);
    return { success: false, error: "Failed to update ${name}" };
  }
}

export async function delete${pascalCase(name)}(id: number) {
  try {
    // await db.delete(${camelCase(name)}).where(eq(${camelCase(name)}.id, id));
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[DELETE_${name.toUpperCase()}_ERROR]", error);
    return { success: false, error: "Failed to delete ${name}" };
  }
}
`,
  }),
};

async function scaffoldCommand(args: string[]) {
  const [type, name, ...rest] = args;

  if (!type || !name) {
    log.title("Scaffold Commands");
    console.log(`
  Usage: pnpm cw scaffold <type> <name> [options]

  Types:
    component <name> [dir]  Create a React component (default dir: ui)
    page <name>             Create a Next.js page
    action <name>           Create a server action
    schema <name>           Create a Zod schema
    query <name>            Create database queries
    mutation <name>         Create database mutations
    full <name>             Create schema + query + mutation + action

  Examples:
    pnpm cw scaffold component Button ui
    pnpm cw scaffold page about
    pnpm cw scaffold full notification
`);
    return;
  }

  const kebabName = kebabCase(name);

  switch (type) {
    case "component": {
      const dir = rest[0] || "ui";
      const template = scaffoldTemplates.component(kebabName, dir);
      await writeFile(template.path, template.content);
      log.success(`Created component: ${template.path}`);
      break;
    }
    case "page": {
      const template = scaffoldTemplates.page(kebabName);
      await writeFile(template.path, template.content);
      log.success(`Created page: ${template.path}`);
      break;
    }
    case "action": {
      const template = scaffoldTemplates.action(kebabName);
      await writeFile(template.path, template.content);
      log.success(`Created action: ${template.path}`);
      break;
    }
    case "schema": {
      const template = scaffoldTemplates.schema(kebabName);
      await writeFile(template.path, template.content);
      log.success(`Created schema: ${template.path}`);
      break;
    }
    case "query": {
      const template = scaffoldTemplates.query(kebabName);
      await writeFile(template.path, template.content);
      log.success(`Created queries: ${template.path}`);
      break;
    }
    case "mutation": {
      const template = scaffoldTemplates.mutation(kebabName);
      await writeFile(template.path, template.content);
      log.success(`Created mutations: ${template.path}`);
      break;
    }
    case "full": {
      const files = [
        scaffoldTemplates.schema(kebabName),
        scaffoldTemplates.query(kebabName),
        scaffoldTemplates.mutation(kebabName),
        scaffoldTemplates.action(kebabName),
      ];
      for (const file of files) {
        await writeFile(file.path, file.content);
        log.success(`Created: ${file.path}`);
      }
      break;
    }
    default:
      log.error(`Unknown scaffold type: ${type}`);
  }
}

// ============================================================================
// DATABASE COMMANDS
// ============================================================================

async function dbCommand(args: string[]) {
  const [subcommand, ...rest] = args;

  if (!subcommand) {
    log.title("Database Commands");
    console.log(`
  Usage: pnpm cw db <command> [options]

  Commands:
    push       Push schema changes to database
    seed       Seed database with test data
               Options: --users, --comics, --chapters (seed only specific entities)
    reset      Reset database (drop all tables, push schema, seed)
    studio     Open Drizzle Studio GUI
    generate   Generate database migrations
    migrate    Run pending migrations

  Examples:
    pnpm cw db seed              # Seed all entities
    pnpm cw db seed --users      # Seed only users
    pnpm cw db seed --comics --chapters  # Seed comics and chapters only
`);
    return;
  }

  switch (subcommand) {
    case "push":
      log.info("Pushing schema changes...");
      run("pnpm db:push");
      log.success("Schema pushed successfully");
      break;
    case "seed": {
      const hasUsers = rest.includes("--users");
      const hasComics = rest.includes("--comics");
      const hasChapters = rest.includes("--chapters");

      if (hasUsers || hasComics || hasChapters) {
        log.info("Seeding database with selected entities...");
        const envVars = [];
        if (hasUsers) envVars.push("SEED_USERS=true");
        if (hasComics) envVars.push("SEED_COMICS=true");
        if (hasChapters) envVars.push("SEED_CHAPTERS=true");

        const fullCommand = `${envVars.join(" ")} npx tsx scripts/db-seed.ts`;
        run(fullCommand);
        log.success(
          `Seeded: ${[hasUsers && "users", hasComics && "comics", hasChapters && "chapters"]
            .filter(Boolean)
            .join(", ")}`
        );
      } else {
        log.info("Seeding database with all entities...");
        run("pnpm db:seed");
        log.success("Database seeded successfully");
      }
      break;
    }
    case "reset": {
      const confirm = await prompt("This will DELETE ALL DATA. Continue? (yes/no)");
      if (confirm.toLowerCase() !== "yes") {
        log.warn("Aborted");
        return;
      }
      log.info("Resetting database...");
      run("pnpm db:push --force");
      run("pnpm db:seed");
      log.success("Database reset complete");
      break;
    }
    case "studio":
      log.info("Opening Drizzle Studio...");
      spawn("pnpm", ["db:studio"], { stdio: "inherit", shell: true, cwd: ROOT_DIR });
      break;
    case "generate":
      log.info("Generating migrations...");
      run("pnpm drizzle-kit generate");
      log.success("Migrations generated");
      break;
    case "migrate":
      log.info("Running migrations...");
      run("pnpm drizzle-kit migrate");
      log.success("Migrations applied");
      break;
    default:
      log.error(`Unknown database command: ${subcommand}`);
  }
}

// ============================================================================
// TEST COMMANDS
// ============================================================================

async function testCommand(args: string[]) {
  const [subcommand, ...rest] = args;

  if (!subcommand) {
    log.title("Test Commands");
    console.log(`
  Usage: pnpm cw test <command> [options]

  Commands:
    unit [pattern]     Run unit tests (Vitest)
                       Options: -w, --watch (run in watch mode)
    e2e [pattern]      Run E2E tests (Playwright)
                       Options: --ui (run with Playwright UI), --debug (debug mode)
    all                Run all tests
    coverage           Run unit tests with coverage
    watch              Run unit tests in watch mode

  Examples:
    pnpm cw test unit -w                    # Unit tests in watch mode
    pnpm cw test e2e --ui                   # E2E tests with Playwright UI
    pnpm cw test e2e --debug               # E2E tests in debug mode
    pnpm cw test e2e tests/e2e/reader.spec.ts  # Run specific test file
`);
    return;
  }

  switch (subcommand) {
    case "unit": {
      const hasWatch = rest.includes("-w") || rest.includes("--watch");
      const patterns = rest.filter((arg) => !arg.startsWith("-"));

      if (hasWatch) {
        log.info("Running unit tests in watch mode...");
        const command = patterns.length > 0 ? `pnpm test ${patterns.join(" ")} --watch` : "pnpm test --watch";
        spawn("pnpm", command.split(" ").slice(1), {
          stdio: "inherit",
          shell: true,
          cwd: ROOT_DIR,
        });
      } else {
        log.info("Running unit tests...");
        if (patterns.length > 0) {
          run(`pnpm test ${patterns.join(" ")}`);
        } else {
          run("pnpm test");
        }
      }
      break;
    }
    case "e2e": {
      const hasUi = rest.includes("--ui");
      const hasDebug = rest.includes("--debug");
      const patterns = rest.filter((arg) => !arg.startsWith("--"));

      let command = "pnpm test:e2e";

      if (hasUi) {
        log.info("Running E2E tests with Playwright UI...");
        command += " --ui";
      } else if (hasDebug) {
        log.info("Running E2E tests in debug mode...");
        command += " --debug";
      } else {
        log.info("Running E2E tests...");
      }

      if (patterns.length > 0) {
        command += ` ${patterns.join(" ")}`;
      }

      if (hasUi || hasDebug) {
        spawn("pnpm", command.split(" ").slice(1), {
          stdio: "inherit",
          shell: true,
          cwd: ROOT_DIR,
        });
      } else {
        run(command);
      }
      break;
    }
    case "all":
      log.info("Running all tests...");
      run("pnpm test");
      run("pnpm test:e2e");
      log.success("All tests completed");
      break;
    case "coverage":
      log.info("Running tests with coverage...");
      run("pnpm test --coverage");
      break;
    case "watch":
      log.info("Running tests in watch mode...");
      spawn("pnpm", ["test", "--watch"], { stdio: "inherit", shell: true, cwd: ROOT_DIR });
      break;
    default:
      log.error(`Unknown test command: ${subcommand}`);
  }
}

// ============================================================================
// DEPLOY COMMANDS
// ============================================================================

async function deployCommand(args: string[]) {
  const [subcommand, ..._rest] = args;

  if (!subcommand) {
    log.title("Deploy Commands");
    console.log(`
  Usage: pnpm cw deploy <command> [options]

  Commands:
    build             Build production bundle
    preview           Build and preview locally
    staging           Deploy to Vercel staging environment
    production        Deploy to Vercel production environment
    check             Pre-deployment checks (types, lint, tests)

  Examples:
    pnpm cw deploy build          # Build for production
    pnpm cw deploy preview        # Build and preview locally
    pnpm cw deploy staging        # Deploy to staging
    pnpm cw deploy production     # Deploy to production
    pnpm cw deploy check          # Run all pre-deployment checks
`);
    return;
  }

  switch (subcommand) {
    case "build":
      log.info("Building production bundle...");
      run("pnpm build");
      log.success("Build completed");
      break;
    case "preview":
      log.info("Building for preview...");
      run("pnpm build");
      log.info("Starting preview server...");
      spawn("pnpm", ["start"], { stdio: "inherit", shell: true, cwd: ROOT_DIR });
      break;
    case "staging": {
      log.info("Deploying to Vercel staging environment...");
      const hasVercelCli = run("vercel --version", { silent: true });
      if (!hasVercelCli) {
        log.error("Vercel CLI not installed. Run: npm i -g vercel");
        return;
      }
      log.info("Running pre-deployment checks...");
      run("pnpm type-check");
      run("pnpm lint");
      log.info("Deploying to staging...");
      run("vercel"); // Without --prod flag = staging/preview
      log.success("Staging deployment initiated");
      break;
    }
    case "production": {
      log.info("Deploying to Vercel production environment...");
      const hasVercelCli = run("vercel --version", { silent: true });
      if (!hasVercelCli) {
        log.error("Vercel CLI not installed. Run: npm i -g vercel");
        return;
      }
      const confirm = await prompt("Deploy to PRODUCTION? (yes/no)");
      if (confirm.toLowerCase() !== "yes") {
        log.warn("Deployment aborted");
        return;
      }
      log.info("Running pre-deployment checks...");
      run("pnpm type-check");
      run("pnpm lint");
      run("pnpm test");
      log.info("Deploying to production...");
      run("vercel --prod");
      log.success("Production deployment initiated");
      break;
    }
    case "vercel": {
      // Backward compatibility - default to staging
      log.info("Deploying to Vercel (staging)...");
      const hasVercelCli = run("vercel --version", { silent: true });
      if (!hasVercelCli) {
        log.error("Vercel CLI not installed. Run: npm i -g vercel");
        return;
      }
      run("vercel");
      log.success("Deployment initiated");
      break;
    }
    case "check":
      log.info("Running pre-deployment checks...");
      log.info("Type checking...");
      run("pnpm type-check");
      log.info("Linting...");
      run("pnpm lint");
      log.info("Running tests...");
      run("pnpm test");
      log.success("All checks passed!");
      break;
    default:
      log.error(`Unknown deploy command: ${subcommand}`);
  }
}

// ============================================================================
// VALIDATE COMMANDS
// ============================================================================

async function validateCommand(args: string[]) {
  const [subcommand] = args;

  if (!subcommand) {
    log.title("Validate Commands");
    console.log(`
  Usage: pnpm cw validate <command>

  Commands:
    types      Run TypeScript type checking
    lint       Run ESLint
    env        Validate environment variables
    all        Run all validations
    fix        Run lint with auto-fix
`);
    return;
  }

  switch (subcommand) {
    case "types":
      log.info("Type checking...");
      run("pnpm type-check");
      log.success("Type check passed");
      break;
    case "lint":
      log.info("Linting...");
      run("pnpm lint");
      log.success("Lint passed");
      break;
    case "env":
      log.info("Validating environment...");
      run("npx tsx scripts/validate-env.ts");
      log.success("Environment validated");
      break;
    case "all":
      log.info("Running full validation...");
      run("pnpm validate");
      log.success("All validations passed");
      break;
    case "fix":
      log.info("Running lint with auto-fix...");
      run("pnpm lint:fix");
      log.success("Lint fix completed");
      break;
    default:
      log.error(`Unknown validate command: ${subcommand}`);
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function pascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function camelCase(str: string): string {
  const pascal = pascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function kebabCase(str: string): string {
  return str
    .replaceAll(/([a-z])([A-Z])/g, "$1-$2")
    .replaceAll(/[\s_]+/g, "-")
    .toLowerCase();
}

async function writeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(filePath)) {
    const overwrite = await prompt(`File exists: ${filePath}. Overwrite? (yes/no)`);
    if (overwrite.toLowerCase() !== "yes") {
      log.warn(`Skipped: ${filePath}`);
      return;
    }
  }
  fs.writeFileSync(filePath, content, "utf-8");
}

// ============================================================================
// MAIN
// ============================================================================

function showHelp() {
  log.title("ComicWise CLI (cw)");
  console.log(`
  Usage: pnpm cw <command> [options]

  Commands:
    scaffold    Generate new components, pages, actions, schemas
    db          Database operations (push, seed, reset, studio)
    test        Run tests (unit, e2e, coverage)
    deploy      Deployment operations (build, preview, vercel)
    validate    Run validation checks (types, lint, env)
    help        Show this help message

  Run 'pnpm cw <command>' for more information on a specific command.
`);
}

async function main() {
  const args = process.argv.slice(2);
  const [command, ...rest] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    showHelp();
    return;
  }

  switch (command) {
    case "scaffold":
      await scaffoldCommand(rest);
      break;
    case "db":
      await dbCommand(rest);
      break;
    case "test":
      await testCommand(rest);
      break;
    case "deploy":
      await deployCommand(rest);
      break;
    case "validate":
      await validateCommand(rest);
      break;
    default:
      log.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  log.error(error.message);
  process.exit(1);
});
