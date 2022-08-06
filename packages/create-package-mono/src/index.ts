#!/usr/bin/env node

import { Command } from 'commander';
import { createMonoPackage } from './create-mono-package';

export type CliOptions = {
  packageName: string;
  verbose: boolean;
  packageRoot: string;
  repoName: string | undefined;
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
    .option(
      '-n, --repo-name',
      'name of the mono repo (will scope package with @[repo-name]). Will try to interpret name from root package if not provided.',
      undefined
    )
    .option('-p, --package-root <package-root>', 'relative path from process to package root', 'packages')
    .action((packageName, options: CliOptions) => {
      createMonoPackage({
        packageName,
        verbose: options.verbose,
        packageRoot: options.packageRoot,
        repoName: options.repoName,
      });
    });

  program.parse();
})()
  .then(() => console.log('done'))
  .catch((error) => console.error(error));
module.exports = {};
