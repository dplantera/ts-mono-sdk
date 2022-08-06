#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const create_mono_package_1 = require("./create-mono-package");
/**
 * cpm [name]
 */
(async () => {
    const program = new commander_1.Command();
    program.name('create-mono-package').description('CLI to create a package in this mono repo').version('0.0.1');
    program
        .command('add')
        .description('create mono package with given name')
        .argument('<package-name>', 'name of the mono package')
        .option('-v, --verbose', 'run with verbose logging', false)
        .option('-p, --package-root <package-root>', 'relative path from process to package root', 'packages')
        .action((packageName, options) => {
        (0, create_mono_package_1.createMonoPackage)({
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
