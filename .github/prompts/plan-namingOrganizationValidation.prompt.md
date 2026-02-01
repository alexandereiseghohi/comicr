## Plan: Naming Conventions, Organization, and Validation for Prompts & Server Components

This plan confirms naming conventions, organizes modular server components for maintainability/scalability, and adds optional automated checks for client imports and action implementation.

### Steps

1. **Naming Conventions**
   - Prompt files: `[page|subpage].prompt.md` (e.g., `login.prompt.md`, `admin-users.prompt.md`)
   - Server components: `[Feature]Server.tsx` or `[Feature]/Server.tsx` (e.g., `AuthServer.tsx`, `Profile/Server.tsx`)
2. **Organization**
   - Place prompt files alongside their respective page/subpage or in a dedicated `prompts/` directory, mirroring the app structure.
   - Place server components in a `server/` or feature-specific subfolder within `src/components/` or `src/app/[feature]/`.
   - Use clear folder structure: one server component per feature, grouped logically.
3. **Automated Checks/Tests**
   - Add a test script (e.g., in `tests/unit/`) to:
     - Verify all client components are imported in their server component.
     - Check that all declared actions in prompts are implemented in server components.
   - Optionally, use TypeScript type checks and/or a linter rule for import validation.

### Further Considerations

1. Review if prompt files should be colocated with pages or centralized.
2. Decide on test framework (e.g., Vitest) for automated checks.
3. Document conventions in `README.md` for future contributors.
