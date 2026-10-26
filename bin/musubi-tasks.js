#!/usr/bin/env node

/**
 * MUSUBI Task Breakdown System CLI
 *
 * Breaks down design into actionable implementation tasks
 * Complies with Article I-IX and P0-P3 priority labels
 *
 * Usage:
 *   musubi-tasks init <feature>              # Initialize task breakdown
 *   musubi-tasks add <title>                 # Add task with interactive prompts
 *   musubi-tasks list                        # List all tasks
 *   musubi-tasks update <id> <status>        # Update task status
 *   musubi-tasks validate                    # Validate task breakdown
 *   musubi-tasks graph                       # Generate dependency graph
 */

const { Command } = require('commander');
const chalk = require('chalk');
const TasksGenerator = require('../src/generators/tasks');

let inquirer;

/**
 * Initialize inquirer (ESM module in v9+)
 */
async function getInquirer() {
  if (!inquirer) {
    inquirer = (await import('inquirer')).default;
  }
  return inquirer;
}

const program = new Command();

program
  .name('musubi-tasks')
  .description('MUSUBI Task Breakdown System - Break down design into actionable tasks')
  .version('1.0.0');

// Initialize task breakdown
program
  .command('init <feature>')
  .description('Initialize task breakdown document from design')
  .option('-o, --output <path>', 'Output directory', 'storage/tasks')
  .option('-a, --author <name>', 'Author name')
  .option('--project <name>', 'Project name')
  .option('-d, --design <path>', 'Design document directory', 'storage/design')
  .option('-r, --requirements <path>', 'Requirements document directory', 'storage/specs')
  .option('--dry-run', 'Show what would be created without writing files')
  .option('--verbose', 'Show detailed output')
  .option('--json', 'Output result as JSON')
  .action(async (feature, options) => {
    try {
      if (!options.json && !options.dryRun) {
        console.log(chalk.bold(`\n📋 Initializing task breakdown for: ${feature}\n`));
      }

      if (options.verbose && !options.json) {
        console.log(chalk.dim('Options:'));
        console.log(chalk.dim(`  Output: ${options.output}`));
        console.log(chalk.dim(`  Author: ${options.author || 'Not specified'}`));
        console.log(chalk.dim(`  Project: ${options.project || 'Not specified'}`));
        console.log(chalk.dim(`  Design: ${options.design}`));
        console.log(chalk.dim(`  Requirements: ${options.requirements}`));
        console.log(chalk.dim(`  Dry run: ${options.dryRun || false}`));
        console.log();
      }

      const generator = new TasksGenerator(process.cwd());
      const result = await generator.init(feature, options);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.dryRun) {
        console.log(chalk.yellow('🔍 Dry run - No files created'));
        console.log(chalk.dim(`\n  Would create: ${result.path}`));
        console.log(chalk.dim('  Template: Task breakdown document'));
        console.log(chalk.dim(`  Feature: ${feature}`));
        console.log();
      } else {
        console.log(chalk.green('\n✓ Task breakdown document created'));
        console.log(chalk.dim(`  ${result.path}`));
        console.log();
        console.log(chalk.bold('Next steps:'));
        console.log(chalk.dim(`  1. Edit ${result.path}`));
        console.log(chalk.dim('  2. Add tasks: musubi-tasks add <title>'));
        console.log(chalk.dim('  3. Validate: musubi-tasks validate'));
        console.log(chalk.dim('  4. Generate graph: musubi-tasks graph'));
        console.log();
      }

      process.exit(0);
    } catch (error) {
      if (options.json) {
        console.error(JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
      } else {
        console.error(chalk.red('✗ Error:'), error.message);
        if (options.verbose) {
          console.error(chalk.dim(error.stack));
        }
      }
      process.exit(1);
    }
  });

