import { ProjectAnswers } from '../commands/init';

export class ConfigGenerator {
  generate(answers: ProjectAnswers): string {
    const isLayered = answers.architecture.startsWith('Layered');

    const folderStructure = isLayered
      ? `src/
  routes/      # Express route handlers
  services/    # Business logic
  middleware/  # Express middleware
  types/       # Shared TypeScript types
  index.ts     # Entry point`
      : `src/
  index.ts     # Entry point
  handlers.ts  # Route handlers
  types.ts     # TypeScript types`;

    const testingSection = answers.testing
      ? `- Include Jest configuration (jest.config.ts or jest.config.js)
- Write unit tests for all service functions
- Test file naming: *.test.ts
- Include at least one working test`
      : `- No testing setup required`;

    const lintingSection = answers.linting
      ? `- Include .eslintrc.json
- Include .prettierrc
- Configure for TypeScript`
      : `- No linting setup required`;

    return `# Project Specification

## Project Name
${answers.projectName}

## Project Type
${answers.projectType}

## Architecture
${isLayered ? 'Layered architecture: routes → services → data layers' : 'Minimal flat structure: all logic in src/'}

## Code Style Rules
- TypeScript strict mode enabled
- Use async/await (no raw Promise chains)
- No \`any\` types
- Explicit return types on all exported functions
- Single quotes for strings
- 2-space indentation
- Named exports preferred over default exports

## Folder Structure Rules
${folderStructure}

## Testing Requirements
${testingSection}

## Linting Requirements
${lintingSection}

## Output Contract (JSON only)
- Return ONLY valid JSON — no markdown, no explanations, no backticks, no code fences
- All file paths must be relative (e.g. "src/index.ts", "package.json")
- No path traversal: never use "../" or absolute paths
- Include ALL files needed to run the project from scratch
- Files must be complete — no placeholders, no "// TODO", no "// ..."
- Schema:
  {
    "project_name": "<string>",
    "files": [{ "path": "<string>", "content": "<string>" }]
  }
`;
  }
}
