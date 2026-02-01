## Plan: Documentation, Pre-commit Hook, and CI Maintenance

Document the prompts sync and test process in `README.md`, add an optional pre-commit hook for local enforcement, and establish a process for ongoing CI updates.

### Steps

1. Update `README.md`:
   - Add clear instructions for running the prompts sync script and tests (Vitest, Playwright).
   - Document the CI workflow and how it enforces sync and test status.
   - Explain how to add new prompts and keep the `prompts/` directory in sync with `src/app/`.
2. Add a pre-commit hook (e.g., using Husky or a simple script):
   - Run the prompts sync script and tests before allowing commits.
   - Block commits if sync or tests fail, with clear error messages.
3. Review and update CI configuration:
   - Regularly revisit `.github/workflows/ci.yml` to add new test jobs or sync steps as features/tests grow.
   - Document the update process in the `README.md` for maintainers.

### Further Considerations

1. Ensure all contributors are aware of the sync/test requirements.
2. Periodically audit the prompts/app structure and CI for drift or gaps.
3. Encourage PRs to include updates to tests, prompts, and CI as needed.

Ready to proceed with these documentation and automation improvements.
