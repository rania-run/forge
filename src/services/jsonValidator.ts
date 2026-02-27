import { z } from 'zod';
import path from 'path';

const FileEntrySchema = z.object({
  path: z.string().min(1, 'File path must not be empty'),
  content: z.string(),
});

const ProjectOutputSchema = z.object({
  project_name: z.string().min(1, 'project_name must not be empty'),
  files: z.array(FileEntrySchema).min(1, 'files array must not be empty'),
});

export type ProjectOutput = z.infer<typeof ProjectOutputSchema>;

export class JsonValidator {
  validate(raw: string): ProjectOutput {
    const cleaned = this.stripMarkdownFences(raw);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('\nError: Claude returned invalid JSON.');
      if (raw.length < 3000) {
        console.error('Raw output received:\n');
        console.error(raw);
      } else {
        console.error(`(Output was ${raw.length} chars — run with --verbose to inspect)`);
      }
      process.exit(1);
    }

    const result = ProjectOutputSchema.safeParse(parsed);
    if (!result.success) {
      console.error('\nError: Claude response does not match expected schema.');
      console.error(result.error.format());
      process.exit(1);
    }

    for (const file of result.data.files) {
      this.validatePath(file.path);
    }

    return result.data;
  }

  private stripMarkdownFences(raw: string): string {
    // Handle ```json ... ``` or ``` ... ``` wrappers
    return raw
      .replace(/^```(?:json)?\s*\n?/m, '')
      .replace(/\n?```\s*$/m, '')
      .trim();
  }

  private validatePath(filePath: string): void {
    if (path.isAbsolute(filePath)) {
      console.error(`\nSecurity error: absolute path rejected: "${filePath}"`);
      process.exit(1);
    }
    const normalized = path.normalize(filePath);
    if (normalized.startsWith('..')) {
      console.error(`\nSecurity error: path traversal rejected: "${filePath}"`);
      process.exit(1);
    }
  }
}
