import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { ConfigGenerator } from '../services/configGenerator';
import { PromptBuilder } from '../services/promptBuilder';
import { ClaudeService } from '../services/claude';
import { JsonValidator } from '../services/jsonValidator';
import { FileWriter } from '../services/fileWriter';

interface InitOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export interface ProjectAnswers {
  projectName: string;
  projectType: string;
  architecture: string;
  testing: boolean;
  linting: boolean;
}

export class InitCommand {
  private dryRun: boolean;
  private verbose: boolean;

  constructor(options: InitOptions) {
    this.dryRun = options.dryRun ?? false;
    this.verbose = options.verbose ?? false;
  }

  async run(): Promise<void> {
    console.log('Welcome to Forge — AI-powered project generator\n');

    const answers = await inquirer.prompt<ProjectAnswers>([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: (v: string) =>
          /^[a-z0-9][a-z0-9-_]*$/.test(v) ||
          'Use lowercase letters, numbers, hyphens, or underscores (must start with letter or number)',
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'Project type:',
        choices: ['Node.js REST API'],
      },
      {
        type: 'list',
        name: 'architecture',
        message: 'Architecture style:',
        choices: [
          'Layered (routes → services → data)',
          'Minimal (flat structure)',
        ],
      },
      {
        type: 'confirm',
        name: 'testing',
        message: 'Include testing setup?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'linting',
        message: 'Include linting setup?',
        default: true,
      },
    ]);

    const outputDir = path.resolve(process.cwd(), answers.projectName);

    if (!this.dryRun && fs.existsSync(outputDir)) {
      console.error(`\nError: Directory "${answers.projectName}" already exists.`);
      process.exit(1);
    }

    this.log('Generating claude.md...');
    const configGen = new ConfigGenerator();
    const claudeMd = configGen.generate(answers);

    this.log('Building prompt...');
    const promptBuilder = new PromptBuilder();
    const prompt = promptBuilder.build(answers, claudeMd);

    if (this.verbose) {
      console.log('\n--- Prompt (verbose) ---\n');
      console.log(prompt);
      console.log('\n------------------------\n');
    }

    console.log('\nCalling Claude... (this may take a moment)\n');
    const claudeService = new ClaudeService(this.verbose);
    const rawOutput = claudeService.call(prompt);

    this.log('Validating response...');
    const validator = new JsonValidator();
    const result = validator.validate(rawOutput);

    if (this.dryRun) {
      console.log('\n--- Dry Run: Files that would be generated ---\n');
      for (const file of result.files) {
        console.log(`  ${file.path}`);
      }
      console.log(`\nTotal: ${result.files.length} file(s)`);
      console.log('\nclaude.md would be written to:', path.join(answers.projectName, 'claude.md'));
      return;
    }

    this.log('Writing files...');
    const writer = new FileWriter(outputDir, this.verbose);
    writer.write(result.files);
    writer.writeText('claude.md', claudeMd);

    console.log(`\nProject "${result.project_name}" created at ./${answers.projectName}/`);
    console.log(`\nNext steps:\n  cd ${answers.projectName}\n  npm install\n  npm run dev`);
  }

  private log(msg: string): void {
    if (this.verbose) {
      console.log(`[forge] ${msg}`);
    }
  }
}
