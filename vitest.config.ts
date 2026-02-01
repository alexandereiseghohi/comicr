import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.spec.*", "tests/unit/**/*.test.*"],
    exclude: ["tests/e2e/**/*", "node_modules/**/*"],
    setupFiles: ["./tests/setup-env.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html", "json"],
      exclude: [
        "**/*.config.*",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/tests/**",
        "**/scripts/**",
        "**/coverage/**",
      ],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "next/cache": path.resolve(__dirname, "__mocks__/next/cache.ts"),
      "next/headers": path.resolve(__dirname, "__mocks__/next/headers.ts"),
    },
  },
});
