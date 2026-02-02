import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
    "logs/**",
  ]),
  {
    plugins: {
      unicorn,
    },
    rules: {
      // Allow underscore-prefixed unused vars for intentional API consistency
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Enforce kebab-case file naming convention
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [
            // Next.js special files (always kebab-case already)
            "^layout\\.tsx?$",
            "^page\\.tsx?$",
            "^error\\.tsx?$",
            "^loading\\.tsx?$",
            "^not-found\\.tsx?$",
            "^template\\.tsx?$",
            "^default\\.tsx?$",
            "^route\\.ts$",

            // React components in src/components/ui/ (PascalCase allowed)
            "^[A-Z][a-zA-Z0-9]*\\.tsx$",

            // Test files can use any case
            ".*\\.test\\.tsx?$",
            ".*\\.spec\\.tsx?$",

            // Config files
            "^[A-Z][A-Z0-9_]*\\.md$", // README.md, CHANGELOG.md, etc.

            // Special directories that might have uppercase
            "^__[a-zA-Z0-9_]+__$", // __mocks__, __tests__, etc.
          ],
        },
      ],

      // General code quality improvements
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      eqeqeq: "error",

      // Ensure server actions have 'use server' directive (check manually)
      // Note: Automated check would require AST parsing - enforced via code review
    },
  },
]);

export default eslintConfig;
