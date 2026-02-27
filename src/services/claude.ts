import { execFileSync } from 'child_process';

export class ClaudeService {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  call(prompt: string): string {
    if (this.verbose) {
      console.log('[forge] Invoking claude CLI...');
    }

    try {
      const output = execFileSync('claude', ['--print'], {
        input: prompt,
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024, // 50 MB — generous for large projects
        timeout: 120_000,            // 2 minutes
      });

      return output.trim();
    } catch (err: unknown) {
      if (err instanceof Error) {
        const nodeErr = err as NodeJS.ErrnoException;
        if (nodeErr.code === 'ENOENT') {
          console.error('\nError: "claude" CLI not found.');
          console.error('Install and authenticate Claude CLI first:');
          console.error('  https://docs.anthropic.com/en/docs/claude-code\n');
          process.exit(1);
        }
        // execFileSync throws with stderr in message when process exits non-zero
        if (this.verbose && nodeErr.message) {
          console.error('[forge] claude stderr:', nodeErr.message);
        }
      }
      console.error('\nError: Claude CLI call failed. Run with --verbose for details.');
      process.exit(1);
    }
  }
}
