# Forge

> Generate complete software projects from scratch using Claude.

Forge is an open-source CLI tool that turns a few prompts into a fully scaffolded, ready-to-run project. It calls the [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) locally — no API keys required, no data sent to any server.

---

## Requirements

- Node.js 18+
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

Verify Claude CLI is available:

```bash
claude --version
```

---

## Installation

### From source

```bash
git clone https://github.com/raniakthiri/forge.git
cd forge
npm install
npm run build
npm link        # makes `forge` available globally
```

---

## Usage

### `forge init`

Run this from the **parent directory** where you want your project created. Forge will create a new folder named after your project.

```bash
# Navigate to wherever you keep your projects
cd ~/projects

# Forge creates ~/projects/todo-list/ for you
forge init
```

You will be asked:

| Question | Options |
|---|---|
| Project name | any lowercase name |
| Project type | Node.js REST API |
| Architecture style | Layered / Minimal |
| Include testing? | yes / no |
| Include linting? | yes / no |

Forge will then:
1. Generate a `claude.md` spec file
2. Build a structured prompt
3. Call Claude and receive a full project as JSON
4. Validate the response
5. Write all files to `./<project-name>/`

**Example:**

```
~/projects $ forge init

Welcome to Forge — AI-powered project generator

? Project name: my-api
? Project type: Node.js REST API
? Architecture style: Layered (routes → services → data)
? Include testing setup? Yes
? Include linting setup? Yes

Calling Claude... (this may take a moment)

Project "my-api" created at ./my-api/

Next steps:
  cd my-api      ← Forge created this folder for you
  npm install
  npm run dev
```

---

### Flags

| Flag | Description |
|---|---|
| `--dry-run` | Preview the list of files that would be generated without writing anything |
| `--verbose` | Print the full prompt sent to Claude and log each file as it is written |

**Dry run example:**

```bash
forge init --dry-run
```

```
--- Dry Run: Files that would be generated ---

  package.json
  tsconfig.json
  src/index.ts
  src/routes/health.ts
  src/services/healthService.ts
  README.md

Total: 6 file(s)
claude.md would be written to: my-api/claude.md
```

**Verbose example:**

```bash
forge init --verbose
```

---

## How it works

```
forge init
    │
    ├─ asks questions (inquirer)
    │
    ├─ generates claude.md (ConfigGenerator)
    │
    ├─ builds prompt (PromptBuilder)
    │
    ├─ calls `claude --print` via stdin (ClaudeService)
    │
    ├─ validates JSON response with zod (JsonValidator)
    │
    └─ writes files safely to disk (FileWriter)
```

See [docs/architecture.md](docs/architecture.md) for a full breakdown.

---

## Project Structure

```
forge/
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── commands/
│   │   └── init.ts              # `forge init` command
│   └── services/
│       ├── configGenerator.ts   # Generates claude.md from answers
│       ├── promptBuilder.ts     # Builds the Claude prompt
│       ├── claude.ts            # Calls `claude --print` via child_process
│       ├── jsonValidator.ts     # Validates response schema with zod
│       └── fileWriter.ts        # Writes files, prevents path traversal
├── docs/
│   └── architecture.md
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Security

- Path traversal (`../`) is rejected at two layers: JSON validation and file writing
- Absolute paths in generated file lists are rejected
- Generated code is never executed
- No tokens or credentials are handled — Claude CLI manages authentication

---

## Contributing

Issues and pull requests are welcome. See [docs/contributing.md](docs/contributing.md).

---

## License

MIT
