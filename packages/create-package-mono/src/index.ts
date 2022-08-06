#!/usr/bin/env node

import { Command } from 'commander';
import { createMonoPackage } from './createMonoPackage';

export type CliOptions = {
  verbose: boolean;
  packageRoot: string;
};

/**
 * cpm [name]
 */
(async () => {
  const program = new Command();
  program.name('create-mono-package').description('CLI to create a package in this mono repo').version('0.0.1');

  program
    .command('add')
    .description('create mono package with given name')
    .argument('<package-name>', 'name of the mono package')
    .option('-v, --verbose', 'run with verbose logging', false)
    .option('-p, --package-root <package-root>', 'relative path from process to package root', 'packages')
    .action((packageName, options: CliOptions) => {
      createMonoPackage({
        packageName,
        verbose: options.verbose,
        packageRoot: options.packageRoot,
      });
    });

  program.parse();
})()
  .then(() => console.log('done'))
  .catch((error) => console.error(error));
module.exports = {};
