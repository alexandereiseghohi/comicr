# VSCode Workspace Configuration (2026)

This folder contains the optimized, workspace-only configuration for ComicWise (comicr), tailored for VSCode Insider and the Next.js/TypeScript/Tailwind/Node.js/Playwright/Copilot stack.

## Files
- `settings.json`: Editor, formatting, linting, language, and privacy settings
- `extensions.json`: Recommended and unwanted extensions
- `tasks.json`: Build, lint, test, and dev tasks for pnpm/Next.js/Playwright
- `launch.json`: Debug and compound launch configs for Next.js, Playwright, Vitest
- `mcp.json`: MCP server integration for local dev and AI workflows

## Best Practices
- All settings are workspace-only (no user/global overrides)
- Formatters: Prettier for all code, ESLint for linting, Tailwind CSS for CSS
- Extensions: Only core, stable, and best-practice extensions recommended
- Tasks: All major dev/test/build flows covered, with background and shared panels
- Launch: Full stack, server/client, and test debugging for modern workflows
- MCP: Preconfigured for local, Postgres, and AI agent servers
- Telemetry: Disabled for privacy

## Insider/Experimental Notes
- This config is compatible with VSCode Insider and supports experimental features (e.g., TypeScript Next, Copilot Chat, etc.)
- For custom Insider/experimental settings, add them to `settings.json` as needed

## Comments
- All rationale, migration notes, and documentation are kept in this README for clarity and version control
- For original config backups, see `.vscode/backup/`
