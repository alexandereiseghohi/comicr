#!/usr/bin/env tsx
/**
 * setup-eslint.ts - Comprehensive ESLint Configuration
 * Installs and configures all 18 required ESLint plugins and rules
 * Based on Next.js 16 + TypeScript 5 + Drizzle patterns
 */
import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

// Color utilities
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Required ESLint packages (17 missing + existing unicorn)
const ESLINT_PACKAGES = [
  "eslint-config-prettier",
  "eslint-plugin-better-tailwindcss",
  "eslint-plugin-import-x",
  "eslint-plugin-jest",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-playwright",
  "eslint-plugin-react-hooks",
  "eslint-plugin-react-refresh",
  "eslint-plugin-testing-library",
  "eslint-plugin-vitest",
  "eslint-plugin-drizzle",
  "eslint-plugin-security",
  "eslint-plugin-sonarjs",
  "eslint-plugin-perfectionist",
  "@typescript-eslint/parser",
  "@typescript-eslint/eslint-plugin",
  "eslint-plugin-n",
];

// Comprehensive ESLint configuration
const ESLINT_CONFIG = `import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextCore from "eslint-config-next";
import prettier from "eslint-config-prettier";
import drizzle from "eslint-plugin-drizzle";
import importX from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import jsxA11y from "eslint-plugin-jsx-a11y";
import n from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import tailwind from "eslint-plugin-better-tailwindcss";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...compat.extends("next/core-web-vitals"),

  // Global ignores
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "public/**",
      "*.config.*",
      "drizzle.config.ts",
      "tailwind.config.ts",
    ],
  },

  // TypeScript configuration
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Main source files
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import-x": importX,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      tailwind,
      unicorn,
      security,
      sonarjs,
      perfectionist,
      drizzle,
      n,
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Import rules
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
      "import-x/no-duplicates": "error",
      "import-x/no-unresolved": "off", // Handled by TypeScript

      // React rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/click-events-have-key-events": "error",

      // Tailwind rules
      "tailwind/classnames-order": "warn",
      "tailwind/no-contradicting-classname": "error",

      // Unicorn rules (selective)
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
      "unicorn/no-null": "off", // Next.js uses null frequently
      "unicorn/prefer-module": "off", // Node.js compatibility

      // Security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",

      // Code quality rules
      "sonarjs/no-duplicate-string": ["error", { threshold: 5 }],
      "sonarjs/cognitive-complexity": ["warn", 20],

      // Perfectionist rules
      "perfectionist/sort-imports": "off", // Use import-x/order instead
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-object-types": "error",

      // Drizzle rules
      "drizzle/enforce-delete-with-where": "error",
      "drizzle/enforce-update-with-where": "error",

      // Node rules
      "n/no-process-exit": "error",
      "n/prefer-global/process": "error",
    },
  },

  // Test files configuration
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    plugins: {
      jest,
      vitest,
      "testing-library": testingLibrary,
    },
    rules: {
      // Jest/Vitest rules
      "jest/expect-expect": "error",
      "jest/no-focused-tests": "error",
      "jest/no-disabled-tests": "warn",
      "vitest/expect-expect": "error",
      "vitest/no-focused-tests": "error",

      // Testing Library rules
      "testing-library/await-async-queries": "error",
      "testing-library/no-await-sync-queries": "error",
      "testing-library/prefer-screen-queries": "error",

      // Relaxed rules for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // E2E test files configuration
  {
    files: ["tests/e2e/**/*.ts", "**/*.e2e.ts"],
    plugins: {
      playwright,
    },
    rules: {
      "playwright/expect-expect": "error",
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "warn",
      "playwright/valid-expect": "error",
    },
  },

  // React Client Components
  {
    files: ["**/*client*.tsx", "**/use*.ts", "**/use*.tsx"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "warn",
    },
  },

  // Configuration files
  {
    files: ["**/*.config.ts", "**/*.config.js", "**/*.config.mjs"],
    rules: {
      "import-x/no-default-export": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Scripts and tools
  {
    files: ["scripts/**/*.ts", "tools/**/*.ts"],
    rules: {
      "n/no-process-exit": "off",
      "unicorn/no-process-exit": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Prettier must be last
  prettier,
);`;

async function setupESLint() {
  log.info("🔧 Setting up comprehensive ESLint configuration...");

  try {
    // Check current package.json
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

    // Install missing packages
    log.info("Installing ESLint packages...");
    const packagesToInstall = ESLINT_PACKAGES.filter((pkg) => {
      const hasPackage = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
      if (!hasPackage) {
        log.info(`  - Adding: ${pkg}`);
        return true;
      } else {
        log.info(`  ✓ Already installed: ${pkg}`);
        return false;
      }
    });

    if (packagesToInstall.length > 0) {
      const installCommand = `pnpm add -D ${packagesToInstall.join(" ")}`;
      log.info(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: "inherit" });
      log.success("ESLint packages installed successfully");
    } else {
      log.success("All ESLint packages already installed");
    }

    // Update ESLint configuration
    log.info("Updating ESLint configuration...");
    const configPath = path.join(process.cwd(), "eslint.config.mjs");

    // Backup existing config
    try {
      const existingConfig = await fs.readFile(configPath, "utf-8");
      const backupPath = path.join(process.cwd(), "eslint.config.mjs.backup");
      await fs.writeFile(backupPath, existingConfig);
      log.info(`Backed up existing config to: ${backupPath}`);
    } catch {
      log.info("No existing ESLint config found");
    }

    // Write new configuration
    await fs.writeFile(configPath, ESLINT_CONFIG);
    log.success("ESLint configuration updated");

    // Test the configuration
    log.info("Testing ESLint configuration...");
    try {
      execSync("pnpm eslint --version", { stdio: "pipe" });
      execSync("pnpm eslint . --max-warnings 0 --fix", { stdio: "inherit" });
      log.success("ESLint configuration test passed");
    } catch (error) {
      log.warn("ESLint test failed, but configuration was updated");
      log.warn("You may need to fix linting errors manually");
    }

    // Update package.json scripts if needed
    log.info("Updating package.json scripts...");
    const updatedPackageJson = { ...packageJson };

    if (!updatedPackageJson.scripts) {
      updatedPackageJson.scripts = {};
    }

    const eslintScripts = {
      lint: "eslint . --max-warnings 0",
      "lint:fix": "eslint . --max-warnings 0 --fix",
      "lint:strict": "eslint . --max-warnings 0 --report-unused-disable-directives",
    };

    let scriptsUpdated = false;
    for (const [script, command] of Object.entries(eslintScripts)) {
      if (!updatedPackageJson.scripts[script] || updatedPackageJson.scripts[script] !== command) {
        updatedPackageJson.scripts[script] = command;
        scriptsUpdated = true;
        log.info(`  ✓ Updated script: ${script}`);
      }
    }

    if (scriptsUpdated) {
      await fs.writeFile(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
      log.success("Package.json scripts updated");
    } else {
      log.success("Package.json scripts already up to date");
    }

    log.success("🎉 ESLint setup completed successfully!");
    log.info("You can now run:");
    log.info("  • pnpm lint - Check for linting errors");
    log.info("  • pnpm lint:fix - Fix auto-fixable errors");
    log.info("  • pnpm lint:strict - Strict mode with unused disable directives");
  } catch (error) {
    log.error(`ESLint setup failed: ${error}`);
    throw error;
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupESLint().catch(console.error);
}

export default setupESLint;
