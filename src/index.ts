#!/usr/bin/env node
import { Command } from 'commander';
import { InitCommand } from './commands/init';

const program = new Command();

program
  .name('forge')
  .description('Generate complete software projects from scratch using Claude')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new project')
  .option('--dry-run', 'Preview files without writing to disk')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const cmd = new InitCommand(options);
    await cmd.run();
  });

program.parse();
