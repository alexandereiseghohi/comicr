# AGENTS.md

## Project Overview

The Comicr repository is a community-driven collection of custom agents, prompts, and instructions designed to enhance GitHub Copilot experiences across various domains, languages, and use cases. The project includes:

- **Agents** - Specialized GitHub Copilot agents that integrate with MCP servers
- **Prompts** - Task-specific prompts for code generation and problem-solving
- **Instructions** - Coding standards and best practices applied to specific file patterns
- **Skills** - Self-contained folders with instructions and bundled resources for specialized tasks
- **Collections** - Curated collections organized around specific themes and workflows

## Repository Structure

```
.
├── agents/           # Custom GitHub Copilot agent definitions (.agent.md files)
├── prompts/          # Task-specific prompts (.prompt.md files)
├── instructions/     # Coding standards and guidelines (.instructions.md files)
├── skills/           # Agent Skills folders (each with SKILL.md and optional bundled assets)
├── collections/      # Curated collections of resources (.md files)
├── docs/             # Documentation for different resource types
├── eng/              # Build and automation scripts
└── scripts/          # Utility scripts
```

## Setup Commands

```bash
# Install dependencies
pnpm ci

# Build the project (generates README.md)
pnpm run build

# Validate collection manifests
pnpm run collection:validate

# Create a new collection
pnpm run collection:create -- --id <collection-id> --tags <tags>

# Validate agent skills
pnpm run skill:validate

# Create a new skill
pnpm run skill:create -- --name <skill-name>
```

## Development Workflow

### Working with Agents, Prompts, Instructions, and Skills

All agent files (`*.agent.md`), prompt files (`*.prompt.md`), and instruction files (`*.instructions.md`) must include proper markdown front matter. Agent Skills are folders containing a `SKILL.md` file with frontmatter and optional bundled assets:

#### Agent Files (\*.agent.md)

- Must have `description` field (wrapped in single quotes)
- File names should be lower case with words separated by hyphens
- Recommended to include `tools` field
- Strongly recommended to specify `model` field

#### Prompt Files (\*.prompt.md)

- Must have `agent` field (value should be `'agent'` wrapped in single quotes)
- Must have `description` field (wrapped in single quotes, not empty)
- File names should be lower case with words separated by hyphens
- Recommended to specify `tools` if applicable
- Strongly recommended to specify `model` field

#### Instruction Files (\*.instructions.md)

- Must have `description` field (wrapped in single quotes, not empty)
- Must have `applyTo` field specifying file patterns (e.g., `'**.js, **.ts'`)
- File names should be lower case with words separated by hyphens

#### Agent Skills (skills/\*/SKILL.md)

- Each skill is a folder containing a `SKILL.md` file
- SKILL.md must have `name` field (lowercase with hyphens, matching folder name, max 64 characters)
- SKILL.md must have `description` field (wrapped in single quotes, 10-1024 characters)
- Folder names should be lower case with words separated by hyphens
- Skills can include bundled assets (scripts, templates, data files)
- Bundled assets should be referenced in the SKILL.md instructions
- Asset files should be reasonably sized (under 5MB per file)
- Skills follow the [Agent Skills specification](https://agentskills.io/specification)
