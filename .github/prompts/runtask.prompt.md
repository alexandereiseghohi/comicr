---
agent: "agent"
description: "Complete all phases, tasks, subtasks, and actions described in tasks_to_prompt.md. Do not stop until all tasks are complete or there are no next steps. Use industry standards and best practices."
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    "github/*",
    "pylance-mcp-server/*",
    "context7/*",
    "filesystem-ops/*",
    "mcp_docker/*",
    "sequential-thinking/*",
    "github/*",
    "io.github.upstash/context7/*",
    "io.github.vercel/next-devtools-mcp/*",
    "neondatabase/mcp-server-neon/*",
    vscode.mermaid-chat-features/renderMermaidDiagram,
    cweijan.vscode-postgresql-client2/dbclient-getDatabases,
    cweijan.vscode-postgresql-client2/dbclient-getTables,
    cweijan.vscode-postgresql-client2/dbclient-executeQuery,
    github.vscode-pull-request-github/issue_fetch,
    github.vscode-pull-request-github/suggest-fix,
    github.vscode-pull-request-github/searchSyntax,
    github.vscode-pull-request-github/doSearch,
    github.vscode-pull-request-github/renderIssues,
    github.vscode-pull-request-github/activePullRequest,
    github.vscode-pull-request-github/openPullRequest,
    ms-azuretools.vscode-containers/containerToolsConfig,
    ms-python.python/getPythonEnvironmentInfo,
    ms-python.python/getPythonExecutableCommand,
    ms-python.python/installPythonPackage,
    ms-python.python/configurePythonEnvironment,
    todo,
  ]

model: "GPT-4.1"
---

# Prompt: Run All Tasks to Completion

## Objective

Complete all phases, tasks, subtasks, and actions as described in `tasks_to_prompt.md`. Do not stop until every task is finished or there are no further actionable steps. Follow industry standards and best practices for automation, validation, and documentation.

## Requirements

- Use the breakdown in `tasks_to_prompt.md` as the authoritative task list.
- Track progress using a structured todo list, updating status after each step.
- Execute tasks in logical order, prioritizing prerequisites and dependencies.
- For each phase:
  - Validate environment, scripts, configs, and documentation.
  - Run setup, validation, and automation commands as specified.
  - Review and optimize prompt/instructions files for safety and actionability.
  - Perform gap analysis and generate/update missing scripts/configs.
  - Verify validation gates, parallelization clusters, and code samples.
  - Ensure all checks pass and documentation is up to date.
  - Apply advanced prompt safety review and document findings.
  - Confirm all references and links are present.
- Do not terminate until all tasks are complete or no further steps remain.
- Use best practices for error handling, logging, and reporting.
- Document progress and outcomes for each phase.

## Agent Instructions

- Begin by reading `tasks_to_prompt.md` and initializing the todo list.
- Mark each task as in-progress before execution, then completed after validation.
- Use available tools for file operations, code validation, testing, and automation.
- If a task is blocked or cannot be completed, document the reason and proceed to the next actionable item.
- Maintain clear, concise logs and documentation throughout the process.
- Apply industry standards for code quality, security, and prompt safety.

## Completion Criteria

- All tasks, subtasks, and actions in `tasks_to_prompt.md` are completed, validated, or documented as blocked.
- No further actionable steps remain.
- Final report includes progress, outcomes, and any recommendations for future refinement.

---

**Prompt generated on: 2026-02-12**
**Repo: comicr**
**Branch: main**
