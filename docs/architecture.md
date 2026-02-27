# Architecture

## Overview

Forge is a thin CLI orchestrator. It collects user input, builds a deterministic prompt, delegates generation to Claude, validates the response, and writes files safely.

There is no server, no database, no plugin system, and no networking beyond what the Claude CLI itself performs.

---

## Components

### `src/index.ts` — CLI entry

Sets up [commander](https://github.com/tj/commander.js). Registers the `init` command and passes parsed options to `InitCommand`.

```
forge init [--dry-run] [--verbose]
```

---

### `src/commands/init.ts` — InitCommand

Orchestrates the full `forge init` flow:

1. Presents interactive prompts via [inquirer](https://github.com/SBoudrias/Inquirer.js)
2. Checks the target directory does not already exist (unless `--dry-run`)
3. Calls each service in sequence
4. Prints results or writes files

---

### `src/services/configGenerator.ts` — ConfigGenerator

Converts user answers into a structured `claude.md` file.

The `claude.md` serves as a machine-readable project specification. It defines:
- Project type and architecture
- Code style rules
- Folder structure
- Testing and linting requirements
- The JSON output contract Claude must follow

This file is also written into the generated project, so Claude's constraints are preserved for future use.

---

### `src/services/promptBuilder.ts` — PromptBuilder

Builds the final prompt string sent to Claude. Key design decisions:

- Opens with a strong role declaration
- Lists critical JSON-only output constraints before the spec
- Embeds the full `claude.md` inline
- Restates the required schema
- Adds per-project file requirements (testing, linting, etc.)
- Ends with a direct instruction to output JSON immediately

The prompt is designed to be deterministic and to minimise hallucinated or missing files.

---

### `src/services/claude.ts` — ClaudeService

Calls the Claude CLI as a subprocess using Node's `execFileSync`:

```
claude --print
```

- The prompt is passed via `stdin`
- Output is captured from `stdout`
- `maxBuffer` is set to 50 MB to handle large projects
- Timeout is 2 minutes
- If the `claude` binary is not found (`ENOENT`), a clear installation message is shown

No streaming. No token handling. The Claude CLI manages authentication entirely.

---

### `src/services/jsonValidator.ts` — JsonValidator

Two-step validation:

1. **JSON parse** — if Claude wrapped output in markdown fences despite instructions, they are stripped before parsing. If parsing still fails, the error is shown and the process exits.

2. **Schema validation via [zod](https://github.com/colinhacks/zod)** — enforces:
   ```
   { project_name: string, files: [{ path: string, content: string }] }
   ```

3. **Path security checks** — every file path in the response is checked:
   - Absolute paths are rejected
   - Paths that resolve to `../` (path traversal) are rejected

---

### `src/services/fileWriter.ts` — FileWriter

Writes files to the target project directory:

- Creates the root directory and any nested subdirectories
- Before writing each file, resolves the absolute path and confirms it starts with the project root — a second layer of path traversal protection independent of the validator
- `--verbose` mode logs each file as it is written

---

## Data Flow

```
User input (inquirer)
        │
        ▼
ConfigGenerator → claude.md (string)
        │
        ▼
PromptBuilder → prompt (string)
        │
        ▼
ClaudeService → raw output (string)
        │
        ▼
JsonValidator → ProjectOutput { project_name, files[] }
        │
        ▼
FileWriter → files on disk
```

---

## Error Strategy

- All errors exit the process immediately with a clear message (`process.exit(1)`)
- No silent failures
- Invalid JSON: show raw output if small, prompt to use `--verbose` if large
- Path violations: print the offending path and exit
- Claude CLI not found: print installation URL and exit

---

## What Is Intentionally Not Here

| Feature | Reason |
|---|---|
| Streaming responses | Adds complexity; Claude CLI does not expose streaming in `--print` mode |
| Multiple AI providers | Premature abstraction for MVP |
| Plugin system | YAGNI for now |
| Project history / database | Future SaaS concern |
| Backend server | CLI-only MVP |
| Telemetry | Not needed and a privacy concern |
| Batching / parallel file generation | Adds complexity with marginal MVP benefit |
