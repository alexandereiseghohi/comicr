/**
 * @file .prettierrc.ts
 * @description Prettier configuration for ComicWise
 * @author ComicWise Team
 * @date 2026-01-30
 */

import type { Options } from "prettier";

const config: Options = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  jsxSingleQuote: false,
};

export default config;
