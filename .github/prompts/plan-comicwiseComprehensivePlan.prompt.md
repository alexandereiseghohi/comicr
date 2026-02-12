# COMICWISE OPTIMIZED COMPREHENSIVE PLAN & PROMPT

---

## 1. Foundation & Environment

- **Follow the 40-task plan** (see `/tasks.md`, `/requirements.md`, `/design.md`)
- Use `.env.template` (60+ documented vars) and `.env.md` (full setup guide)
- Validate with `pnpm validate:env` and ensure `.env.local` is gitignored
- Reference: `docs/setup-env.md`, `src/lib/env.ts`

## 2. Architecture & Data Flow

- **Strict 3-layer pattern:**
  1. Zod schemas in `src/schemas/` (validation)
  2. Drizzle ORM in `src/database/queries/` and `src/database/mutations/`
  3. Server actions in `src/lib/actions/` (must start with "use server")
- Data flow: UI → Server Action (Zod, auth) → DAL → Drizzle → PostgreSQL
- Reference: `docs/architecture.md`, `.github/copilot-instructions.md`

## 3. RBAC & Security

- **RBAC:** Roles: user, moderator, admin (see `docs/rbac.md`)
- Use `verifyAdmin()` for admin-only actions
- All sensitive actions logged to audit table
- Zod validates all inputs; never hard-delete users/comments with children (soft delete pattern)
- Consistent error shape: `{ ok: false, error: { code, message } }`

## 4. MCP & Tooling

- **MCP servers:** 8 configured in `.vscode/mcp.json` (see `docs/mcp-setup.md`)
- Validate all servers with `scripts/verify-mcp-servers.ps1`
- Use `scripts/verify-vscode-config.ps1` to ensure VS Code Insiders and all recommended extensions are present

## 5. Development & Validation Workflow

### 5.1 Setup & Database

- `pnpm install`, copy `.env.template` → `.env.local`, fill required vars
- `pnpm db:push`, `pnpm db:seed`, `pnpm db:studio`

### 5.2 Code Quality

- `pnpm validate` (type-check, lint, test)
- `pnpm test` (unit), `pnpm test:e2e` (E2E)
- Use `pnpm build` for production validation

### 5.3 CI/CD & Deployment

- Ensure CI runs `pnpm validate` and all validation gates (see `/tasks.md`)
- Deploy via Vercel, follow `docs/deployment.md`

## 6. Prompt Safety & AI Agent Instructions

- Use the prompt safety review template in `COMICWISE-COMPREHENSIVE-PLAN.md`
- Review all `.prompt.md` and `.instructions.md` for:
  - Harmful, biased, or leaky content
  - Copyright/privacy risks
  - Adherence to conventions
- Ensure `.github/copilot-instructions.md` is up to date

## 7. Gap Analysis & Script Generation

- Compare plan steps and code samples with actual repo files
- Identify and generate missing scripts/configs (see `/tasks.md` for helper scripts, seed configs, etc.)

## 8. Validation Gates & Parallelization

- **Validation gates:** env validated, db seeded, type-check clean, validate clean, build clean, deployment verified
- **Parallel clusters:** Config files, UI/UX pages, code quality, documentation (see `/design.md`)

## 9. Code Samples & Automation

### PowerShell: verify-vscode-config.ps1

```powershell
# Install VS Code Insiders if missing
if (-not (Get-Command code-insiders -ErrorAction SilentlyContinue)) {
  Write-Host "Installing VS Code Insiders..."
  # Download and install logic here
}
# Read .vscode/extensions.json
$exts = Get-Content .vscode/extensions.json | ConvertFrom-Json
$recommendations = $exts.recommendations
$unwanted = $exts.unwantedRecommendations
foreach ($ext in $recommendations) { code-insiders --install-extension $ext }
foreach ($ext in $unwanted) { code-insiders --uninstall-extension $ext }
```

### PowerShell: verify-mcp-servers.ps1

```powershell
# Read .vscode/mcp.json
$servers = Get-Content .vscode/mcp.json | ConvertFrom-Json
foreach ($server in $servers) {
  # Check server status logic
  Write-Host "Checking server: $($server.name)"
  # ...
}
```

### .env.local Example

```
DATABASE_URL=postgres://user:pass@localhost:5432/comicr
NEXTAUTH_SECRET=your-secret
# ...other vars
```

## 10. Verification Checklist

- [ ] All scripts present and executable
- [ ] All config files present and valid
- [ ] All code samples tested
- [ ] All prompt/instructions files reviewed for safety
- [ ] All repo conventions followed
- [ ] CI/CD pipeline green
- [ ] MCP servers validated
- [ ] RBAC and security patterns enforced

## 11. Advanced Prompt Safety Review (Template)

See `COMICWISE-COMPREHENSIVE-PLAN.md` for the full prompt safety review and improvement template. Use the provided analysis framework for:

- Safety, bias, security, privacy, effectiveness, best practices, pattern analysis, technical robustness, performance, and educational insights.

## 12. References & Further Reading

- `/requirements.md`, `/tasks.md`, `/design.md`, `/docs/architecture.md`, `/docs/rbac.md`, `/docs/setup-env.md`, `/docs/deployment.md`, `/docs/mcp-setup.md`, `.github/copilot-instructions.md`, `COMICWISE-COMPREHENSIVE-PLAN.md`
- All code samples and checklists are verified against the current repo structure.

---
