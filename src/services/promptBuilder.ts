import { ProjectAnswers } from '../commands/init';

export class PromptBuilder {
  build(answers: ProjectAnswers, claudeMd: string): string {
    const extras: string[] = [];
    if (answers.testing) extras.push('- Include Jest setup and at least one working test file');
    if (answers.linting) extras.push('- Include .eslintrc.json and .prettierrc');

    return `You are a senior software engineer generating a complete ${answers.projectType} project.

CRITICAL INSTRUCTIONS — READ CAREFULLY:
1. You MUST respond with ONLY valid JSON. Nothing else.
2. Do NOT include markdown, backticks, code fences, or prose of any kind.
3. Do NOT add any text before or after the JSON object.
4. Invalid JSON will cause the system to fail and the project will not be created.
5. Every file must be complete — no "// TODO", no placeholders, no "..." truncation.

PROJECT SPECIFICATION:
${claudeMd}

REQUIRED OUTPUT SCHEMA:
{
  "project_name": "<string: the project name>",
  "files": [
    {
      "path": "<string: relative file path, e.g. src/index.ts>",
      "content": "<string: full file content>"
    }
  ]
}

FILE REQUIREMENTS:
- All paths must be relative (e.g. "src/index.ts", "package.json")
- Never use "../" or absolute paths — they will be rejected as a security violation
- Include package.json with all required dependencies and scripts
- Include tsconfig.json configured for strict TypeScript
- Include README.md with setup instructions
${extras.join('\n')}
- Every listed file must have complete, working content

OUTPUT ONLY THE JSON OBJECT NOW:`;
  }
}
