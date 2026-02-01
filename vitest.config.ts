import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.spec.*"],
    exclude: ["tests/e2e/**/*"],
    setupFiles: ["./tests/setup-env.ts"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "next/cache": path.resolve(__dirname, "__mocks__/next/cache.ts"),
      "next/headers": path.resolve(__dirname, "__mocks__/next/headers.ts"),
    },
  },
});
