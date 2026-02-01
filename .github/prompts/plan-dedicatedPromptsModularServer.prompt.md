## Plan: Dedicated Prompts, Modular Server Components, and Client Import Validation

Every page and subpage will have a dedicated prompt file based on `plan-setupnewPrompt.prompt.md`. Modular server components will be created per feature to manage UI and actions, ensuring all client components are correctly imported and actions are implemented as intended.

### Steps

1. Enumerate all pages and subpages in `src/app/` and subfolders.
2. For each page/subpage:
   - Create or update a `.prompt.md` file using the standard template, defining its features and actions.
3. For each feature, scaffold a modular server component:
   - Implement UI management and desired actions.
   - Import all relevant client components for that feature.
   - Validate imports and action implementations.
4. Review and delete any deprecated or obsolete prompt files.
5. Document all changes and summarize for review.

### Further Considerations

1. Confirm naming conventions for prompt and server component files.
2. Ensure server components are organized for maintainability and scalability.
3. Optionally, add automated checks/tests for import and action validation.