// Add task
program
  .command('add <title>')
  .description('Add new task; prompts for every detail not given as an option')
  .option('-f, --file <path>', 'Task breakdown file path')
  .option('-p, --priority <level>', 'Priority (P0|P1|P2|P3)')
  .option('--points <n>', 'Story points (1|2|3|5|8|13)')
  .option('--hours <n>', 'Estimated hours')
  .option('-a, --assignee <name>', 'Assignee')
  .option('-d, --description <text>', 'Task description')
  .option('-r, --requirements <ids>', 'Requirements, comma-separated REQ ids')
  .option('-c, --acceptance <list>', 'Acceptance criteria, semicolon-separated')
  .option('--depends <ids>', 'Dependencies, comma-separated TASK ids')
  .action(async (title, options) => {
    try {
      console.log(chalk.bold(`\n📝 Adding task: ${title}\n`));

      const generator = new TasksGenerator(process.cwd());

      // Find task file
      let taskFile = options.file;
      if (!taskFile) {
        const files = await generator.findTaskFiles();
        if (files.length === 0) {
          console.error(chalk.red('✗ No task files found'));
          console.log(chalk.dim('  Run: musubi-tasks init <feature>'));
          process.exit(1);
        }

        if (files.length === 1) {
          taskFile = files[0];
        } else {
          const inquirerInst = await getInquirer();
          const answer = await inquirerInst.prompt([
            {
              type: 'list',
              name: 'file',
              message: 'Select task file:',
              choices: files,
            },
          ]);
          taskFile = answer.file;
        }
      }

      // Ask only for what the options do not give; with every option the command runs unattended
      const inquirerInst2 = await getInquirer();
      const answers = await inquirerInst2.prompt([
        {
          type: 'list',
          name: 'priority',
          when: () => options.priority === undefined,
          message: 'Task priority:',
          choices: [
            { name: 'P0 (Critical - Launch Blocker)', value: 'P0' },
            { name: 'P1 (High - Important)', value: 'P1' },
            { name: 'P2 (Medium - Nice to have)', value: 'P2' },
            { name: 'P3 (Low - Future)', value: 'P3' },
          ],
          default: 'P1',
        },
        {
          type: 'list',
          name: 'storyPoints',
          when: () => options.points === undefined,
          message: 'Story points (Fibonacci):',
          choices: ['1', '2', '3', '5', '8', '13'],
          default: '3',
        },
        {
          type: 'input',
          name: 'estimatedHours',
          when: () => options.hours === undefined,
          message: 'Estimated hours:',
          default: '4',
          validate: input => !isNaN(input) || 'Must be a number',
        },
        {
          type: 'input',
          name: 'assignee',
          when: () => options.assignee === undefined,
          message: 'Assignee (optional):',
          default: '[Unassigned]',
        },
        {
          type: 'input',
          name: 'description',
          when: () => options.description === undefined,
          message: 'Task description:',
          validate: input => input.length > 0 || 'Description is required',
        },
        {
          type: 'input',
          name: 'requirements',
          when: () => options.requirements === undefined,
          message: 'Requirements (comma-separated REQ-XXX-NNN):',
        },
        {
          type: 'input',
          name: 'acceptance',
          when: () => options.acceptance === undefined,
          message: 'Acceptance criteria (semicolon-separated):',
        },
        {
          type: 'input',
          name: 'dependencies',
          when: () => options.depends === undefined,
          message: 'Dependencies (comma-separated TASK-XXX):',
        },
      ]);

      const pick = (option, answer) => (option !== undefined ? option : answer);
      const list = (value, separator) =>
        (value || '')
          .split(separator)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      const task = {
        title,
        priority: pick(options.priority, answers.priority),
        storyPoints: parseInt(pick(options.points, answers.storyPoints)),
        estimatedHours: parseFloat(pick(options.hours, answers.estimatedHours)),
        assignee: pick(options.assignee, answers.assignee),
        status: 'Not Started',
        description: pick(options.description, answers.description),
        requirements: list(pick(options.requirements, answers.requirements), ','),
        acceptance: list(pick(options.acceptance, answers.acceptance), ';'),
        dependencies: list(pick(options.depends, answers.dependencies), ','),
      };

      const result = await generator.addTask(taskFile, task);

      console.log(chalk.green('\n✓ Task added:'));
      console.log(chalk.dim(`  TASK-${result.id}: ${result.title}`));
      console.log(
        chalk.dim(
          `  Priority: ${result.priority}, Points: ${result.storyPoints}, Hours: ${result.estimatedHours}`
        )
      );
      console.log();

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

// List all tasks
program
  .command('list')
  .description('List all tasks')
  .option('-f, --file <path>', 'Specific task file')
  .option('--format <type>', 'Output format (table|json|markdown)', 'table')
  .option('--priority <level>', 'Filter by priority (P0|P1|P2|P3)')
  .option('--status <status>', 'Filter by status')
  .action(async options => {
    try {
      console.log(chalk.bold('\n📋 Task List\n'));

      const generator = new TasksGenerator(process.cwd());
      const result = await generator.list(options);

      if (result.tasks.length === 0) {
        console.log(chalk.yellow('No tasks found'));
        console.log(chalk.dim('  Run: musubi-tasks add <title>'));
        process.exit(0);
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'markdown') {
        result.tasks.forEach(t => {
          console.log(`### TASK-${t.id}: ${t.title}`);
          console.log(
            `**Priority**: ${t.priority} | **Points**: ${t.storyPoints} | **Status**: ${t.status}`
          );
          console.log();
        });
      } else {
        // Table format
        console.log(chalk.bold('Summary:'));
        console.log(chalk.dim(`  Total: ${result.summary.total} tasks`));
        console.log(
          chalk.dim(
            `  P0: ${result.summary.p0}, P1: ${result.summary.p1}, P2: ${result.summary.p2}, P3: ${result.summary.p3}`
          )
        );
        console.log(
          chalk.dim(
            `  Story Points: ${result.summary.totalPoints}, Hours: ${result.summary.totalHours}`
          )
        );
        console.log();

        result.tasks.forEach(t => {
          const priorityColor =
            {
              P0: chalk.red,
              P1: chalk.yellow,
              P2: chalk.blue,
              P3: chalk.gray,
            }[t.priority] || chalk.white;

          console.log(priorityColor(`  TASK-${t.id}: ${t.title}`));
          console.log(
            chalk.dim(
              `    ${t.priority} | ${t.storyPoints}pts | ${t.estimatedHours}h | ${t.status}`
            )
          );
        });
        console.log();
      }

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Update task status
program
  .command('update <id> <status>')
  .description('Update task status')
  .option('-f, --file <path>', 'Task breakdown file path')
  .action(async (id, status, options) => {
    try {
      console.log(chalk.bold(`\n📝 Updating TASK-${id}\n`));

      const generator = new TasksGenerator(process.cwd());
      const result = await generator.updateStatus(id, status, options.file);

      console.log(chalk.green('✓ Task updated:'));
      console.log(chalk.dim(`  TASK-${result.id}: ${result.title}`));
      console.log(chalk.dim(`  Status: ${result.oldStatus} → ${result.newStatus}`));
      console.log();

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Validate task breakdown
program
  .command('validate')
  .description('Validate task breakdown completeness')
  .option('-f, --file <path>', 'Specific task file')
  .option('-v, --verbose', 'Show detailed validation results')
  .action(async options => {
    try {
      console.log(chalk.bold('\n🔍 Validating Task Breakdown\n'));

      const generator = new TasksGenerator(process.cwd());
      const results = await generator.validate(options.file);

      if (results.passed) {
        console.log(chalk.green('✓ All tasks valid\n'));
      } else {
        console.log(chalk.red('✗ Validation failed\n'));
      }

      console.log(chalk.bold('Summary:'));
      console.log(chalk.dim(`  Total: ${results.total}`));
      console.log(chalk.green(`  Valid: ${results.valid}`));
      console.log(chalk.red(`  Invalid: ${results.invalid}`));
      console.log();

      if (results.violations.length > 0) {
        console.log(chalk.bold.red('Violations:'));
        results.violations.forEach(v => {
          console.log(chalk.red(`  • ${v}`));
        });
        console.log();
      }

      if (options.verbose && results.details) {
        console.log(chalk.bold('Details:'));
        results.details.forEach(d => {
          const icon = d.valid ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${icon} ${d.file}: ${d.message}`);
        });
        console.log();
      }

      process.exit(results.passed ? 0 : 1);
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Generate dependency graph
program
  .command('graph')
  .description('Generate task dependency graph')
  .option('-f, --file <path>', 'Task breakdown file path')
  .option('--format <type>', 'Output format (mermaid|dot)', 'mermaid')
  .action(async options => {
    try {
      console.log(chalk.bold('\n📊 Generating Dependency Graph\n'));

      const generator = new TasksGenerator(process.cwd());
      const result = await generator.generateGraph(options);

      console.log(chalk.green('✓ Dependency graph generated\n'));
      console.log(chalk.bold('Graph:'));
      console.log(chalk.cyan(result.graph));
      console.log();

      if (result.parallelGroups) {
        console.log(chalk.bold('Parallel Execution Groups:'));
        result.parallelGroups.forEach((group, i) => {
          console.log(chalk.dim(`  Group ${i + 1}: ${group.join(', ')}`));
        });
        console.log();
      }

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('✗ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
