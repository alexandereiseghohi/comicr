## Plan: Standardize, Scaffold, and Clean Prompt Files; Create Server Component for UI Actions

Update all prompt files using `plan-setupnewPrompt.prompt.md` as the template, scaffold missing prompts for all pages, and set up a server component to manage UI actions and import all client components. Remove any deprecated or obsolete prompt files.

### Steps

1. Use `plan-setupnewPrompt.prompt.md` as the standard template for all prompt files.
2. Identify all pages in the project (e.g., in `src/app/` and subfolders).
3. For each page:
   - Create or update a `.prompt.md` file describing its features, actions, and UI requirements.
4. Review the workspace for any deprecated or obsolete prompt files and delete them.
5. Scaffold a new server component to manage UI actions for all pages:
   - Implement logic to handle desired actions.
   - Import all relevant client components for each page.
6. Document all changes and summarize updates for review.

### Further Considerations

1. Confirm if every page/subpage needs a dedicated prompt, or only top-level routes.
2. Should the server component be a single file or modular per feature?
3. Validate that all client components are correctly imported and actions are implemented as intended.
