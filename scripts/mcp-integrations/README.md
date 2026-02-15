# MCP Integration Scripts

This directory contains placeholder scripts for MCP server integrations. The following scripts are referenced but missing:

- `playwright-integration.ts` – Playwright test generation/debugging
- `vitest-integration.ts` – Vitest test analysis
- `sentry-integration.ts` – Sentry monitoring
- `github-integration.ts` – GitHub workflow automation

## To add an integration:

1. Create the corresponding `.ts` file in this directory.
2. Implement the integration logic or use a stub that calls the relevant MCP server or fallback tools.
3. See `scripts/verify-mcp-packages.ts` for recommended packages and alternatives.

If you need a template for any of these, ask Copilot to generate a stub for the desired integration.
