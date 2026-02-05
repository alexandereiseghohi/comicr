# Optimize Prompt: Batch Fix All Validation, Build, and Test Errors/Warnings

**Project:** comicr (Next.js 16, TypeScript, pnpm)

---

## Objective

Batch fix all warnings, errors, and deprecation notices found during the execution of:

- pnpm db:seed
- pnpm validate:full
- pnpm build
- pnpm test
- pnpm test:e2e

---

## Process

1. **Collect and Summarize Issues**
   - Gather all errors, warnings, and deprecations from the output of the above commands.
   - Summarize and categorize by type (TypeScript, ESLint, build, seed data, test failures, deprecations) and severity (errors before warnings).

2. **Prioritize and Group Fixes**
   - Group issues by type and severity.
   - Address errors before warnings.

3. **Systematic Batch Fix**
   - Fix all codebase issues (TypeScript, ESLint, build, seed data, test failures, deprecations) according to project conventions and best practices.
   - Auto-format the entire codebase (run `pnpm lint:fix`).

4. **Validation**
   - Rerun all scripts to confirm all issues are resolved and output is warning-free.

5. **Documentation**
   - Document all fixes, referencing affected files and error types.
   - Update all relevant documentation (README, CHANGELOG, inline comments, architectural docs) if fixes impact usage, setup, or design.

6. **Commit**
   - Commit all fixes in a single batch with a clear summary in the commit message or PR description.

---

## Constraints

- Do not introduce new features or refactor unrelated code.
- Only fix issues surfaced by the validation/build/test commands and deprecation notices unless otherwise instructed.
- If any warnings are allowed to remain, document them and explain why.

---

## Success Criteria

- All scripts complete successfully with zero errors and zero warnings.
- All fixes are documented and traceable.
- The codebase remains consistent with project standards.

---

## Sample Execution Prompt

You are working in the comicr monorepo (Next.js 16, TypeScript, pnpm). Your task is to batch fix all errors, warnings, and deprecations found during:

- pnpm db:seed
- pnpm validate:full
- pnpm build
- pnpm test
- pnpm test:e2e

Follow this process:

1. Collect and summarize all errors, warnings, and deprecations from the output of these commands.
2. Prioritize and group issues by type (TypeScript, ESLint, build, seed data, test failures, deprecations) and severity (errors before warnings).
3. Systematically fix all issues in the codebase, following project conventions and best practices.
4. Auto-format the entire codebase (run pnpm lint:fix).
5. Rerun all scripts to confirm that all warnings and errors are resolved.
6. Document all fixes made, referencing affected files and error types.
7. Update all relevant documentation (README, CHANGELOG, inline comments, architectural docs) if any fixes impact usage, setup, or architecture.
8. Commit all fixes in a single batch with a clear summary.

**Constraints:**

- Do not introduce new features or refactor unrelated code.
- Only fix issues surfaced by the validation/build/test commands and deprecation notices unless otherwise instructed.
- If any warnings are allowed to remain, document them and explain why.

**Success Criteria:**

- All scripts complete successfully with zero errors and zero warnings.
- All fixes are documented and traceable.
- The codebase remains consistent with project standards.
