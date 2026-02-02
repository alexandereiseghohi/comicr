import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import tailwindcss from "eslint-plugin-better-tailwindcss";
import drizzle from "eslint-plugin-drizzle";
import importX from "eslint-plugin-import-x";
import jest from "eslint-plugin-jest";
import nodePlugin from "eslint-plugin-n";
import perfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import vitest from "eslint-plugin-vitest";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

const eslintConfig = defineConfig([
  // ===========================
  // Base configurations
  // ===========================
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,

  // ===========================
  // Global ignores
  // ===========================
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "logs/**",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    ".vercel/**",
    "*.d.ts",
  ]),

  // ===========================
  // Global settings for all files
  // ===========================
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
      react: {
        version: "detect",
      },
    },
  },

  // ===========================
  // TypeScript files
  // ===========================
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    plugins: {
      "import-x": importX,
      // jsx-a11y and react-hooks are already included via eslint-config-next
      unicorn,
      security,
      sonarjs,
      perfectionist,
      n: nodePlugin,
    },
    rules: {
      // ----- TypeScript-ESLint -----
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // ----- Import-X -----
      "import-x/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import-x/no-unresolved": "off", // TypeScript handles this
      "import-x/no-duplicates": "warn",
      "import-x/no-named-as-default": "warn",
      "import-x/no-named-as-default-member": "warn",

      // ----- React Hooks -----
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ----- JSX Accessibility -----
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/html-has-lang": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/tabindex-no-positive": "warn",

      // ----- Unicorn -----
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [
            // Next.js special files
            "^layout\\.tsx?$",
            "^page\\.tsx?$",
            "^error\\.tsx?$",
            "^loading\\.tsx?$",
            "^not-found\\.tsx?$",
            "^template\\.tsx?$",
            "^default\\.tsx?$",
            "^route\\.ts$",
            // React components (PascalCase allowed)
            "^[A-Z][a-zA-Z0-9]*\\.tsx$",
            // Test files
            ".*\\.test\\.tsx?$",
            ".*\\.spec\\.tsx?$",
            // Config files
            "^[A-Z][A-Z0-9_]*\\.md$",
            // Special directories
            "^__[a-zA-Z0-9_]+__$",
          ],
        },
      ],
      "unicorn/prefer-node-protocol": "warn",
      "unicorn/no-abusive-eslint-disable": "warn",
      "unicorn/no-array-for-each": "warn",
      "unicorn/prefer-array-find": "warn",
      "unicorn/prefer-array-flat-map": "warn",
      "unicorn/prefer-string-replace-all": "warn",

      // ----- Security -----
      "security/detect-eval-with-expression": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-object-injection": "off", // Too many false positives
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-unsafe-regex": "warn",

      // ----- SonarJS -----
      "sonarjs/cognitive-complexity": ["warn", 20],
      "sonarjs/no-duplicate-string": ["warn", { threshold: 4 }],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/prefer-immediate-return": "warn",

      // ----- Perfectionist (full sorting) -----
      "perfectionist/sort-imports": "off", // Using import-x/order instead
      "perfectionist/sort-named-imports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
        },
      ],
      "perfectionist/sort-named-exports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
        },
      ],
      "perfectionist/sort-object-types": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
        },
      ],
      "perfectionist/sort-interfaces": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
        },
      ],
      "perfectionist/sort-jsx-props": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
        },
      ],
      "perfectionist/sort-union-types": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
        },
      ],

      // ----- Node.js (n) -----
      "n/no-deprecated-api": "warn",
      "n/no-missing-import": "off", // TypeScript handles this
      "n/no-unsupported-features/es-syntax": "off", // Bundled by Next.js
      "n/prefer-promises/fs": "warn",
      "n/prefer-promises/dns": "warn",

      // ----- General code quality -----
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      eqeqeq: "error",
    },
  },

  // ===========================
  // React Refresh (TSX files in src)
  // ===========================
  {
    files: ["src/**/*.tsx"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "metadata",
            "generateMetadata",
            "viewport",
            "generateViewport",
            "generateStaticParams",
            "dynamic",
            "dynamicParams",
            "revalidate",
            "fetchCache",
            "runtime",
            "preferredRegion",
            "maxDuration",
          ],
        },
      ],
    },
  },

  // ===========================
  // Better TailwindCSS (JSX files)
  // ===========================
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      "better-tailwindcss": tailwindcss,
    },
    rules: {
      "better-tailwindcss/enforce-consistent-class-order": "warn",
      "better-tailwindcss/no-conflicting-classes": "warn",
      "better-tailwindcss/no-duplicate-classes": "warn",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
    },
  },

  // ===========================
  // Drizzle ORM (database files)
  // ===========================
  {
    files: ["src/database/**/*.ts", "src/dal/**/*.ts"],
    plugins: {
      drizzle,
    },
    rules: {
      "drizzle/enforce-delete-with-where": [
        "warn",
        {
          drizzleObjectName: ["db", "tx"],
        },
      ],
      "drizzle/enforce-update-with-where": [
        "warn",
        {
          drizzleObjectName: ["db", "tx"],
        },
      ],
    },
  },

  // ===========================
  // Unit tests (Vitest + Jest + Testing Library)
  // ===========================
  {
    files: [
      "tests/unit/**/*.ts",
      "tests/unit/**/*.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    plugins: {
      vitest,
      jest,
      "testing-library": testingLibrary,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      // ----- Vitest -----
      "vitest/expect-expect": "warn",
      "vitest/no-identical-title": "warn",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
      "vitest/prefer-to-be": "warn",
      "vitest/prefer-to-have-length": "warn",
      "vitest/valid-expect": "warn",

      // ----- Jest -----
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "warn",
      "jest/valid-expect": "warn",
      "jest/expect-expect": "warn",

      // ----- Testing Library -----
      "testing-library/await-async-queries": "warn",
      "testing-library/await-async-utils": "warn",
      "testing-library/no-await-sync-queries": "warn",
      "testing-library/no-debugging-utils": "warn",
      "testing-library/no-dom-import": "warn",
      "testing-library/prefer-screen-queries": "warn",

      // Relax some rules for tests
      "@typescript-eslint/no-explicit-any": "off",
      "security/detect-non-literal-fs-filename": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },

  // ===========================
  // E2E tests (Playwright)
  // ===========================
  {
    files: ["tests/e2e/**/*.ts", "tests/e2e/**/*.tsx"],
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/no-wait-for-timeout": "warn",
      "playwright/prefer-web-first-assertions": "warn",
      "playwright/expect-expect": "warn",
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "warn",
      "playwright/valid-expect": "warn",
      "playwright/no-standalone-expect": "warn",
      "playwright/no-networkidle": "warn",
      "playwright/no-conditional-in-test": "warn",
      "playwright/no-conditional-expect": "warn",

      // Relax some rules for E2E tests
      "@typescript-eslint/no-explicit-any": "off",
      "security/detect-non-literal-fs-filename": "off",
      "sonarjs/no-duplicate-string": "off",
      "no-console": "off",
    },
  },

  // ===========================
  // Scripts (relaxed rules)
  // ===========================
  {
    files: ["scripts/**/*.ts", "scripts/**/*.mts"],
    rules: {
      "no-console": "off",
      "no-useless-escape": "off", // Template literals for config generation
      "@typescript-eslint/no-explicit-any": "warn",
      "security/detect-non-literal-fs-filename": "off",
      "n/no-process-exit": "off",
    },
  },

  // ===========================
  // Config files (JS/MJS)
  // ===========================
  {
    files: ["*.config.ts", "*.config.mjs", "*.config.js"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import-x/no-default-export": "off",
    },
  },

  // ===========================
  // Prettier (MUST BE LAST)
  // Disables styling rules that conflict with Prettier
  // ===========================
  prettier,
]);

export default eslintConfig;
