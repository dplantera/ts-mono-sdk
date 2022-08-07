#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const create_mono_repo_1 = require("./create-mono-repo");
const create_package_mono_1 = __importDefault(require("@dsp/create-package-mono"));
const CreateMonoRepo = new commander_1.Command();
CreateMonoRepo.name('crm').description('create a mono repo');
CreateMonoRepo.description('create mono repo with given name')
    .argument('<repo-name>', 'name of the mono repo')
    .argument('[destination]', 'relative path to the destined location for the mono repo', '.')
    .option('-v, --verbose', 'run with verbose logging', false)
    .action((repoName, destination, options) => {
    (0, create_mono_repo_1.createMonoRepo)({
        verbose: options.verbose,
        repoName,
        destination,
    });
});
const program = new commander_1.Command();
program.addCommand(CreateMonoRepo);
program.addCommand(create_package_mono_1.default);
program.parse(process.argv);
module.exports = {};
