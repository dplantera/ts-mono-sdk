#!/usr/bin/env node

import { Command } from 'commander';
import { createMonoRepo } from './create-mono-repo';
import CreateMonoPackage from '@dsp/create-package-mono';

export type CliOptions = {
  verbose: boolean;
  destination: string;
  repoName: string;
};

const CreateMonoRepo = new Command();
CreateMonoRepo.name('crm').description('create a mono repo');
CreateMonoRepo.description('create mono repo with given name')
  .argument('<repo-name>', 'name of the mono repo')
  .argument('[destination]', 'relative path to the destined location for the mono repo', '.')
  .option('-v, --verbose', 'run with verbose logging', false)
  .action((repoName, destination, options: CliOptions) => {
    createMonoRepo({
      verbose: options.verbose,
      repoName,
      destination,
    });
  });

const program = new Command();
program.addCommand(CreateMonoRepo);
program.addCommand(CreateMonoPackage);
program.parse(process.argv);
module.exports = {};
